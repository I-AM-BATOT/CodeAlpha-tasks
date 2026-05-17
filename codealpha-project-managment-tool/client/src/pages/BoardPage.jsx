
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, createBoard } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/board/KanbanBoard';
import Spinner from '../components/common/Spinner';
import InviteMemberModal from '../components/project/InviteMemberModal';

export default function BoardPage() {
  const { projectId } = useParams();
  const dispatch      = useDispatch();
  const navigate      = useNavigate();

  const { boards, loading } = useSelector(s => s.tasks);
  const tasksByBoard        = useSelector(s => s.tasks.tasksByBoard);
  const { list }            = useSelector(s => s.projects);
  const project             = list.find(p => String(p.id) === String(projectId));

  const [addingCol, setAddingCol]   = useState(false);
  const [colTitle,  setColTitle]    = useState('');
  const [showInvite, setShowInvite] = useState(false);

  // Join this project's socket room — handles join/leave + reconnect automatically
  useSocket(Number(projectId));

  useEffect(() => {
    // Load projects list if user navigated directly via URL
    if (list.length === 0) dispatch(fetchProjects());
    // Always load fresh boards when entering a project
    dispatch(fetchBoards(projectId));
  }, [projectId]);

  const handleAddCol = async () => {
    if (!colTitle.trim()) return;
    await dispatch(createBoard({ title: colTitle, projectId: parseInt(projectId) }));
    setColTitle('');
    setAddingCol(false);
  };

  const totalTasks = Object.values(tasksByBoard).flat().length;

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col h-full">

      {/* ── Board header ── */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 text-sm border-none bg-none cursor-pointer"
        >
          ← Back
        </button>

        {project ? (
          <>
            <div
              className="w-7 h-7 rounded-lg shrink-0"
              style={{ background: project.color || '#534AB7' }}
            />
            <h2 className="font-semibold text-gray-800">{project.name}</h2>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              {boards.length} columns · {totalTasks} tasks
            </span>

            {/* Online indicator */}
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </>
        ) : (
          <h2 className="font-semibold text-gray-800">Project Board</h2>
        )}

        <div className="flex-1" />

        {/* Members / Invite button */}
        <button
          onClick={() => setShowInvite(true)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
        >
          👥 Members
          {project?.members?.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-1.5 font-medium">
              {project.members.length}
            </span>
          )}
        </button>

        {/* Add column button */}
        <button
          onClick={() => setAddingCol(true)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          + Add column
        </button>
      </div>

      {/* ── Kanban board ── */}
      <div className="flex-1 overflow-hidden">
        {boards.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-base font-medium mb-2">No columns yet</p>
            <p className="text-sm mb-6">Add your first column to start organizing tasks.</p>
            <button
              onClick={() => setAddingCol(true)}
              className="text-sm px-4 py-2 rounded-lg text-white font-medium"
              style={{ background: 'linear-gradient(135deg,#534AB7,#378ADD)' }}
            >
              + Add first column
            </button>
          </div>
        ) : (
          <KanbanBoard projectId={parseInt(projectId)} />
        )}
      </div>

      {/* ── Add column modal ── */}
      {addingCol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setAddingCol(false)}
        >
          <div
            className="bg-white rounded-xl p-5 w-72 border border-gray-200 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-medium mb-3">Add column</h3>
            <input
              autoFocus
              value={colTitle}
              onChange={e => setColTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  handleAddCol();
                if (e.key === 'Escape') setAddingCol(false);
              }}
              placeholder="e.g. In Progress"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCol}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg,#534AB7,#378ADD)' }}
              >
                Add
              </button>
              <button
                onClick={() => setAddingCol(false)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite members modal ── */}
      {showInvite && project && (
        <InviteMemberModal
          project={project}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}


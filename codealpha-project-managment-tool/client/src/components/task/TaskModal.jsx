import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask } from '../../store/slices/tasksSlice';
import { commentsAPI } from '../../api/comments.api';
import { fmtDate, isOverdue, priorityColor } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export default function TaskModal({ task: initialTask, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  // Always read fresh task from Redux store
  const tasksByBoard = useSelector(s => s.tasks.tasksByBoard);
  const task = Object.values(tasksByBoard).flat().find(t => t.id === initialTask.id) || initialTask;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate || '',
  });
  const [comments, setComments] = useState(task.comments || []);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch fresh comments when modal opens
  useEffect(() => {
    const loadComments = async () => {
      setLoadingComments(true);
      try {
        const { data } = await commentsAPI.getByTask(task.id);
        if (data?.data) setComments(data.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };
    loadComments();
  }, [task.id]);

  // Close on Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await dispatch(updateTask({ id: task.id, ...form }));
      setEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const { data } = await commentsAPI.create(task.id, commentText);
      if (data?.data) setComments(prev => [...prev, data.data]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await dispatch(deleteTask({ id: task.id, boardId: task.boardId }));
      onClose();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                autoFocus
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full text-lg font-medium outline-none border-b-2 border-purple-400 pb-1 bg-transparent"
              />
            ) : (
              <h2 className="text-lg font-semibold text-gray-800 leading-snug">{task.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <Button onClick={() => { setEditing(false); setForm({ title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate || '' }); }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            )}
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none border-none bg-none cursor-pointer ml-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-3 min-h-[400px]">

          {/* Left: Main content */}
          <div className="col-span-2 p-6 flex flex-col gap-6 border-r border-gray-100">

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
              {editing ? (
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Add a description..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-purple-400 resize-y bg-gray-50"
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {task.description || <em className="text-gray-300">No description added.</em>}
                </p>
              )}
            </div>

            {/* Labels */}
            {(task.labels || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Labels</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(task.labels || []).map(l => (
                    <span
                      key={l}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#534AB711', color: '#534AB7' }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Comments ({comments.length})
              </p>

              {loadingComments ? (
                <p className="text-sm text-gray-400">Loading comments...</p>
              ) : (
                <div className="flex flex-col gap-3 mb-4">
                  {comments.length === 0 && (
                    <p className="text-sm text-gray-300 italic">No comments yet. Be the first!</p>
                  )}
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar user={c.author || { id: c.userId, name: c.author?.name || 'User' }} size={30} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {c.author?.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-400">{fmtDate(c.createdAt)}</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 leading-relaxed">
                          {c.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="flex gap-2 items-center mt-2">
                <Avatar user={user} size={30} />
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="Write a comment... (Enter to post)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400 bg-gray-50"
                />
                <Button onClick={handleAddComment}>Post</Button>
              </div>
            </div>
          </div>

          {/* Right: Sidebar details */}
          <div className="p-5 flex flex-col gap-5 bg-gray-50 rounded-br-2xl">

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Priority</p>
              {editing ? (
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none w-full bg-white"
                >
                  {['critical', 'high', 'medium', 'low'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: priorityColor(task.priority) + '22', color: priorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Due Date</p>
              {editing ? (
                <input
                  type="date"
                  value={form.dueDate || ''}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none w-full bg-white"
                />
              ) : (
                <span
                  className="text-sm"
                  style={{ color: isOverdue(task.dueDate) ? '#E24B4A' : '#555' }}
                >
                  {task.dueDate ? (isOverdue(task.dueDate) ? '⚠ ' : '') + fmtDate(task.dueDate) : '—'}
                </span>
              )}
            </div>

            {/* Assignees */}
            {(task.assignees || []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assignees</p>
                <div className="flex flex-col gap-2">
                  {task.assignees.map(u => (
                    <div key={u.id} className="flex items-center gap-2">
                      <Avatar user={u} size={24} />
                      <span className="text-xs text-gray-600">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created By */}
            {task.creator && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Created By</p>
                <div className="flex items-center gap-2">
                  <Avatar user={task.creator} size={24} />
                  <span className="text-xs text-gray-600">{task.creator.name}</span>
                </div>
              </div>
            )}

            {/* Created At */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Created</p>
              <span className="text-xs text-gray-400">{fmtDate(task.createdAt)}</span>
            </div>

            {/* Task ID */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Task ID</p>
              <span className="text-xs text-gray-400 font-mono">#{task.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
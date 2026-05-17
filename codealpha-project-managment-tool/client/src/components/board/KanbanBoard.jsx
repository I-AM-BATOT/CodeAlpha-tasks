
import React, { useState, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import { moveTask, socketTaskMoved } from '../../store/slices/tasksSlice';
import BoardColumn from './BoardColumn';
import TaskCard from './TaskCard';
import TaskModal from '../task/TaskModal';
import NewTaskModal from '../task/NewTaskModal';

export default function KanbanBoard({ projectId }) {
  const dispatch = useDispatch();
  const { boards, tasksByBoard } = useSelector(s => s.tasks);
  const [activeTask, setActiveTask] = useState(null);
  const [addToBoard, setAddToBoard] = useState(null);
  const [draggingTask, setDraggingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(({ active }) => {
    const task = Object.values(tasksByBoard).flat().find(t => String(t.id) === String(active.id));
    setDraggingTask(task || null);
  }, [tasksByBoard]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setDraggingTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const toBoardId = String(over.id);
    const task = Object.values(tasksByBoard).flat().find(t => String(t.id) === taskId);

    if (!task) return;
    if (String(task.boardId) === toBoardId) return; // same board, no move

    // Optimistic update in the UI immediately (no waiting for server)
    dispatch(socketTaskMoved({ taskId, boardId: toBoardId }));

    // Then persist to server
    dispatch(moveTask({ id: task.id, boardId: toBoardId }));
  }, [tasksByBoard, dispatch]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex gap-3 items-start px-6 py-4 overflow-x-auto"
          style={{ minHeight: 'calc(100vh - 140px)' }}
        >
          {boards.map(board => (
            <BoardColumn
              key={board.id}
              board={board}
              tasks={tasksByBoard[String(board.id)] || []}
              onTaskClick={setActiveTask}
              onAddTask={() => setAddToBoard(board)}
            />
          ))}
        </div>

        {/* Shows a ghost card while dragging */}
        <DragOverlay>
          {draggingTask ? (
            <div style={{ opacity: 0.85, transform: 'rotate(2deg)' }}>
              <TaskCard task={draggingTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {activeTask && (
        <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}
      {addToBoard && (
        <NewTaskModal
          board={addToBoard}
          projectId={projectId}
          onClose={() => setAddToBoard(null)}
        />
      )}
    </>
  );
}

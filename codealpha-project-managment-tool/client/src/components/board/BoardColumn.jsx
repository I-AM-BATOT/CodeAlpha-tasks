import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const COLUMN_COLORS = {
  'Backlog':     { dot: '#9CA3AF', bg: '#F3F4F6' },
  'To Do':       { dot: '#F59E0B', bg: '#FFFBEB' },
  'In Progress': { dot: '#008B8B', bg: '#E0F4F4' },
  'Review':      { dot: '#6366F1', bg: '#EEF2FF' },
  'Done':        { dot: '#10B981', bg: '#ECFDF5' },
};

export default function BoardColumn({ board, tasks, onTaskClick, onAddTask }) {
  const { isOver, setNodeRef } = useDroppable({ id: String(board.id) });
  const colStyle = COLUMN_COLORS[board.title] || { dot: '#008B8B', bg: '#E0F4F4' };

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 280, maxWidth: 280,
        background: isOver ? '#E0F4F4' : '#F5F7FA',
        borderRadius: 16,
        border: `2px solid ${isOver ? '#008B8B' : '#E1E3E6'}`,
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 148px)',
        transition: 'all .15s ease',
        boxShadow: isOver ? '0 0 0 4px rgba(0,139,139,0.1)' : 'none',
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `2px solid ${isOver ? '#B2DFDF' : '#E1E3E6'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isOver ? '#008B8B' : colStyle.dot,
            transition: 'background .15s',
            boxShadow: `0 0 0 3px ${colStyle.bg}`,
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3A3B3C' }}>{board.title}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: colStyle.bg, color: colStyle.dot,
            borderRadius: 99, padding: '1px 8px',
            minWidth: 20, textAlign: 'center',
          }}>{tasks.length}</span>
        </div>
        <button
          onClick={onAddTask}
          style={{
            width: 26, height: 26, borderRadius: 8,
            border: '1.5px solid #E1E3E6',
            background: '#fff', cursor: 'pointer',
            fontSize: 16, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s', fontWeight: 400, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E0F4F4'; e.currentTarget.style.borderColor = '#008B8B'; e.currentTarget.style.color = '#008B8B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E1E3E6'; e.currentTarget.style.color = '#6B7280'; }}
          title="Add task"
        >+</button>
      </div>

      {/* Tasks */}
      <div style={{ padding: '10px 10px', overflowY: 'auto', flex: 1, position: 'relative' }}>
        {tasks.map(t => <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} />)}
        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '28px 16px',
            border: '2px dashed #E1E3E6', borderRadius: 12,
            margin: '4px 0',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6, opacity: 0.4 }}>📋</div>
            <p style={{ fontSize: 12, color: '#C4C7CC', fontWeight: 500 }}>Drop tasks here</p>
          </div>
        )}
      </div>

      {/* Add task footer */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid #E1E3E6' }}>
        <button
          onClick={onAddTask}
          style={{
            width: '100%', padding: '7px 12px',
            borderRadius: 8, border: '1.5px dashed #C4C7CC',
            background: 'none', cursor: 'pointer',
            fontSize: 12, color: '#9CA3AF', fontWeight: 500,
            transition: 'all .15s', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#008B8B'; e.currentTarget.style.color = '#008B8B'; e.currentTarget.style.background = '#E0F4F4'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#C4C7CC'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'none'; }}
        >
          + Add task
        </button>
      </div>
    </div>
  );
}
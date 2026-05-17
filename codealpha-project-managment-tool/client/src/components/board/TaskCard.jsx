import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { fmtDate, isOverdue, priorityColor, priorityBg, labelColor } from '../../utils/helpers';
import Avatar from '../common/Avatar';

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(task.id) });
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      ref={setNodeRef} {...attributes} {...listeners}
      onClick={onClick}
      className="animate-fadeIn"
      style={{
        background: '#fff', borderRadius: 12,
        border: '1.5px solid #E1E3E6',
        padding: '12px 14px', marginBottom: 8,
        cursor: 'pointer', opacity: isDragging ? 0 : 1,
        transition: 'all .15s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#008B8B';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,139,139,0.12)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E1E3E6';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Priority bar */}
      <div style={{
        position: 'absolute', left: 0, top: 8, bottom: 8,
        width: 3, borderRadius: '0 2px 2px 0',
        background: priorityColor(task.priority),
        opacity: 0.7,
      }} />

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {task.labels.map(l => {
            const c = labelColor(l);
            return (
              <span key={l} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: c.bg, color: c.text, fontWeight: 600,
                letterSpacing: 0.3,
              }}>{l}</span>
            );
          })}
        </div>
      )}

      {/* Title */}
      <p style={{
        fontSize: 13, fontWeight: 600, color: '#3A3B3C',
        lineHeight: 1.45, marginBottom: 10,
      }}>{task.title}</p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px',
          borderRadius: 99, background: priorityBg(task.priority),
          color: priorityColor(task.priority),
        }}>
          {task.priority}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.comments?.length > 0 && (
            <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
              💬 {task.comments.length}
            </span>
          )}
          {task.dueDate && (
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: overdue ? '#FF7F50' : '#6B7280',
              background: overdue ? '#FFF0EB' : '#F3F4F6',
              padding: '2px 7px', borderRadius: 6,
            }}>
              {overdue ? '⚠ ' : '📅 '}{fmtDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Assignees */}
      {task.assignees?.length > 0 && (
        <div style={{ display: 'flex', marginTop: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {task.assignees.slice(0, 3).map((u, i) => (
              <div key={u.id} style={{ marginLeft: i ? -8 : 0, zIndex: task.assignees.length - i }}>
                <Avatar user={u} size={24} />
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div style={{
                marginLeft: -8, width: 24, height: 24,
                borderRadius: '50%', background: '#E1E3E6',
                border: '2px solid #fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#6B7280',
              }}>+{task.assignees.length - 3}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
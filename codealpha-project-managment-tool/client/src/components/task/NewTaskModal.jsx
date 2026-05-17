import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../../store/slices/tasksSlice';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

export default function NewTaskModal({ board, projectId, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', labels: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const labels = form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [];
    await dispatch(createTask({ ...form, labels, boardId: board.id, projectId }));
    setLoading(false);
    onClose();
  };

  return (
    <Modal title={`Add task to "${board.title}"`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What needs to be done?" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 resize-y" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500">
              {['critical','high','medium','low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select>
          </div>
          <Input label="Due date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <Input label="Labels (comma separated)" value={form.labels} onChange={e => setForm({ ...form, labels: e.target.value })} placeholder="e.g. frontend, bug, ux" />
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create task'}</Button>
        </div>
      </div>
    </Modal>
  );
}
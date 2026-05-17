import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject } from '../../store/slices/projectsSlice';
import Modal from '../common/Modal';
import Button from '../common/Button';

const COLORS = [
  '#008B8B','#FF7F50','#6366F1','#10B981',
  '#F59E0B','#EC4899','#8B5CF6','#3B82F6',
];

export default function NewProjectModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    await dispatch(createProject(form));
    setLoading(false);
    onClose();
  };

  return (
    <Modal title="Create new project" subtitle="Set up your project board" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#3A3B3C', display: 'block', marginBottom: 5 }}>
            Project name <span style={{ color: '#FF7F50' }}>*</span>
          </label>
          <input
            autoFocus value={form.name}
            onChange={e => { setForm({ ...form, name: e.target.value }); setError(''); }}
            placeholder="e.g. Website Redesign"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              borderRadius: 10, border: `1.5px solid ${error ? '#FF7F50' : '#E1E3E6'}`,
              background: '#fff', color: '#3A3B3C', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color .15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#008B8B'; e.target.style.boxShadow = '0 0 0 3px rgba(0,139,139,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = error ? '#FF7F50' : '#E1E3E6'; e.target.style.boxShadow = 'none'; }}
          />
          {error && <p style={{ fontSize: 11, color: '#FF7F50', marginTop: 4 }}>⚠ {error}</p>}
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#3A3B3C', display: 'block', marginBottom: 5 }}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="What is this project about?"
            rows={3}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              borderRadius: 10, border: '1.5px solid #E1E3E6',
              background: '#fff', color: '#3A3B3C', outline: 'none',
              boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
              transition: 'border-color .15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#008B8B'; e.target.style.boxShadow = '0 0 0 3px rgba(0,139,139,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = '#E1E3E6'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#3A3B3C', display: 'block', marginBottom: 8 }}>Project color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button
                key={c} onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: c, border: 'none', cursor: 'pointer',
                  outline: form.color === c ? `3px solid ${c}` : 'none',
                  outlineOffset: 2,
                  transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all .15s',
                  boxShadow: form.color === c ? `0 4px 10px ${c}66` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: '#F5F7FA', borderRadius: 10, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid #E1E3E6',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `linear-gradient(135deg,${form.color},${form.color}BB)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>📁</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#3A3B3C' }}>{form.name || 'Project name'}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{form.description || 'No description'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
          <Button onClick={onClose} variant="ghost">Cancel</Button>
          <Button onClick={handleSubmit} variant="primary" disabled={loading}>
            {loading ? 'Creating...' : '+ Create project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
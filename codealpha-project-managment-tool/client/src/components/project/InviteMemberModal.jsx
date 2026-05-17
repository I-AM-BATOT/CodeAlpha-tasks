
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { projectsAPI } from '../../api/projects.api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

export default function InviteMemberModal({ project, onClose }) {
  const dispatch = useDispatch();
  const [email, setEmail]       = useState('');
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Load current members
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await projectsAPI.getMembers(project.id);
        setMembers(data.data || []);
      } catch {}
    };
    load();
  }, [project.id]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const { data } = await projectsAPI.invite(project.id, email.trim());
      setMembers(prev => [...prev, data.data]);
      setSuccess(`${data.data.name} was added to the project!`);
      setEmail('');
      dispatch(fetchProjects());
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemoving(userId);
    try {
      await projectsAPI.removeMember(project.id, userId);
      setMembers(prev => prev.filter(m => m.id !== userId));
      dispatch(fetchProjects());
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal title={`Members — ${project.name}`} onClose={onClose} width={460}>
      {/* Invite by email */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-600 block mb-2">
          Invite by email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
            placeholder="colleague@example.com"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
          />
          <Button variant="primary" onClick={handleInvite} disabled={loading}>
            {loading ? 'Inviting...' : 'Invite'}
          </Button>
        </div>
        {error   && <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-green-600 mt-2 bg-green-50 px-3 py-1.5 rounded-lg">{success}</p>}
        <p className="text-xs text-gray-400 mt-2">
          The user must already have a TaskFlow Pro account.
        </p>
      </div>

      {/* Current members list */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">
          Current members ({members.length})
        </p>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {members.map(m => {
            const role = m.ProjectMember?.role || m.project_member?.role || 'member';
            const isOwner = String(m.id) === String(project.ownerId);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <Avatar user={m} size={32} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isOwner
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isOwner ? 'owner' : role}
                  </span>
                  {!isOwner && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      disabled={removing === m.id}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-lg px-2 py-1 cursor-pointer bg-white transition-colors disabled:opacity-50"
                    >
                      {removing === m.id ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}


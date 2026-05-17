import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, deleteProject } from '../store/slices/projectsSlice';
import NewProjectModal from '../components/project/NewProjectModal';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector(s => s.projects);
  const { user } = useSelector(s => s.auth);
  const [showNew,    setShowNew]    = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => { dispatch(fetchProjects()); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProject(deletingId));
    setDeleting(false);
    setDeletingId(null);
  };

  if (loading) return <Spinner text="Loading your projects..." />;

  const totalTasks = list.reduce((a, p) => a + (p.boards?.length || 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(134deg, rgb(183 66 26) 0%, rgb(244 103 55) 60%, rgb(205 70 22) 100%)`,
        borderRadius: 20, padding: '28px 32px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: 80,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 500 }}>
              {GREETING()},
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              {user?.name} 👋
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              You have <strong style={{ color: '#fff' }}>{list.length} projects</strong> and <strong style={{ color: '#fff' }}>{totalTasks} boards</strong> active.
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            + New project
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { icon: '🗂', label: 'Total projects', value: list.length, color: '#008B8B', bg: '#E0F4F4' },
          { icon: '📋', label: 'Total boards',   value: totalTasks,  color: '#6366F1', bg: '#EEF2FF' },
          { icon: '👥', label: 'Collaborators',  value: [...new Set(list.flatMap(p => (p.members||[]).map(m=>m.id)))].length, color: '#FF7F50', bg: '#FFF0EB' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            border: '1.5px solid #E1E3E6',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: s.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#3A3B3C' }}>Your projects</h3>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Click any project to open its board</p>
        </div>
        <span style={{
          fontSize: 12, background: '#E0F4F4', color: '#008B8B',
          padding: '3px 10px', borderRadius: 99, fontWeight: 600,
        }}>{list.length} total</span>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', borderRadius: 16,
          border: '2px dashed #E1E3E6',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h4 style={{ fontSize: 17, fontWeight: 600, color: '#3A3B3C', marginBottom: 8 }}>No projects yet</h4>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Create your first project to start collaborating</p>
          <button
            onClick={() => setShowNew(true)}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg,#008B8B,#00AFAF)',
              color: '#fff', border: 'none', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,139,139,0.35)',
            }}
          >+ Create first project</button>
        </div>
      )}

      {/* Projects grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
        {list.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/projects/${p.id}`)}
            className="animate-fadeIn"
            style={{
              background: '#fff', borderRadius: 16,
              border: '1.5px solid #E1E3E6',
              cursor: 'pointer', overflow: 'hidden',
              transition: 'all .2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,139,139,0.12)';
              e.currentTarget.style.borderColor = '#008B8B';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = '#E1E3E6';
            }}
          >
            {/* Color header */}
            <div style={{
              height: 6,
              background: `linear-gradient(90deg, ${p.color || '#008B8B'}, ${p.color || '#008B8B'}99)`,
            }} />

            <div style={{ padding: '16px 18px' }}>
              {/* Delete button */}
              {String(p.ownerId) === String(user?.id) && (
                <button
                  onClick={e => { e.stopPropagation(); setDeletingId(p.id); }}
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 28, height: 28, borderRadius: 8,
                    border: '1.5px solid transparent',
                    background: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#C4C7CC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s', opacity: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FFF0EB'; e.currentTarget.style.borderColor = '#FF7F50'; e.currentTarget.style.color = '#FF7F50'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#C4C7CC'; }}
                  ref={el => {
                    if (el) {
                      const parent = el.closest('[data-project]') || el.parentElement?.parentElement;
                      if (parent) {
                        parent.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
                        parent.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
                      }
                    }
                  }}
                >🗑</button>
              )}

              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: `linear-gradient(135deg,${p.color || '#008B8B'},${p.color || '#008B8B'}BB)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, boxShadow: `0 4px 10px ${p.color || '#008B8B'}44`,
                }}>
                  📁
                </div>
                <div style={{ minWidth: 0, paddingRight: 24 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#3A3B3C', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || 'No description'}</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'boards', value: (p.boards||[]).length },
                  { label: 'members', value: (p.members||[]).length },
                ].map(s => (
                  <div key={s.label} style={{
                    flex: 1, background: '#F5F7FA', borderRadius: 8,
                    padding: '8px 10px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#008B8B' }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Members */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex' }}>
                  {(p.members||[]).slice(0,5).map((m,i) => (
                    <div key={m.id} style={{ marginLeft: i ? -8 : 0, zIndex: 10-i }}>
                      <Avatar user={m} size={28} />
                    </div>
                  ))}
                  {(p.members||[]).length > 5 && (
                    <div style={{
                      marginLeft: -8, width: 28, height: 28, borderRadius: '50%',
                      background: '#E1E3E6', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#6B7280',
                    }}>+{(p.members||[]).length - 5}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 11, color: '#008B8B', fontWeight: 600,
                  background: '#E0F4F4', padding: '3px 10px', borderRadius: 99,
                }}>Open →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} />}

      {/* Delete confirmation */}
      {deletingId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          background: 'rgba(30,40,50,0.5)', backdropFilter: 'blur(4px)',
        }} onClick={() => setDeletingId(null)}>
          <div className="animate-fadeIn" style={{
            background: '#fff', borderRadius: 20, padding: '28px 28px',
            maxWidth: 380, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: '#FFF0EB', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 14px',
              }}>⚠️</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#3A3B3C', marginBottom: 8 }}>Delete project?</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>
                This will permanently delete the project and all its boards, tasks, and comments. <strong style={{ color: '#FF7F50' }}>This cannot be undone.</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeletingId(null)} style={{
                flex: 1, padding: '11px', borderRadius: 10,
                border: '1.5px solid #E1E3E6', background: '#fff',
                fontSize: 13, fontWeight: 500, color: '#6B7280', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: '11px', borderRadius: 10,
                background: 'linear-gradient(135deg,#FF7F50,#E5623A)',
                border: 'none', fontSize: 13, fontWeight: 600,
                color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(255,127,80,0.35)',
              }}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
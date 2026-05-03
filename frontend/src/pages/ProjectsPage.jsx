import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const COLORS = ['#4f8ef7','#34d399','#a78bfa','#fb923c','#f87171','#fbbf24'];
const STATUS_COLORS = { active: 'var(--green)', 'on-hold': 'var(--yellow)', completed: 'var(--accent)', archived: 'var(--text-3)' };

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', deadline: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await api.post('/projects', form);
      onCreated(r.data.project);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs[0].msg : (err.response?.data?.message || 'Failed to create project'));
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Create Project</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="input" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input" placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'border var(--transition)' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loader" style={{ width: 14, height: 14 }} /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  const handleCreated = (p) => { setProjects([p, ...projects]); setShowCreate(false); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 4, fontSize: '0.88rem' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📁</div>
          <h3 style={{ color: 'var(--text-2)', fontWeight: 600 }}>No projects yet</h3>
          <p>Create your first project to get organized</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const total = Object.values(p.taskCounts || {}).reduce((a, b) => a + b, 0);
            const done = p.taskCounts?.done || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link to={`/projects/${p._id}`} key={p._id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', transition: 'all var(--transition)', borderTop: `3px solid ${p.color}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.97rem', lineHeight: 1.3 }}>{p.name}</h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, color: STATUS_COLORS[p.status], background: STATUS_COLORS[p.status] + '20', whiteSpace: 'nowrap' }}>
                      {p.status.replace('-', ' ')}
                    </span>
                  </div>
                  {p.description && <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginBottom: 14, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>}

                  {/* Progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 5 }}>
                      <span>{done}/{total} tasks done</span>
                      <span style={{ color: p.color, fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 99 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {(p.members || []).slice(0, 4).map((m, i) => (
                        <div key={m.user?._id || i} style={{
                          width: 24, height: 24, borderRadius: '50%', background: '#4f8ef7',
                          border: '2px solid var(--bg-2)', marginLeft: i > 0 ? -6 : 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700, color: '#fff'
                        }}>
                          {m.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      ))}
                      {p.members?.length > 4 && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginLeft: 6 }}>+{p.members.length - 4}</span>}
                    </div>
                    {p.deadline && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Due {format(new Date(p.deadline), 'MMM d, yyyy')}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}

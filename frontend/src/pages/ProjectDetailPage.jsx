import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TaskCard, TaskModal } from '../components/tasks/TaskCard';
import Avatar from '../components/shared/Avatar';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'var(--text-2)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--accent)' },
  { key: 'review', label: 'In Review', color: 'var(--yellow)' },
  { key: 'done', label: 'Done', color: 'var(--green)' },
];

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await api.post(`/projects/${projectId}/members`, { email, role });
      onAdded(r.data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-title">Add Team Member</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" placeholder="teammate@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loader" style={{ width: 14, height: 14 }} /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const isProjectAdmin = project && (
    project.owner?._id === user?._id ||
    project.members?.find(m => m.user?._id === user?._id)?.role === 'admin' ||
    isAdmin
  );

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project=${id}`)
    ]).then(([pr, tr]) => {
      setProject(pr.data.project);
      setTasks(tr.data.tasks);
    }).catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTaskSaved = (task) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === task._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = task; return n; }
      return [task, ...prev];
    });
    setSelectedTask(null);
    setShowCreateTask(false);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
    setSelectedTask(null);
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}" and all its tasks? This cannot be undone.`)) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="loader" /></div>;
  if (!project) return null;

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/projects" style={{ fontSize: '0.82rem', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>← Back to Projects</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{project.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isProjectAdmin && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddMember(true)}>+ Add Member</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>
              </>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateTask(true)}>+ Add Task</button>
          </div>
        </div>
        {project.description && <p style={{ color: 'var(--text-3)', marginTop: 8, fontSize: '0.88rem' }}>{project.description}</p>}

        {/* Members */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Team:</span>
          {project.members?.map((m, i) => (
            <div key={m.user?._id || i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Avatar name={m.user?.name} size={26} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{m.user?.name}</span>
              {m.role === 'admin' && <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 5px', fontSize: '0.65rem' }}>admin</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        <button className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>Board</button>
        <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>List</button>
      </div>

      {/* Kanban Board */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'start', overflowX: 'auto' }}>
          {COLUMNS.map(col => (
            <div key={col.key} style={{ minWidth: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-4)', color: 'var(--text-3)', padding: '1px 7px', borderRadius: 99 }}>
                  {tasksByStatus[col.key]?.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {tasksByStatus[col.key]?.map(task => (
                  <TaskCard key={task._id} task={task} onClick={() => setSelectedTask(task)} />
                ))}
                <button onClick={() => setShowCreateTask(true)} style={{
                  border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                  padding: '8px', color: 'var(--text-3)', background: 'transparent', cursor: 'pointer',
                  fontSize: '0.8rem', transition: 'all var(--transition)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
                >+ Add task</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} onClick={() => setSelectedTask(task)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontSize: '0.87rem', fontWeight: 500 }}>{task.title}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span></td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge priority-${task.priority}`}>{task.priority}</span></td>
                  <td style={{ padding: '12px 16px' }}>{task.assignee ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar name={task.assignee.name} size={22} /><span style={{ fontSize: '0.82rem' }}>{task.assignee.name}</span></div> : <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>—</span>}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: task.dueDate && isPastDate(task.dueDate) && task.status !== 'done' ? 'var(--red)' : 'var(--text-3)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontSize: '0.88rem' }}>No tasks yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(selectedTask || showCreateTask) && (
        <TaskModal
          task={selectedTask}
          projectId={id}
          onClose={() => { setSelectedTask(null); setShowCreateTask(false); }}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={p => { setProject(p); setShowAddMember(false); }}
        />
      )}
    </div>
  );
}

function isPastDate(date) {
  return new Date() > new Date(date);
}

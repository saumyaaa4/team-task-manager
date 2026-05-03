import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { format, isPast } from 'date-fns';
import Avatar from '../shared/Avatar';

const PRIORITY_OPTS = ['low', 'medium', 'high', 'urgent'];
const STATUS_OPTS = ['todo', 'in-progress', 'review', 'done'];

export function TaskModal({ task, projectId, onClose, onSaved, onDeleted }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    project: task?.project?._id || task?.project || projectId || '',
    assignee: task?.assignee?._id || task?.assignee || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    tags: task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('details');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(task?.comments || []);
  const [commentLoading, setCommentLoading] = useState(false);
  const [taskData, setTaskData] = useState(task);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects));
    api.get('/users').then(r => setUsers(r.data.users));
    if (task?._id) {
      api.get(`/tasks/${task._id}`).then(r => {
        setComments(r.data.task.comments || []);
        setTaskData(r.data.task);
      });
    }
  }, [task?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate;

      let saved;
      if (isNew) {
        const r = await api.post('/tasks', payload);
        saved = r.data.task;
      } else {
        const r = await api.put(`/tasks/${task._id}`, payload);
        saved = r.data.task;
      }
      onSaved(saved);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs[0].msg : (err.response?.data?.message || 'Failed to save task'));
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDeleted(task._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    try {
      const r = await api.post(`/tasks/${task._id}/comments`, { text: comment });
      setComments(r.data.comments);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally { setCommentLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="modal-title" style={{ margin: 0 }}>{isNew ? 'Create Task' : 'Edit Task'}</div>
          {!isNew && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>
          )}
          {isNew && <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>}
        </div>

        {!isNew && (
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Details</button>
            <button className={`tab ${tab === 'comments' ? 'active' : ''}`} onClick={() => setTab('comments')}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </button>
          </div>
        )}

        {(tab === 'details' || isNew) && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" placeholder="What needs to be done?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {!projectId && (
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="input" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="input" value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="input" placeholder="design, frontend, bug" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loader" style={{ width: 14, height: 14 }} /> : (isNew ? 'Create Task' : 'Save Changes')}
              </button>
            </div>
          </form>
        )}

        {tab === 'comments' && !isNew && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {comments.length === 0 && <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No comments yet. Be the first!</p>}
            {comments.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <Avatar name={c.user?.name} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.user?.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              </div>
            ))}
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input className="input" placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading}>Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskCard({ task, onClick }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
      padding: '12px 14px', cursor: 'pointer', transition: 'all var(--transition)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontWeight: 500, fontSize: '0.87rem', lineHeight: 1.4, flex: 1, marginRight: 8 }}>{task.title}</span>
        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
      </div>
      {task.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        {task.assignee ? <Avatar name={task.assignee.name} size={22} /> : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-4)', border: '1px dashed var(--border)' }} />}
        {task.dueDate && (
          <span style={{ fontSize: '0.72rem', color: isOverdue ? 'var(--red)' : 'var(--text-3)' }}>
            {isOverdue ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {task.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}

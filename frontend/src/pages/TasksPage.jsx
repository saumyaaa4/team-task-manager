import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { TaskCard, TaskModal } from '../components/tasks/TaskCard';

const STATUSES = ['', 'todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: '',
    overdue: searchParams.get('overdue') || '',
  });

  const fetchTasks = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.overdue) params.set('overdue', filters.overdue);
    api.get(`/tasks?${params}`)
      .then(r => setTasks(r.data.tasks))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleTaskSaved = (task) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === task._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = task; return n; }
      return [task, ...prev];
    });
    setSelectedTask(null);
    setShowCreate(false);
  };

  const handleTaskDeleted = (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    setSelectedTask(null);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Tasks</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 4, fontSize: '0.88rem' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="input" style={{ width: 'auto' }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          className={`btn ${filters.overdue ? 'btn-danger' : 'btn-ghost'} btn-sm`}
          onClick={() => setFilters({ ...filters, overdue: filters.overdue ? '' : 'true' })}
        >⚠ Overdue only</button>
        {(filters.status || filters.priority || filters.overdue) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', overdue: '' })}>Clear filters</button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><div className="loader" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>✅</div>
          <h3 style={{ color: 'var(--text-2)', fontWeight: 600 }}>No tasks found</h3>
          <p>{filters.status || filters.priority || filters.overdue ? 'Try adjusting your filters' : 'Create your first task to get started'}</p>
          {!filters.status && !filters.priority && !filters.overdue && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Task</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onClick={() => setSelectedTask(task)} />
          ))}
        </div>
      )}

      {(selectedTask || showCreate) && (
        <TaskModal
          task={selectedTask}
          onClose={() => { setSelectedTask(null); setShowCreate(false); }}
          onSaved={handleTaskSaved}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}

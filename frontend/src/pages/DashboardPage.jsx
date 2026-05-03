import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const STAT_CARDS = [
  { key: 'todo', label: 'To Do', color: 'var(--text-2)', bg: 'var(--bg-4)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  { key: 'review', label: 'In Review', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  { key: 'done', label: 'Done', color: 'var(--green)', bg: 'var(--green-dim)' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="loader" /></div>;

  const total = data?.total || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 4 }}>Here's what's happening across your projects</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {STAT_CARDS.map(s => (
          <div key={s.key} className="card" style={{ padding: '18px 20px', borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {data?.byStatus[s.key] || 0}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Overdue alert */}
        {data?.overdueTasks > 0 && (
          <div style={{
            gridColumn: '1 / -1', background: 'var(--red-dim)',
            border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius)', padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--red)', fontSize: '0.9rem' }}>
                  {data.overdueTasks} Overdue Task{data.overdueTasks > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>These tasks are past their due date</div>
              </div>
            </div>
            <Link to="/tasks?overdue=true" className="btn btn-danger btn-sm">View</Link>
          </div>
        )}

        {/* Progress chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-2)' }}>TASK OVERVIEW</h3>
          {total === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No tasks yet. Create a project to get started!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STAT_CARDS.map(s => {
                const count = data?.byStatus[s.key] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={s.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-2)' }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-2)' }}>BY PRIORITY</h3>
          {[
            { key: 'urgent', label: 'Urgent', color: 'var(--red)' },
            { key: 'high', label: 'High', color: 'var(--orange)' },
            { key: 'medium', label: 'Medium', color: 'var(--yellow)' },
            { key: 'low', label: 'Low', color: 'var(--text-3)' },
          ].map(p => (
            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{p.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: p.color }}>{data?.byPriority[p.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      {data?.recentTasks?.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-2)' }}>RECENT TASKS</h3>
            <Link to="/tasks" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.recentTasks.map(task => (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--radius-sm)', transition: 'background var(--transition)',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                <span style={{ flex: 1, fontSize: '0.87rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                {task.project && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{task.project.name}</span>
                )}
                {task.dueDate && (
                  <span style={{ fontSize: '0.75rem', color: isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'var(--red)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>Create your first project and start tracking tasks</p>
          <Link to="/projects" className="btn btn-primary">Create a Project</Link>
        </div>
      )}
    </div>
  );
}

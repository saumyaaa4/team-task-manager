import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/shared/Avatar';
import { format } from 'date-fns';

export default function UsersPage() {
  const { user: me, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const r = await api.put(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: r.data.user.role } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="loader" /></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Team</h1>
        <p style={{ color: 'var(--text-3)', marginTop: 4, fontSize: '0.88rem' }}>{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Member', 'Email', 'Role', 'Joined', ...(isAdmin ? ['Actions'] : [])].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.name} size={34} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {u.name}
                        {u._id === me._id && <span style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '1px 6px', borderRadius: 99, marginLeft: 6 }}>You</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-2)' }}>{u.email}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 99,
                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                    background: u.role === 'admin' ? 'var(--accent-dim)' : 'var(--bg-4)',
                    color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-2)',
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                  {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                {isAdmin && (
                  <td style={{ padding: '14px 20px' }}>
                    {u._id !== me._id ? (
                      <select
                        className="input"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

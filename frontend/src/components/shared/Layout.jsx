import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import Avatar from './Avatar';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⬛', exact: true },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'My Tasks', icon: '✅' },
  { to: '/users', label: 'Team', icon: '👥' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', background: 'var(--bg-2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '20px 12px', gap: 4,
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '8px 12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>TaskFlow</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            item.to === '/users' && !isAdmin ? null :
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontWeight: 500,
                color: isActive ? 'var(--text)' : 'var(--text-2)',
                background: isActive ? 'var(--bg-3)' : 'transparent',
                transition: 'all var(--transition)', textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px',
          borderTop: '1px solid var(--border)', marginTop: 8,
        }}>
          <Avatar name={user?.name} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} title="Logout">↪</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        <div style={{
          display: 'none', padding: '12px 20px', background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)', alignItems: 'center', justifyContent: 'space-between'
        }} className="mobile-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20 }}>☰</button>
          <span style={{ fontWeight: 800 }}>TaskFlow</span>
        </div>

        <div style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isAdmin = user?.role === 'admin';

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: 'Parkings',
      href: '/parkings',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    ...(!isAdmin
      ? [
          {
            name: 'My Entries',
            href: '/entries',
            icon: (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            name: 'Reports',
            href: '/reports',
            icon: (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-4m3 4v-4m3 4v-4m3 4v-4m3 4v-4m3 4v-4" />
              </svg>
            ),
          },
          {
            name: 'Users',
            href: '/users',
            icon: (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const pageTitles = {
    '': 'Dashboard',
    parkings: 'Parkings',
    entries: user?.role === 'admin' ? 'Entries' : 'My Entries',
    reports: 'Reports',
    users: 'Users',
  };
  const segment = location.pathname.split('/')[1] || '';
  const pageTitle = pageTitles[segment] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#c9e1eb' }}>
      <aside
        className={`${
          isSidebarOpen ? 'w-56' : 'w-16'
        } border-r transition-all duration-200 flex flex-col`}
        style={{ background: '#255169', borderColor: 'rgba(255,255,255,0.12)' }}
      >
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          {isSidebarOpen && (
            <span className="text-lg font-semibold text-white">XWZ Parking</span>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sm px-2 py-1 mx-auto cursor-pointer text-white/70 hover:text-white"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? '«' : '»'}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={!isSidebarOpen ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'rounded-full bg-white shadow-sm'
                    : 'rounded-lg text-white/75 hover:text-white hover:bg-white/10'
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
                style={active ? { color: '#255169' } : undefined}
              >
                {item.icon}
                {isSidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className={`${isSidebarOpen ? 'px-2 py-3' : 'py-3 text-center'}`}>
            {isSidebarOpen ? (
              <>
                <p className="text-sm font-medium truncate text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs truncate capitalize mt-0.5 text-white/60">
                  {user?.role?.replace('_', ' ')}
                </p>
              </>
            ) : (
              <span
                className="text-sm font-medium w-8 h-8 rounded-full flex items-center justify-center mx-auto text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-3 text-red-200 hover:bg-white/10 hover:text-red-100 ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ background: '#c9e1eb' }}>
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 pb-4 border-b" style={{ borderColor: 'rgba(37, 81, 105, 0.15)' }}>
            <h1 className="text-2xl font-bold capitalize text-page-title">{pageTitle}</h1>
            <p className="text-sm mt-1 text-page-subtitle">Parking management</p>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

import { useState, useEffect } from 'react';
import { parkingApi, entryApi, billingApi } from '../api/services';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardCard = ({ title, value, icon, iconBg }) => (
  <div className="stat-card">
    <div className="stat-card__icon" style={{ background: iconBg }}>
      {icon}
    </div>
    <div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{title}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState({
    totalParkings: 0,
    activeEntries: 0,
    totalRevenue: 0,
    availableSpaces: 0,
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [parkingsRes, entriesRes] = await Promise.all([
          parkingApi.getAll(1, 100),
          entryApi.getAll(1, 5),
        ]);

        const parkings = parkingsRes.data.data;
        let totalRevenue = 0;

        if (isAdmin) {
          const billsRes = await billingApi.getAll(1, 100);
          const bills = billsRes.data.data;
          totalRevenue = bills.reduce((acc, b) => acc + b.totalAmount, 0);
        }

        setStats({
          totalParkings: parkings.length,
          activeEntries: entriesRes.data.pagination.totalItems,
          totalRevenue,
          availableSpaces: parkings.reduce((acc, p) => acc + p.availableSpaces, 0),
        });
        setRecentEntries(entriesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-[14px] animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        <DashboardCard
          title="Total Parkings"
          value={stats.totalParkings}
          icon={
            <svg width="22" height="22" fill="none" stroke="#b45309" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          }
          iconBg="#e6f4f1"
        />
        <DashboardCard
          title={isAdmin ? 'Active Entries' : 'My Active Entries'}
          value={stats.activeEntries}
          icon={
            <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          iconBg="#fce8e8"
        />
        {isAdmin && (
          <DashboardCard
            title="Total Revenue"
            value={`$${stats.totalRevenue?.toLocaleString() ?? 0}`}
            icon={
              <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
            iconBg="#e6f4f1"
          />
        )}
        <DashboardCard
          title="Available Spaces"
          value={stats.availableSpaces}
          icon={
            <svg width="22" height="22" fill="none" stroke="#255169" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          iconBg="#dbeafe"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 app-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-page-title">
              {isAdmin ? 'Recent Entries' : 'My Recent Entries'}
            </h3>
            <Link to="/entries" className="text-sm font-medium" style={{ color: '#255169' }}>
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg app-card-inner"
                >
                  <div>
                    <p className="font-medium text-page-title">{entry.plateNumber}</p>
                    <p className="text-xs mt-0.5 text-page-subtitle">{entry.parkingName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-page-title">
                      {new Date(entry.entryDatetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span
                      className={`text-xs inline-block px-3 py-1 rounded-full font-medium mt-1 ${
                        entry.exitDatetime ? 'badge-green' : 'badge-indigo'
                      }`}
                    >
                      {entry.exitDatetime ? 'Exited' : 'Parking'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-sm text-page-subtitle">No recent entries.</p>
            )}
          </div>
        </div>

        <div className="app-card p-6">
          <h3 className="text-lg font-semibold mb-3 text-page-title">Overview</h3>
          <p className="text-sm mb-4 text-page-subtitle">
            Managing {stats.totalParkings} location{stats.totalParkings !== 1 ? 's' : ''}.
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg app-card-inner">
              <p className="text-xs mb-0.5 text-page-subtitle">Peak time</p>
              <p className="text-sm font-medium text-page-title">08:00 – 10:00</p>
            </div>
            <div className="p-3 rounded-lg app-card-inner">
              <p className="text-xs mb-0.5 text-page-subtitle">Busiest location</p>
              <p className="text-sm font-medium text-page-title">Kigali City Mall (KCM)</p>
            </div>
          </div>
          {isAdmin && (
            <Link to="/reports" className="block w-full mt-4 text-center btn-app-primary text-sm py-3 rounded-lg">
              Open reports
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

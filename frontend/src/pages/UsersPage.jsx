import { useState, useEffect } from 'react';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ROLE_LABELS = {
  admin: 'Administrator',
  parking_attendant: 'Parking Attendant',
};

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'parking_attendant',
    password: '',
  });

  const loadUsers = async (page = pagination.currentPage) => {
    try {
      const res = await authApi.getUsers(page);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'parking_attendant',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (formData.password.trim() && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      await authApi.updateUser(editingUser.id, payload);
      toast.success('User updated');
      setShowModal(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (!window.confirm('Delete this user? This cannot be undone.')) return;

    try {
      await authApi.deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="h-64 rounded-lg animate-shimmer" />;

  return (
    <div className="space-y-5">
      <p className="text-sm text-page-subtitle">
        Manage staff accounts and roles. New attendants can also register via the public signup page.
      </p>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-page-title">
                    {u.firstName} {u.lastName}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs" style={{ color: '#255169' }}>
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="text-page-subtitle">{u.email}</td>
                  <td>
                    <span className={u.role === 'admin' ? 'badge-indigo' : 'badge-amber'}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="text-page-subtitle">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-3 text-xs">
                      <button type="button" onClick={() => handleOpenModal(u)} className="btn-edit">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === currentUser?.id}
                        className="btn-delete disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-[#e2e8f0] flex justify-between items-center text-sm">
          <span className="text-page-subtitle">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
              }
              className="px-3 py-1 rounded-lg border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-30 text-page-title"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
              }
              className="px-3 py-1 rounded-lg border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-30 text-page-title"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg app-card p-6">
            <h3 className="text-lg font-semibold text-page-title mb-5">Edit user</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-page-subtitle">First name</label>
                  <input
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-app"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-page-subtitle">Last name</label>
                  <input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-app"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-app"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-app"
                >
                  <option value="parking_attendant">Parking Attendant</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">New password (optional)</label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current (min. 6 characters)"
                  className="input-app"
                />
                <p className="text-xs text-page-subtitle">Minimum 6 characters when changing password</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-[#e2e8f0] text-page-title text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-app-primary text-sm py-2.5">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

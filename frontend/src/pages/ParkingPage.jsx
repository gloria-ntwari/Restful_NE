import { useState, useEffect } from 'react';
import { parkingApi } from '../api/services';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ParkingPage = () => {
  const { user } = useAuth();
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParking, setEditingParking] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    availableSpaces: 0,
    location: '',
    feePerHour: 0,
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let cancelled = false;

    const loadParkings = async () => {
      try {
        const res = await parkingApi.getAll();
        if (!cancelled) {
          setParkings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch parkings', err);
        toast.error('Failed to load parkings');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadParkings();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshParkings = async () => {
    try {
      const res = await parkingApi.getAll();
      setParkings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch parkings', err);
      toast.error('Failed to load parkings');
    }
  };

  const handleOpenModal = (parking = null) => {
    if (parking) {
      setEditingParking(parking);
      setFormData({
        code: parking.code,
        name: parking.name,
        availableSpaces: parking.availableSpaces,
        location: parking.location,
        feePerHour: parking.feePerHour,
      });
    } else {
      setEditingParking(null);
      setFormData({
        code: '',
        name: '',
        availableSpaces: 0,
        location: '',
        feePerHour: 0,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParking) {
        await parkingApi.update(editingParking.id, formData);
        toast.success('Parking updated');
      } else {
        await parkingApi.create(formData);
        toast.success('Parking created');
      }
      setShowModal(false);
      refreshParkings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this parking?')) {
      try {
        await parkingApi.delete(id);
        toast.success('Parking deleted');
        refreshParkings();
      } catch (err) {

        toast.error('Failed to delete parking');
        console.error('Failed to delete parking', err);
      }
    }
  };

  if (loading) return <div className="animate-shimmer h-48 rounded-lg" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <input type="text" placeholder="Search parkings…" className="input-app w-full md:max-w-sm" />

        {isAdmin && (
          <button type="button" onClick={() => handleOpenModal()} className="btn-app-primary text-sm py-2.5 px-5">
            Add parking
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parkings.map((parking) => (
          <div key={parking.id} className="app-card p-5 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded app-card-inner text-page-subtitle">
                {parking.code}
              </span>
              {isAdmin && (
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => handleOpenModal(parking)} className="btn-edit">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(parking.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h4 className="text-lg font-semibold text-page-title">{parking.name}</h4>
            <p className="text-sm mt-1 text-page-subtitle">{parking.location}</p>

            <div className="mt-4 pt-3 space-y-2 text-sm border-t border-[#e2e8f0]">
              <div className="flex justify-between">
                <span className="text-page-subtitle">Hourly rate</span>
                <span className="font-medium text-page-title">${parking.feePerHour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-page-subtitle">Spaces</span>
                <span className="font-medium">
                  <span className={parking.availableSpaces < 5 ? 'text-red-600' : 'text-page-title'}>
                    {parking.availableSpaces}
                  </span>
                  <span className="text-page-subtitle"> / {parking.totalSpaces}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg app-card p-6">
            <h3 className="text-lg font-semibold mb-5 text-page-title">
              {editingParking ? 'Edit parking' : 'Add parking'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-page-subtitle">Code</label>
                  <input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="PKG-001"
                    className="input-app"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-page-subtitle">Available spaces</label>
                  <input
                    required
                    type="number"
                    value={formData.availableSpaces}
                    onChange={(e) =>
                      setFormData({ ...formData, availableSpaces: parseInt(e.target.value, 10) })
                    }
                    className="input-app"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-app"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Location</label>
                <input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-app"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Fee per hour ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.feePerHour}
                  onChange={(e) =>
                    setFormData({ ...formData, feePerHour: parseFloat(e.target.value) })
                  }
                  className="input-app"
                />
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
                  {editingParking ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingPage;

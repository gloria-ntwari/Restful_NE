import { useState, useEffect } from 'react';
import { entryApi, parkingApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const EntriesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [entries, setEntries] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ plateNumber: '', parkingId: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [entriesRes, parkingsRes] = await Promise.all([
          entryApi.getAll(pagination.currentPage),
          parkingApi.getAll(1, 100),
        ]);
        if (!cancelled) {
          setEntries(entriesRes.data.data);
          setPagination(entriesRes.data.pagination);
          setParkings(parkingsRes.data.data);
        }
      } catch (err) {
        toast.error('Failed to load data');
        console.error('Failed to fetch entries or parkings', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [pagination.currentPage]);

  const refreshData = async () => {
    try {
      const [entriesRes, parkingsRes] = await Promise.all([
        entryApi.getAll(pagination.currentPage),
        parkingApi.getAll(1, 100),
      ]);
      setEntries(entriesRes.data.data);
      setPagination(entriesRes.data.pagination);
      setParkings(parkingsRes.data.data);
    } catch (err) {
      toast.error('Failed to load data');
      console.error('Failed to fetch entries or parkings', err);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await entryApi.create(formData);
      toast.success('Entry registered');
      setSelectedTicket(res.data.ticket);
      setShowEntryModal(false);
      setShowTicketModal(true);
      refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register entry');
    }
  };

  const handleExit = async (id) => {
    try {
      await entryApi.exit(id);
      toast.success('Exit registered');
      refreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register exit');
    }
  };

  const handleShowTicket = async (id) => {
    try {
      const res = await entryApi.getTicket(id);
      setSelectedTicket(res.data.data);
      setShowTicketModal(true);
    } catch (err) {
      toast.error('Could not load ticket');
      console.error('Failed to fetch ticket', err);
    }
  };

  if (loading) return <div className="h-64 rounded-lg animate-shimmer" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <p className="text-sm text-page-subtitle">
          {isAdmin ? 'All vehicle entries and exits' : 'Your registered entries and exits'}
        </p>
        <button type="button" onClick={() => setShowEntryModal(true)} className="btn-app-primary text-sm py-2.5 px-5">
          Register entry
        </button>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Parking</th>
                <th>Entry</th>
                <th>Status</th>
                <th>Exit / charge</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-medium text-page-title">{entry.plateNumber}</td>
                  <td>
                    <p className="text-page-title">{entry.parkingName}</p>
                    <p className="text-xs text-page-subtitle">{entry.parkingCode}</p>
                  </td>
                  <td className="text-page-subtitle">
                    <p>{new Date(entry.entryDatetime).toLocaleDateString()}</p>
                    <p className="text-page-title">
                      {new Date(entry.entryDatetime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td>
                    <span className={entry.exitDatetime ? 'badge-green' : 'badge-indigo'}>
                      {entry.exitDatetime ? 'Exited' : 'Parking'}
                    </span>
                  </td>
                  <td>
                    {entry.exitDatetime ? (
                      <div>
                        <p className="text-page-title">
                          {new Date(entry.exitDatetime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-green-700">${entry.chargedAmount}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-page-subtitle">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 text-xs">
                      <button type="button" onClick={() => handleShowTicket(entry.id)} className="badge-indigo px-3 py-1 cursor-pointer border-0">
                        Ticket
                      </button>
                      {!entry.exitDatetime && (
                        <button type="button" onClick={() => handleExit(entry.id)} className="badge-red px-3 py-1 cursor-pointer border-0">
                          Exit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex justify-between items-center text-sm border-t border-[#e2e8f0]">
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
              className="px-3 py-1 rounded-lg border border-[#e2e8f0] text-sm text-page-title hover:bg-slate-50 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
              }
              className="px-3 py-1 rounded-lg border border-[#e2e8f0] text-sm text-page-title hover:bg-slate-50 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md app-card p-6">
            <h3 className="text-lg font-semibold text-page-title mb-5">Register entry</h3>
            <form onSubmit={handleEntrySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Plate number</label>
                <input
                  required
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })
                  }
                  placeholder="RAD 123 A"
                  className="input-app font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-page-subtitle">Parking</label>
                <select
                  required
                  value={formData.parkingId}
                  onChange={(e) => setFormData({ ...formData, parkingId: e.target.value })}
                  className="input-app"
                >
                  <option value="">Select location…</option>
                  {parkings
                    .filter((p) => p.availableSpaces > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.availableSpaces} spaces)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="flex-1 border border-[#e2e8f0] text-page-title text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-app-primary text-sm py-2.5">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-lg border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowTicketModal(false)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-900 text-sm"
            >
              Close
            </button>

            <div className="p-6 pb-4 text-center border-b border-dashed border-slate-200">
              <h4 className="text-lg font-bold" style={{ color: '#255169' }}>XWZ Parking</h4>
              <p className="text-xs text-slate-500 mt-1">Entry ticket</p>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-slate-400">Ticket number</p>
                <p className="font-mono font-semibold">
                  {selectedTicket.ticketNumber ||
                    `TKT-${selectedTicket.id?.substring(0, 8).toUpperCase()}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Plate</p>
                  <p className="font-semibold">{selectedTicket.plateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Code</p>
                  <p className="font-semibold">{selectedTicket.parkingCode}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p>
                    {selectedTicket.parkingName}, {selectedTicket.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Entry time</p>
                  <p>
                    {new Date(
                      selectedTicket.entryDateTime || selectedTicket.entryDatetime
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full btn-app-primary text-sm py-2.5 rounded-lg"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntriesPage;

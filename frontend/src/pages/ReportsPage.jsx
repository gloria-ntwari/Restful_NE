import { useState } from 'react';
import { reportApi } from '../api/services';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('outgoing');
  const [dates, setDates] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchReport = async (page = 1) => {
    setLoading(true);
    try {
      let res;
      if (reportType === 'outgoing') {
        res = await reportApi.getOutgoing(dates.start, dates.end, page);
        setSummary({ totalCharged: res.data.totalCharged });
      } else {
        res = await reportApi.getEntries(dates.start, dates.end, page);
        setSummary({ totalEntries: res.data.totalEntries });
      }
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Could not generate report');
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="app-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm text-page-subtitle">Report type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-app">
              <option value="outgoing">Outgoing (revenue)</option>
              <option value="entries">Entries (traffic)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-page-subtitle">Start date</label>
            <input
              type="date"
              value={dates.start}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
              className="input-app"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-page-subtitle">End date</label>
            <input
              type="date"
              value={dates.end}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
              className="input-app"
            />
          </div>

          <button type="button" onClick={() => fetchReport(1)} className="btn-app-primary text-sm py-2.5 px-5">
            Generate
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="stat-card__icon" style={{ background: '#e6f4f1' }}>
              <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="stat-card__value">
                {reportType === 'outgoing'
                  ? `$${summary.totalCharged.toLocaleString()}`
                  : `${summary.totalEntries} cars`}
              </div>
              <div className="stat-card__label">
                {reportType === 'outgoing' ? 'Total revenue' : 'Total entries'}
              </div>
            </div>
          </div>

          <div className="app-card p-5 flex items-center justify-end">
            <button
              type="button"
              onClick={() => toast.info('Export started…')}
              className="text-sm font-medium text-page-title border border-[#e2e8f0] py-2.5 px-5 rounded-lg hover:bg-slate-50"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-48 rounded-lg animate-shimmer" />
      ) : data.length > 0 ? (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Location</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium text-page-title">{row.plateNumber}</td>
                    <td>
                      <p className="text-page-title">{row.parkingName}</p>
                      <p className="text-xs text-page-subtitle">{row.parkingCode}</p>
                    </td>
                    <td className="text-page-subtitle">
                      {new Date(row.entryDatetime).toLocaleString()}
                    </td>
                    <td className="text-page-subtitle">
                      {row.exitDatetime ? new Date(row.exitDatetime).toLocaleString() : '—'}
                    </td>
                    <td className="text-right">
                      {row.chargedAmount > 0 ? (
                        <span className="text-green-700 font-medium">${row.chargedAmount}</span>
                      ) : (
                        <span className="text-page-subtitle">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[#e2e8f0] flex justify-between items-center text-sm">
            <span className="text-page-subtitle">Period results</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.currentPage === 1}
                onClick={() => fetchReport(pagination.currentPage - 1)}
                className="px-3 py-1 rounded-lg border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-30 text-page-title"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => fetchReport(pagination.currentPage + 1)}
                className="px-3 py-1 rounded-lg border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-30 text-page-title"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        summary && (
          <div className="app-card p-12 text-center">
            <p className="text-page-subtitle text-sm">No records for this date range.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ReportsPage;

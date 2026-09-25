import { useEffect, useState } from 'react';
import {
  getStats,
  getUsers,
  setUserSuspension,
  getAllListings,
  forceUpdateListingStatus,
  forceDeleteListing,
  getReports,
  updateReportStatus,
} from '../api/admin';

const TABS = ['Overview', 'Users', 'Listings', 'Reports'];

export default function AdminPage() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="page-container">
      <h1>Admin dashboard</h1>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? 'admin-tab active' : 'admin-tab'}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Users' && <UsersTab />}
      {tab === 'Listings' && <ListingsTab />}
      {tab === 'Reports' && <ReportsTab />}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <p className="auth-subtext">Loading...</p>;

  return (
    <div className="admin-stats-grid">
      <StatCard label="Total users" value={stats.totalUsers} />
      <StatCard label="Suspended users" value={stats.suspendedUsers} />
      <StatCard label="Active listings" value={stats.activeListings} />
      <StatCard label="Open reports" value={stats.openReports} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleSuspend = async (user) => {
    await setUserSuspension(user._id, !user.isSuspended);
    load();
  };

  if (loading) return <p className="auth-subtext">Loading...</p>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Campus</th>
          <th>Verified</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u._id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>{u.campus}</td>
            <td>{u.isVerified ? 'Yes' : 'No'}</td>
            <td>
              <span className={u.isSuspended ? 'admin-badge danger' : 'admin-badge ok'}>
                {u.isSuspended ? 'Suspended' : 'Active'}
              </span>
            </td>
            <td>
              {u.role !== 'admin' && (
                <button onClick={() => handleToggleSuspend(u)} className="auth-link-button">
                  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllListings().then(setListings).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (id) => {
    await forceUpdateListingStatus(id, 'removed');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    await forceDeleteListing(id);
    load();
  };

  if (loading) return <p className="auth-subtext">Loading...</p>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Seller</th>
          <th>Price</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {listings.map((l) => (
          <tr key={l._id}>
            <td>{l.title}</td>
            <td>{l.seller?.name}</td>
            <td>${l.price}</td>
            <td>
              <span className={l.status === 'removed' ? 'admin-badge danger' : 'admin-badge ok'}>
                {l.status}
              </span>
            </td>
            <td className="admin-actions">
              {l.status !== 'removed' && (
                <button onClick={() => handleRemove(l._id)} className="auth-link-button">
                  Remove
                </button>
              )}
              <button onClick={() => handleDelete(l._id)} className="auth-link-button">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getReports().then(setReports).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleResolve = async (id, status) => {
    await updateReportStatus(id, status);
    load();
  };

  if (loading) return <p className="auth-subtext">Loading...</p>;
  if (reports.length === 0) return <p className="auth-subtext">No reports yet.</p>;

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Reported by</th>
          <th>Target</th>
          <th>Reason</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r._id}>
            <td>{r.reporter?.name}</td>
            <td>{r.targetType} ({r.targetId})</td>
            <td>{r.reason}</td>
            <td>
              <span className={r.status === 'open' ? 'admin-badge danger' : 'admin-badge ok'}>
                {r.status}
              </span>
            </td>
            <td className="admin-actions">
              {r.status === 'open' && (
                <>
                  <button onClick={() => handleResolve(r._id, 'reviewed')} className="auth-link-button">
                    Mark reviewed
                  </button>
                  <button onClick={() => handleResolve(r._id, 'dismissed')} className="auth-link-button">
                    Dismiss
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
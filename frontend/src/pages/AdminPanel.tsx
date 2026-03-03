import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import type { Ad, AdStatus } from '@/types';

const ADMIN_PASSWORD = 'flyers@admin2026';

const STATUS_STYLES: Record<AdStatus, string> = {
  pending:  'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  expired:  'bg-stone-100 text-stone-500 border-stone-300',
};

const CATEGORY_LABELS: Record<string, string> = {
  'real-estate': 'Real Estate',
  jobs:          'Employment',
  services:      'Services',
  matrimonial:   'Matrimonial',
  automobiles:   'Automobiles',
};

interface Stats {
  by_status: { pending?: number; approved?: number; rejected?: number };
  total_ads: number;
  total_revenue: number;
  premium_ads: number;
  today_count?: number;
  by_category?: { category: string; count: number; revenue: number }[];
}

// ── Login Gate ──────────────────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white border border-stone-200 p-8">
        <div className="h-0.5 bg-stone-900 -mx-8 mb-6" />
        <h1 className="font-serif text-2xl font-black text-stone-900 mb-1">
          Flyers<span className="text-stone-300 font-light">.</span>
        </h1>
        <p className="text-xs text-stone-400 font-mono tracking-widest uppercase mb-6">
          Admin Panel
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-stone-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-900 bg-white"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-stone-900 text-white text-xs font-bold tracking-widest uppercase py-2.5 hover:bg-stone-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className={`bg-white border p-5 ${accent || 'border-stone-200'}`}>
      <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">{label}</p>
      <p className="font-mono text-2xl font-bold text-stone-900">{value}</p>
      {sub && <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Ad Row ──────────────────────────────────────────────────────────────────
function AdRow({ ad, onStatusChange, onDelete }: {
  ad: Ad;
  onStatusChange: (id: number, status: AdStatus) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: AdStatus) => {
    setUpdating(true);
    await onStatusChange(ad.id, status);
    setUpdating(false);
  };

  return (
    <div className={`bg-white border-b border-stone-100 transition-colors ${
      ad.status === 'pending' ? 'border-l-4 border-l-amber-400' :
      ad.status === 'rejected' ? 'border-l-4 border-l-red-400' :
      'border-l-4 border-l-transparent'
    }`}>
      {/* Main row */}
      <div className="grid grid-cols-[90px_100px_1fr_120px_90px_100px_110px] items-center gap-2 px-4 py-3">
        {/* Status */}
        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border rounded-sm text-center ${STATUS_STYLES[ad.status]}`}>
          {ad.status}
        </span>

        {/* Category */}
        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 truncate">
          {CATEGORY_LABELS[ad.category] || ad.category}
        </span>

        {/* Title — clickable to expand */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-left text-sm font-medium text-stone-900 hover:text-stone-600 truncate"
        >
          {ad.is_premium && <span className="text-amber-500 mr-1">★</span>}
          {ad.title}
        </button>

        {/* Phone */}
        <span className="text-xs font-mono text-stone-500 truncate">{ad.contact_phone}</span>

        {/* Cost */}
        <span className="text-xs font-mono font-bold text-stone-700 text-right">
          Rs. {ad.total_cost.toLocaleString()}
        </span>

        {/* Date */}
        <span className="text-[11px] text-stone-400 text-right">
          {new Date(ad.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}
        </span>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1">
          {ad.status !== 'approved' && (
            <button
              onClick={() => handleStatus('approved')}
              disabled={updating}
              title="Approve"
              className="text-[11px] font-bold px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors rounded-sm"
            >
              ✓
            </button>
          )}
          {ad.status !== 'rejected' && (
            <button
              onClick={() => handleStatus('rejected')}
              disabled={updating}
              title="Reject"
              className="text-[11px] font-bold px-2.5 py-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors rounded-sm"
            >
              ✕
            </button>
          )}
          {ad.status === 'rejected' && (
            <button
              onClick={() => handleStatus('pending')}
              disabled={updating}
              title="Move to pending"
              className="text-[11px] font-bold px-2.5 py-1 bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors rounded-sm"
            >
              ↺
            </button>
          )}
          <button
            onClick={() => onDelete(ad.id)}
            title="Delete"
            className="text-[11px] font-bold px-2.5 py-1 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-sm"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 bg-stone-50 border-t border-stone-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Location</p>
              <p className="text-stone-700">{ad.location || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Email</p>
              <p className="text-stone-700">{ad.contact_email || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Words</p>
              <p className="text-stone-700">{ad.word_count} words</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-0.5">Premium</p>
              <p className="text-stone-700">{ad.is_premium ? 'Yes ★' : 'No'}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">Description</p>
            <p className="text-xs text-stone-600 leading-relaxed">{ad.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed]           = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [ads, setAds]                 = useState<Ad[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 20;

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      // Admin sees all statuses — only filter when explicitly selected
      if (statusFilter !== 'all') params.status = statusFilter;
      else params.status = 'all'; // tell backend to skip default approved filter
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const res = await api.get('/ads', { params });
      setAds(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Fetch ads failed:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/ads/stats');
      setStats(res.data);
    } catch {
      // handle
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchAds();
      fetchStats();
    }
  }, [authed, fetchAds, fetchStats]);

  const handleStatusChange = async (id: number, status: AdStatus) => {
    try {
      const res = await api({
        method: 'PATCH',
        url: `/ads/${id}/status`,
        data: { status },
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 200) {
        setAds(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        fetchStats();
      }
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ad permanently?')) return;
    try {
      await api.delete(`/ads/${id}`);
      setAds(prev => prev.filter(a => a.id !== id));
      setTotal(t => t - 1);
      fetchStats();
    } catch {
      alert('Failed to delete ad');
    }
  };

  const filteredAds = ads.filter(ad =>
    search === '' ||
    ad.title.toLowerCase().includes(search.toLowerCase()) ||
    ad.contact_phone.includes(search) ||
    ad.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / LIMIT);

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">

      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="h-[3px] bg-stone-900" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-black text-stone-900 leading-none">
              Flyers<span className="text-stone-300 font-light">.</span>
              <span className="text-sm font-normal text-stone-400 ml-2">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {stats && (stats.by_status?.pending ?? 0) > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {stats.by_status?.pending ?? 0} pending
              </span>
            )}
            <a
              href="/"
              className="text-xs text-stone-400 hover:text-stone-900 font-mono uppercase tracking-wider transition-colors"
            >
              ← Public Site
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}
              className="text-xs text-stone-400 hover:text-red-600 font-mono uppercase tracking-wider transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatCard label="Total Ads"  value={stats.total_ads} />
            <StatCard label="Pending"    value={stats.by_status?.pending  ?? 0} accent="border-amber-300" />
            <StatCard label="Approved"   value={stats.by_status?.approved ?? 0} accent="border-emerald-300" />
            <StatCard label="Rejected"   value={stats.by_status?.rejected ?? 0} accent="border-red-300" />
            <StatCard label="Premium"    value={stats.premium_ads} sub="listings" />
            <StatCard
              label="Revenue"
              value={`Rs. ${Number(stats.total_revenue).toLocaleString()}`}
              sub="approved ads"
              accent="border-stone-900"
            />
          </div>
        )}

        {/* Category revenue breakdown */}
        {stats?.by_category && stats?.by_category.length > 0 && (
          <div className="bg-white border border-stone-200 p-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">Revenue by Section</p>
            <div className="flex flex-wrap gap-4">
              {stats.by_category.map(c => (
                <div key={c.category} className="text-xs">
                  <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                    {CATEGORY_LABELS[c.category] || c.category}
                  </span>
                  <span className="text-stone-400 mx-1">·</span>
                  <span className="font-mono text-stone-900">{c.count} ads</span>
                  <span className="text-stone-400 mx-1">·</span>
                  <span className="font-mono text-emerald-700">Rs. {c.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-stone-200">
          <div className="flex flex-wrap items-center gap-0 border-b border-stone-100">
            {/* Status tabs */}
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`text-[11px] font-bold tracking-widest uppercase px-4 py-3 border-b-2 transition-all ${
                  statusFilter === s
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                {s === 'all' ? 'All' : s}
                {s === 'pending' && stats && (stats.by_status?.pending ?? 0) > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full">
                    {stats.by_status?.pending ?? 0}
                  </span>
                )}
              </button>
            ))}

            <div className="flex-1" />

            {/* Search */}
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search title, phone, description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-stone-200 px-3 py-1.5 text-xs focus:outline-none focus:border-stone-900 w-64"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="border-l border-stone-200 px-3 py-2 text-xs focus:outline-none bg-white text-stone-700 h-full"
            >
              <option value="all">All Categories</option>
              <option value="real-estate">Real Estate</option>
              <option value="jobs">Employment</option>
              <option value="services">Services</option>
              <option value="matrimonial">Matrimonial</option>
              <option value="automobiles">Automobiles</option>
            </select>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[90px_100px_1fr_120px_90px_100px_110px] items-center gap-2 px-4 py-2 bg-stone-50 border-b border-stone-100 text-[10px] font-bold tracking-widest uppercase text-stone-400">
            <span>Status</span>
            <span>Category</span>
            <span>Title</span>
            <span>Phone</span>
            <span className="text-right">Cost</span>
            <span className="text-right">Date</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Ads list */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-stone-400 font-mono tracking-widest uppercase">
              Loading…
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-xs text-stone-400">
              No ads found
            </div>
          ) : (
            <div>
              {filteredAds.map(ad => (
                <AdRow
                  key={ad.id}
                  ad={ad}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50">
              <span className="text-xs text-stone-400 font-mono">{total} total ads</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-xs px-3 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-xs font-mono text-stone-500 px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-xs px-3 py-1.5 border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
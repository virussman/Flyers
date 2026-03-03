import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { Ad } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
  expired:  'bg-stone-100 text-stone-500 border border-stone-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  'real-estate': 'Real Estate',
  jobs:          'Employment',
  services:      'Services',
  matrimonial:   'Matrimonial',
  automobiles:   'Automobiles',
};

interface MyAdsDashboardProps {
  onClose: () => void;
}

export default function MyAdsDashboard({ onClose }: MyAdsDashboardProps) {
  const { user, logout } = useAuth();
  const [ads, setAds]       = useState<Ad[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ads/mine');
      setAds(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/ads/${id}`);
      setAds(prev => prev.filter(a => a.id !== id));
      setTotal(t => t - 1);
      setDeleteConfirm(null);
    } catch {
      alert('Failed to delete ad');
    }
  };

  const filteredAds = ads.filter(ad => tab === 'all' || ad.status === tab);

  const counts = {
    all:      ads.length,
    pending:  ads.filter(a => a.status === 'pending').length,
    approved: ads.filter(a => a.status === 'approved').length,
    rejected: ads.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl mx-0 sm:mx-4 max-h-[90vh] flex flex-col shadow-2xl sm:max-h-[80vh]">
        {/* Top rule */}
        <div className="h-[3px] bg-stone-900 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-serif text-lg font-black text-stone-900">My Ads</h2>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">
              {user?.phone} · {total} total ads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { logout(); onClose(); }}
              className="text-[11px] text-stone-400 hover:text-red-600 font-mono uppercase tracking-wider transition-colors"
            >
              Logout
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-900 transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 shrink-0 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 border-b-2 transition-all ${
                tab === t
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              {t} {counts[t] > 0 && (
                <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  t === 'pending' ? 'bg-amber-100 text-amber-800' :
                  t === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  t === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-stone-100 text-stone-600'
                }`}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Ads list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-stone-400 font-mono tracking-widest uppercase">
              Loading…
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-stone-500">
                {tab === 'all' ? "You haven't posted any ads yet" : `No ${tab} ads`}
              </p>
              {tab === 'all' && (
                <p className="text-xs text-stone-400">
                  Post your first ad from the homepage
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredAds.map(ad => (
                <div key={ad.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Status + category */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${STATUS_STYLES[ad.status]}`}>
                          {ad.status}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">
                          {CATEGORY_LABELS[ad.category] || ad.category}
                        </span>
                        {ad.is_premium && (
                          <span className="text-[10px] font-bold text-amber-600">★ Premium</span>
                        )}
                      </div>
                      {/* Title */}
                      <h3 className="font-semibold text-stone-900 text-sm truncate">{ad.title}</h3>
                      {/* Description */}
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{ad.description}</p>
                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400 font-mono">
                        {ad.location && <span>📍 {ad.location}</span>}
                        <span>Rs. {ad.total_cost.toLocaleString()}</span>
                        <span>{new Date(ad.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {/* Pending note */}
                      {ad.status === 'pending' && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 mt-2 border border-amber-200">
                          ⏳ Under review — will appear once approved
                        </p>
                      )}
                      {ad.status === 'rejected' && (
                        <p className="text-[11px] text-red-700 bg-red-50 px-2 py-1 mt-2 border border-red-200">
                          ✕ Rejected — contact support if you think this is a mistake
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {deleteConfirm === ad.id ? (
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] text-red-600 font-bold text-center">Delete?</p>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="text-[10px] px-3 py-1 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-[10px] px-3 py-1 border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(ad.id)}
                          className="text-[10px] px-3 py-1.5 border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 shrink-0">
          <p className="text-[10px] text-stone-400 text-center">
            Ads are reviewed within 24 hours · Contact support for any issues
          </p>
        </div>
      </div>
    </div>
  );
}
// FILE: frontend/src/pages/MyAdsDashboard.tsx

import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { Ad, Notice, LostFoundReport } from '@/types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  active:   'bg-emerald-100 text-emerald-800 border border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
  resolved: 'bg-stone-100 text-stone-500 border border-stone-200',
  expired:  'bg-stone-100 text-stone-500 border border-stone-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  'real-estate': 'Real Estate', jobs: 'Employment',
  services: 'Services', matrimonial: 'Matrimonial', automobiles: 'Automobiles',
};

const NOTICE_TYPE_LABELS: Record<string, string> = {
  samvedana: 'समवेदना', shraddhanjali: 'श्रद्धाञ्जली',
  bibaha: 'विवाह', bratabandha: 'व्रतबन्ध',
  graduation: 'उत्तीर्ण', birth: 'जन्म', business: 'व्यापार',
};

interface MyAdsDashboardProps { onClose: () => void; }

type Section = 'ads' | 'notices' | 'lostfound';

export default function MyAdsDashboard({ onClose }: MyAdsDashboardProps) {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('ads');

  // Ads
  const [ads, setAds]             = useState<Ad[]>([]);
  const [adsTotal, setAdsTotal]   = useState(0);
  const [adsLoading, setAdsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [adTab, setAdTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Notices
  const [notices, setNotices]             = useState<Notice[]>([]);
  const [noticesTotal, setNoticesTotal]   = useState(0);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticeTab, setNoticeTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Lost & Found
  const [lfReports, setLfReports]         = useState<LostFoundReport[]>([]);
  const [lfTotal, setLfTotal]             = useState(0);
  const [lfLoading, setLfLoading]         = useState(false);
  const [lfTab, setLfTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => { fetchMyAds(); }, []);
  useEffect(() => { if (section === 'notices' && notices.length === 0) fetchMyNotices(); }, [section]);
  useEffect(() => { if (section === 'lostfound' && lfReports.length === 0) fetchMyLostFound(); }, [section]);

  const fetchMyAds = async () => {
    setAdsLoading(true);
    try {
      const res = await api.get('/ads/mine');
      setAds(res.data.data || []);
      setAdsTotal(res.data.total || 0);
    } catch { /**/ } finally { setAdsLoading(false); }
  };

  const fetchMyNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await fetch(`${API}/notices/mine`, { headers: authHeaders() });
      const data = await res.json();
      setNotices(data.notices || []);
      setNoticesTotal(data.total || 0);
    } catch { /**/ } finally { setNoticesLoading(false); }
  };

  const fetchMyLostFound = async () => {
    setLfLoading(true);
    try {
      const res = await fetch(`${API}/lost-found/mine`, { headers: authHeaders() });
      const data = await res.json();
      setLfReports(data.reports || []);
      setLfTotal(data.total || 0);
    } catch { /**/ } finally { setLfLoading(false); }
  };

  const handleDeleteAd = async (id: number) => {
    try {
      await api.delete(`/ads/${id}`);
      setAds(prev => prev.filter(a => a.id !== id));
      setAdsTotal(t => t - 1);
      setDeleteConfirm(null);
    } catch { alert('Failed to delete ad'); }
  };

  const filteredAds      = ads.filter(a => adTab === 'all' || a.status === adTab);
  const filteredNotices  = notices.filter(n => noticeTab === 'all' || n.notice_status === noticeTab);
  const filteredLf       = lfReports.filter(r => lfTab === 'all' || r.status === lfTab);

  const adCounts = {
    all: ads.length,
    pending:  ads.filter(a => a.status === 'pending').length,
    approved: ads.filter(a => a.status === 'approved').length,
    rejected: ads.filter(a => a.status === 'rejected').length,
  };
  const noticeCounts = {
    all: notices.length,
    pending:  notices.filter(n => n.notice_status === 'pending').length,
    approved: notices.filter(n => n.notice_status === 'approved').length,
    rejected: notices.filter(n => n.notice_status === 'rejected').length,
  };
  const lfCounts = {
    all: lfReports.length,
    pending:  lfReports.filter(r => r.status === 'pending').length,
    active:   lfReports.filter(r => r.status === 'active').length,
    rejected: lfReports.filter(r => r.status === 'rejected').length,
  };

  const tabCls = (active: boolean) =>
    `shrink-0 text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 border-b-2 transition-all ${
      active ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-700'
    }`;

  const sectionCls = (active: boolean) =>
    `flex-1 text-xs font-bold tracking-widest uppercase py-3 border-b-2 transition-all ${
      active ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
    }`;

  const countBadge = (n: number, t: string) => n > 0 ? (
    <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
      t === 'pending' ? 'bg-amber-100 text-amber-800'
      : t === 'approved' || t === 'active' ? 'bg-emerald-100 text-emerald-800'
      : t === 'rejected' ? 'bg-red-100 text-red-800'
      : 'bg-stone-100 text-stone-600'
    }`}>{n}</span>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl mx-0 sm:mx-4 max-h-[90vh] flex flex-col shadow-2xl sm:max-h-[80vh]">
        <div className="h-[3px] bg-stone-900 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-serif text-lg font-black text-stone-900">My Posts</h2>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">
              {user?.phone} · {adsTotal} ads · {noticesTotal} notices · {lfTotal} lost &amp; found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { logout(); onClose(); }} className="text-[11px] text-stone-400 hover:text-red-600 font-mono uppercase tracking-wider transition-colors">
              Logout
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors text-xl leading-none">×</button>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-stone-200 shrink-0">
          <button onClick={() => setSection('ads')} className={sectionCls(section === 'ads')}>
            Ads {adsTotal > 0 && <span className="ml-1 bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded-full">{adsTotal}</span>}
          </button>
          <button onClick={() => setSection('notices')} className={sectionCls(section === 'notices')}
            style={{ fontFamily: section === 'notices' ? "'Noto Sans Devanagari',sans-serif" : undefined }}>
            सूचना {noticesTotal > 0 && <span className="ml-1 bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded-full">{noticesTotal}</span>}
          </button>
          <button onClick={() => setSection('lostfound')} className={sectionCls(section === 'lostfound')}>
            Lost &amp; Found {lfTotal > 0 && <span className="ml-1 bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded-full">{lfTotal}</span>}
          </button>
        </div>

        {/* ── ADS ── */}
        {section === 'ads' && (
          <>
            <div className="flex border-b border-stone-100 shrink-0 overflow-x-auto">
              {(['all','pending','approved','rejected'] as const).map(t => (
                <button key={t} onClick={() => setAdTab(t)} className={tabCls(adTab === t)}>
                  {t}{countBadge(adCounts[t], t)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {adsLoading ? (
                <div className="flex items-center justify-center py-16 text-xs text-stone-400 font-mono tracking-widest uppercase">Loading…</div>
              ) : filteredAds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm text-stone-500">{adTab === 'all' ? "No ads posted yet" : `No ${adTab} ads`}</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredAds.map(ad => (
                    <div key={ad.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${STATUS_STYLES[ad.status]}`}>{ad.status}</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{CATEGORY_LABELS[ad.category] || ad.category}</span>
                            {ad.is_premium && <span className="text-[10px] font-bold text-amber-600">★ Premium</span>}
                          </div>
                          <h3 className="font-semibold text-stone-900 text-sm truncate">{ad.title}</h3>
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{ad.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400 font-mono">
                            {ad.location && <span>📍 {ad.location}</span>}
                            <span>Rs. {ad.total_cost.toLocaleString()}</span>
                            <span>{new Date(ad.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          {ad.status === 'pending'  && <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 mt-2 border border-amber-200">⏳ Under review</p>}
                          {ad.status === 'rejected' && <p className="text-[11px] text-red-700 bg-red-50 px-2 py-1 mt-2 border border-red-200">✕ Rejected — contact support</p>}
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {deleteConfirm === ad.id ? (
                            <div className="flex flex-col gap-1">
                              <p className="text-[10px] text-red-600 font-bold text-center">Delete?</p>
                              <button onClick={() => handleDeleteAd(ad.id)} className="text-[10px] px-3 py-1 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-[10px] px-3 py-1 border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(ad.id)} className="text-[10px] px-3 py-1.5 border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 transition-colors">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── NOTICES ── */}
        {section === 'notices' && (
          <>
            <div className="flex border-b border-stone-100 shrink-0 overflow-x-auto">
              {(['all','pending','approved','rejected'] as const).map(t => (
                <button key={t} onClick={() => setNoticeTab(t)} className={tabCls(noticeTab === t)}>
                  {t}{countBadge(noticeCounts[t], t)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {noticesLoading ? (
                <div className="flex items-center justify-center py-16 text-xs text-stone-400 font-mono tracking-widest uppercase">Loading…</div>
              ) : filteredNotices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm text-stone-500">{noticeTab === 'all' ? "No notices posted yet" : `No ${noticeTab} notices`}</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredNotices.map(n => (
                    <div key={n.id} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${STATUS_STYLES[n.notice_status]}`}>{n.notice_status}</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                              {NOTICE_TYPE_LABELS[n.notice_type] ?? n.notice_type}
                            </span>
                            {n.is_premium && <span className="text-[10px] font-bold text-amber-600">★ Premium</span>}
                          </div>
                          <h3 className="font-semibold text-stone-900 text-sm truncate" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{n.title}</h3>
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{n.body_text}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400 font-mono">
                            <span>Rs. {n.total_cost?.toLocaleString()}</span>
                            <span>{new Date(n.created_at ?? n.createdAt ?? '').toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="text-stone-300">#{n.id}</span>
                          </div>
                          {n.notice_status === 'pending'  && <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 mt-2 border border-amber-200">⏳ Under review</p>}
                          {n.notice_status === 'rejected' && <p className="text-[11px] text-red-700 bg-red-50 px-2 py-1 mt-2 border border-red-200">✕ Rejected — contact support</p>}
                          {n.notice_status === 'approved' && <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 mt-2 border border-emerald-200">✓ Live on notices page</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── LOST & FOUND ── */}
        {section === 'lostfound' && (
          <>
            <div className="flex border-b border-stone-100 shrink-0 overflow-x-auto">
              {(['all','pending','active','rejected'] as const).map(t => (
                <button key={t} onClick={() => setLfTab(t)} className={tabCls(lfTab === t)}>
                  {t}{countBadge(lfCounts[t], t)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {lfLoading ? (
                <div className="flex items-center justify-center py-16 text-xs text-stone-400 font-mono tracking-widest uppercase">Loading…</div>
              ) : filteredLf.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm text-stone-500">{lfTab === 'all' ? "No lost & found reports yet" : `No ${lfTab} reports`}</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredLf.map(r => (
                    <div key={r.id} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {r.photo_url && (
                          <img src={r.photo_url} alt="" className="w-14 h-14 object-cover shrink-0 rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                            <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${r.type === 'lost' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                              {r.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-stone-900 text-sm truncate">{r.title}</h3>
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{r.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-400 font-mono flex-wrap">
                            {r.location && <span>📍 {r.location}</span>}
                            {r.reward   && <span className="text-amber-600">🎁 {r.reward}</span>}
                            <span>{new Date(r.created_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="text-stone-300">#{r.id}</span>
                          </div>
                          {r.status === 'pending'  && <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 mt-2 border border-amber-200">⏳ Under review — will be visible once approved</p>}
                          {r.status === 'rejected' && <p className="text-[11px] text-red-700 bg-red-50 px-2 py-1 mt-2 border border-red-200">✕ Rejected — contact support</p>}
                          {r.status === 'active'   && <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 mt-2 border border-emerald-200">✓ Live on Lost &amp; Found page</p>}
                          {r.status === 'resolved' && <p className="text-[11px] text-stone-500 bg-stone-50 px-2 py-1 mt-2 border border-stone-200">✓ Marked as resolved</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 shrink-0">
          <p className="text-[10px] text-stone-400 text-center leading-relaxed">
            Posts are reviewed within 24 hours · Contact{' '}
            <a href="mailto:acharyankit3@gmail.com" className="text-stone-600 hover:underline">acharyankit3@gmail.com</a>
            {' '}or{' '}
            <a href="tel:9807345551" className="text-stone-600 hover:underline">9807345551</a>
          </p>
        </div>
      </div>
    </div>
  );
}
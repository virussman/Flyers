// FILE: frontend/src/pages/AdminNoticesPanel.tsx

import { useState, useEffect } from 'react';
import { NoticeCard } from '../components/NoticeCards';
import type { Notice, LostFoundReport } from '../types/index';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

type StatusTab   = 'pending' | 'approved' | 'rejected';
type LFStatusTab = 'pending' | 'active' | 'rejected';
type MainTab     = 'notices' | 'lostfound' | 'sponsors';

const TYPE_LABEL: Record<string, string> = {
  samvedana: 'समवेदना', shraddhanjali: 'श्रद्धाञ्जली',
  bibaha: 'विवाह', bratabandha: 'व्रतबन्ध',
  graduation: 'उत्तीर्ण', birth: 'जन्म', business: 'व्यापार',
};

const INP: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid #d1d5db', padding: '6px 8px', fontSize: 12,
  fontFamily: "'Noto Sans Devanagari',sans-serif", outline: 'none',
  background: '#fff', borderRadius: 0,
};
const LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
  letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 3,
};

// ── Notice Edit Form ──────────────────────────────────────────────
function EditForm({ notice, onSave, onCancel }: {
  notice: Notice;
  onSave: (updated: Notice) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...notice });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isObit = ['samvedana','shraddhanjali'].includes(notice.notice_type);
  const set = (k: keyof Notice, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title, body_text: form.body_text,
          published_by: form.published_by, contact_phone: form.contact_phone,
          deceased_name: form.deceased_name, deceased_name_en: form.deceased_name_en,
          deceased_title: form.deceased_title, birth_date_bs: form.birth_date_bs,
          death_date_bs: form.death_date_bs, kriya_text: form.kriya_text,
          funeral_location: form.funeral_location, funeral_datetime: form.funeral_datetime,
          photo_url: form.photo_url, person1_name: form.person1_name,
          person2_name: form.person2_name, person1_photo_url: form.person1_photo_url,
          person2_photo_url: form.person2_photo_url, event_date_bs: form.event_date_bs,
          event_date_ad: form.event_date_ad, event_time: form.event_time,
          event_venue: form.event_venue, blessings_from: form.blessings_from,
          admin_note: form.admin_note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      onSave(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ background: '#fafaf8', border: '2px solid #1a1a1a', padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 14 }}>
        ✏️ Editing Notice #{notice.id}
        <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>— status stays {notice.notice_status} after save</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div><label style={LABEL}>Title *</label><input style={INP} value={form.title ?? ''} onChange={e => set('title', e.target.value)} /></div>
        <div><label style={LABEL}>Published By *</label><input style={INP} value={form.published_by ?? ''} onChange={e => set('published_by', e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={LABEL}>Body Text *</label>
        <textarea style={{ ...INP, height: 80, resize: 'vertical' }} value={form.body_text ?? ''} onChange={e => set('body_text', e.target.value)} />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={LABEL}>Contact Phone</label>
        <input style={INP} value={form.contact_phone ?? ''} onChange={e => set('contact_phone', e.target.value)} />
      </div>
      {isObit && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LABEL}>Deceased Name (नेपाली)</label><input style={INP} value={form.deceased_name ?? ''} onChange={e => set('deceased_name', e.target.value)} /></div>
            <div><label style={LABEL}>Deceased Name (English)</label><input style={INP} value={form.deceased_name_en ?? ''} onChange={e => set('deceased_name_en', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LABEL}>Title/Designation</label><input style={INP} value={form.deceased_title ?? ''} onChange={e => set('deceased_title', e.target.value)} /></div>
            <div><label style={LABEL}>Birth Date BS</label><input style={INP} value={form.birth_date_bs ?? ''} onChange={e => set('birth_date_bs', e.target.value)} /></div>
            <div><label style={LABEL}>Death Date BS</label><input style={INP} value={form.death_date_bs ?? ''} onChange={e => set('death_date_bs', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LABEL}>Funeral Location</label><input style={INP} value={form.funeral_location ?? ''} onChange={e => set('funeral_location', e.target.value)} /></div>
            <div><label style={LABEL}>Funeral Datetime</label><input style={INP} value={form.funeral_datetime ?? ''} onChange={e => set('funeral_datetime', e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={LABEL}>Kriya Text</label>
            <textarea style={{ ...INP, height: 60, resize: 'vertical' }} value={form.kriya_text ?? ''} onChange={e => set('kriya_text', e.target.value)} />
          </div>
        </>
      )}
      {!isObit && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LABEL}>Person 1 Name</label><input style={INP} value={form.person1_name ?? ''} onChange={e => set('person1_name', e.target.value)} /></div>
            <div><label style={LABEL}>Person 2 Name</label><input style={INP} value={form.person2_name ?? ''} onChange={e => set('person2_name', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={LABEL}>Event Date BS</label><input style={INP} value={form.event_date_bs ?? ''} onChange={e => set('event_date_bs', e.target.value)} /></div>
            <div><label style={LABEL}>Event Date AD</label><input style={INP} value={form.event_date_ad ?? ''} onChange={e => set('event_date_ad', e.target.value)} /></div>
            <div><label style={LABEL}>Event Time</label><input style={INP} value={form.event_time ?? ''} onChange={e => set('event_time', e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={LABEL}>Venue</label><input style={INP} value={form.event_venue ?? ''} onChange={e => set('event_venue', e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={LABEL}>Blessings From</label>
            <textarea style={{ ...INP, height: 60, resize: 'vertical' }} value={form.blessings_from ?? ''} onChange={e => set('blessings_from', e.target.value)} />
          </div>
        </>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={{ ...LABEL, color: '#92400e' }}>Admin Edit Note</label>
        <input style={{ ...INP, borderColor: '#fcd34d', background: '#fffbeb' }}
          value={form.admin_note ?? ''} onChange={e => set('admin_note', e.target.value)}
          placeholder="e.g. Fixed spelling of deceased name" />
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', marginBottom: 10, fontSize: 12 }}>⚠ {error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={save} disabled={busy} style={{ flex: 2, padding: '8px 16px', background: '#1a1a1a', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Saving...' : '💾 Save Changes'}
        </button>
        <button onClick={onCancel} style={{ flex: 1, padding: '8px 16px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Lost & Found Panel ────────────────────────────────────────────
function LostFoundPanel() {
  const [lfTab, setLfTab]       = useState<LFStatusTab>('pending');
  const [reports, setReports]   = useState<LostFoundReport[]>([]);
  const [selected, setSelected] = useState<LostFoundReport | null>(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/lost-found?status=${lfTab}&limit=50`, { headers: authHeader() });
      const data = await res.json();
      setReports(data.reports ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); setSelected(null); }, [lfTab]);

  const approve = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch(`${API}/admin/lost-found/${selected.id}/approve`, { method: 'POST', headers: authHeader() });
      setSelected(null); fetchReports();
    } finally { setBusy(false); }
  };

  const reject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) { alert('Enter a rejection reason'); return; }
    setBusy(true);
    try {
      await fetch(`${API}/admin/lost-found/${selected.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setRejectReason(''); setSelected(null); fetchReports();
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 600 }}>
      <div style={{ width: 290, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {(['pending','active','rejected'] as LFStatusTab[]).map(s => (
            <button key={s} onClick={() => setLfTab(s)} style={{
              flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
              background: lfTab === s ? '#1a1a1a' : '#f9fafb',
              color: lfTab === s ? '#fff' : '#6b7280',
            }}>
              {s}
              {s === 'pending' && lfTab === 'pending' && reports.length > 0 && (
                <span style={{ marginLeft: 3, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 9 }}>{reports.length}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Loading...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No {lfTab} reports</div>
          ) : reports.map(r => (
            <button key={r.id} onClick={() => setSelected(r)} style={{
              width: '100%', textAlign: 'left', padding: '11px 14px',
              borderBottom: '1px solid #f3f4f6', border: 'none',
              borderLeft: `3px solid ${selected?.id === r.id ? '#1a1a1a' : 'transparent'}`,
              background: selected?.id === r.id ? '#f5f5f2' : '#fff', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2, color: r.type === 'lost' ? '#991b1b' : '#1d4ed8' }}>
                    {r.type === 'lost' ? '🔍 Lost' : '📦 Found'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{r.phone}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>#{r.id}</div>
                  {r.location && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>📍 {r.location}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {!selected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
              <div>Select a report to review</div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {selected.status === 'pending' && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={approve} disabled={busy} style={{ padding: '8px 20px', background: '#059669', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: busy ? 0.6 : 1 }}>✓ Approve</button>
                <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (required)..."
                  style={{ flex: 1, border: '1px solid #d1d5db', padding: '7px 10px', fontSize: 12, outline: 'none' }}
                />
                <button onClick={reject} disabled={busy} style={{ padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: busy ? 0.6 : 1 }}>✗</button>
              </div>
            )}
            {selected.status === 'active' && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '8px 14px', marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
                ✓ Approved — live on Lost &amp; Found
              </div>
            )}
            {selected.status === 'rejected' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 14px', marginBottom: 20, fontSize: 13 }}>✗ Rejected</div>
            )}
            {selected.photo_url && (
              <img src={selected.photo_url} alt="report"
                style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block', marginBottom: 20, borderRadius: 4 }} />
            )}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 12 }}>Report Details</div>
              {([
                ['ID',          `#${selected.id}`],
                ['Type',        selected.type === 'lost' ? '🔍 Lost Item' : '📦 Found Item'],
                ['Title',       selected.title],
                ['Description', selected.description],
                ['Location',    selected.location ?? '—'],
                ['Date',        selected.date_lost ?? '—'],
                ['Phone',       selected.phone],
                ['Reward',      selected.reward ?? '—'],
                ['Submitted',   new Date(selected.created_at).toLocaleString('en-NP')],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#9ca3af', width: 100, flexShrink: 0, fontSize: 11 }}>{label}:</span>
                  <span style={{ color: '#111', fontWeight: label === 'Description' ? 400 : 500, lineHeight: 1.5 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sponsors Panel ────────────────────────────────────────────────
interface SponsorRecord {
  id: number; name: string; category: string; location: string;
  website_url: string; logo_url: string; tier: 'Gold' | 'Featured';
  status: 'active' | 'inactive'; display_order: number; created_at: string;
  tagline: string; offer_text: string; offer_badge: string;
}
const SINP: React.CSSProperties = { ...INP, fontFamily: 'Inter,sans-serif' };
const SLABEL: React.CSSProperties = { ...LABEL };
const EMPTY: Omit<SponsorRecord, 'id' | 'created_at'> = {
  name: '', category: '', location: '', website_url: '', logo_url: '',
  tier: 'Featured', status: 'active', display_order: 0,
  tagline: '', offer_text: '', offer_badge: '',
};
const TINTS = [
  { bg: '#EFF6FF', color: '#1D4ED8' }, { bg: '#F0FDF4', color: '#15803D' },
  { bg: '#FFFBEB', color: '#B45309' }, { bg: '#FDF4FF', color: '#7E22CE' },
  { bg: '#FFF1F2', color: '#BE123C' }, { bg: '#ECFEFF', color: '#0E7490' },
];
const toInit = (name: string) => {
  const w = name.trim().split(/\s+/);
  return w.length === 1 ? w[0].slice(0, 2).toUpperCase() : (w[0][0] + w[1][0]).toUpperCase();
};

function SponsorsPanel() {
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<SponsorRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const [uploading, setUploading] = useState(false);

  const auth = (): Record<string, string> => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/sponsors`, { headers: auth() });
      const data = await res.json();
      setSponsors(data.sponsors ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const set = (k: keyof typeof EMPTY, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const cancel = () => { setEditing(null); setCreating(false); setError(''); };

  const startCreate = () => { setForm({ ...EMPTY, display_order: sponsors.length }); setEditing(null); setCreating(true); setError(''); };
  const startEdit   = (s: SponsorRecord) => {
    setForm({ name: s.name, category: s.category, location: s.location, website_url: s.website_url, logo_url: s.logo_url, tier: s.tier, status: s.status, display_order: s.display_order, tagline: s.tagline ?? '', offer_text: s.offer_text ?? '', offer_badge: s.offer_badge ?? '' });
    setEditing(s); setCreating(false); setError('');
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res  = await fetch(`${API}/upload`, { method: 'POST', body: fd, headers: auth() });
      const data = await res.json();
      if (data.url) set('logo_url', data.url);
    } catch { setError('Logo upload failed'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setBusy(true); setError('');
    try {
      const url    = editing ? `${API}/admin/sponsors/${editing.id}` : `${API}/admin/sponsors`;
      const method = editing ? 'PATCH' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      cancel(); fetch_();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setBusy(false); }
  };

  const toggleStatus = async (s: SponsorRecord) => {
    try {
      await fetch(`${API}/admin/sponsors/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify({ status: s.status === 'active' ? 'inactive' : 'active' }) });
      fetch_();
    } catch { alert('Failed'); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this sponsor?')) return;
    try { await fetch(`${API}/admin/sponsors/${id}`, { method: 'DELETE', headers: auth() }); fetch_(); }
    catch { alert('Failed to delete'); }
  };

  const activeCount = sponsors.filter(s => s.status === 'active').length;

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 600, fontFamily: 'Inter,sans-serif' }}>
      {/* ── Sidebar ── */}
      <div style={{ width: 300, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>Sponsors</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
              {activeCount}/5 active · homepage shows max 5
              {activeCount >= 5 && <span style={{ color: '#f59e0b', marginLeft: 4 }}>⚠ full</span>}
            </div>
          </div>
          <button onClick={startCreate} style={{ padding: '6px 12px', background: '#1a1a1a', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
        </div>

        {/* Capacity bar */}
        <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < activeCount ? '#1a1a1a' : '#e5e7eb' }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace' }}>
            {5 - activeCount} slot{5 - activeCount !== 1 ? 's' : ''} free on homepage
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Loading…</div>
          ) : sponsors.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No sponsors yet. Click + Add.</div>
          ) : sponsors.map((s, idx) => (
            <div key={s.id} onClick={() => startEdit(s)} style={{
              padding: '10px 14px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              background: editing?.id === s.id ? '#f5f5f2' : '#fff',
              borderLeft: `3px solid ${editing?.id === s.id ? '#1a1a1a' : 'transparent'}`,
              opacity: s.status === 'inactive' ? 0.5 : 1,
            }}>
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TINTS[idx % 6].bg, color: TINTS[idx % 6].color, fontWeight: 900, fontSize: 13 }}>
                  {toInit(s.name)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name} {s.website_url && <span style={{ fontSize: 9, color: '#9ca3af' }}>↗</span>}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{s.tier} · order {s.display_order}</div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', flexShrink: 0,
                background: s.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                color: s.status === 'active' ? '#065f46' : '#9ca3af',
                border: `1px solid ${s.status === 'active' ? '#a7f3d0' : '#e5e7eb'}`,
              }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail / Form ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f9fafb' }}>
        {!editing && !creating ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 10, color: '#9ca3af' }}>
            <div style={{ fontSize: 36, opacity: 0.2 }}>★</div>
            <div style={{ fontSize: 13 }}>Select a sponsor to edit or click + Add</div>
            <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', padding: '14px 18px', maxWidth: 360, fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
              <strong style={{ display: 'block', marginBottom: 6, color: '#374151' }}>Homepage layout notes:</strong>
              The Sponsors column is 1/3 of page width, min 520px tall.<br />
              <strong>5 sponsors</strong> = ~72px each — ideal.<br />
              <strong>6 sponsors</strong> = ~60px each — still fine.<br />
              Sponsors <strong>with a website URL</strong> are clickable links (↗ indicator shown).<br />
              Sponsors <strong>without a website</strong> show as a non-clickable card.<br />
              Logos display at <strong>38×38px</strong> — upload square images.
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 16 }}>
              {creating ? '+ New Sponsor' : `Editing — ${editing?.name}`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div><label style={SLABEL}>Business Name *</label><input style={SINP} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Himalayan Bank" /></div>
              <div><label style={SLABEL}>Category</label><input style={SINP} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Banking, Services…" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div><label style={SLABEL}>Location</label><input style={SINP} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Kathmandu" /></div>
              <div>
                <label style={SLABEL}>Website URL <span style={{ color: '#059669', fontWeight: 400 }}>(makes it clickable ↗)</span></label>
                <input style={SINP} value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://example.com" />
              </div>
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 10 }}>
              <label style={SLABEL}>Logo <span style={{ fontWeight: 400, color: '#9ca3af' }}>— square, min 76×76px</span></label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 60, height: 60, border: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: 4, overflow: 'hidden' }}>
                  {form.logo_url ? <img src={form.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, color: '#d1d5db' }}>No logo</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }} style={{ fontSize: 11, marginBottom: 5, display: 'block' }} />
                  <input style={{ ...SINP, fontSize: 11 }} value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="or paste image URL" />
                  {uploading && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>Uploading…</div>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={SLABEL}>Tier</label>
                <select style={SINP} value={form.tier} onChange={e => set('tier', e.target.value as 'Gold' | 'Featured')}>
                  <option value="Gold">Gold</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>
              <div>
                <label style={SLABEL}>Status</label>
                <select style={SINP} value={form.status} onChange={e => set('status', e.target.value as 'active' | 'inactive')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label style={SLABEL}>Order <span style={{ fontWeight: 400, color: '#9ca3af' }}>(0=top)</span></label>
                <input type="number" min={0} style={SINP} value={form.display_order} onChange={e => set('display_order', parseInt(e.target.value) || 0)} />
              </div>
            </div>

            {/* ── Offer / Promotion section ── */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#92400e', marginBottom: 10 }}>
                ✦ Offer & Promotion
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ ...SLABEL, color: '#92400e' }}>
                  Tagline
                  <span style={{ fontWeight: 400, color: '#b45309', marginLeft: 6 }}>— shown below business name always</span>
                </label>
                <input
                  style={{ ...SINP, borderColor: '#fde68a', background: '#fff' }}
                  value={form.tagline}
                  onChange={e => set('tagline', e.target.value)}
                  placeholder="e.g. Kathmandu's best electronics store"
                  maxLength={120}
                />
                <div style={{ fontSize: 9, color: '#b45309', marginTop: 3 }}>{form.tagline.length}/120</div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ ...SLABEL, color: '#92400e' }}>
                  Offer Text
                  <span style={{ fontWeight: 400, color: '#b45309', marginLeft: 6 }}>— highlighted gold strip on the card</span>
                </label>
                <input
                  style={{ ...SINP, borderColor: '#fde68a', background: '#fff' }}
                  value={form.offer_text}
                  onChange={e => set('offer_text', e.target.value)}
                  placeholder="e.g. 20% off all laptops this week · Free delivery on orders above Rs.2000"
                  maxLength={200}
                />
                <div style={{ fontSize: 9, color: '#b45309', marginTop: 3 }}>{form.offer_text.length}/200</div>
              </div>

              <div>
                <label style={{ ...SLABEL, color: '#92400e' }}>
                  Flash Badge
                  <span style={{ fontWeight: 400, color: '#b45309', marginLeft: 6 }}>— small pulsing label on logo corner (e.g. SALE, NEW, 20% OFF)</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    style={{ ...SINP, borderColor: '#fde68a', background: '#fff', flex: 1 }}
                    value={form.offer_badge}
                    onChange={e => set('offer_badge', e.target.value)}
                    placeholder="e.g. SALE · NEW · LIMITED · 20% OFF"
                    maxLength={40}
                  />
                  {/* Quick presets */}
                  {['SALE', 'NEW', 'HOT', 'LIMITED'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => set('offer_badge', b)}
                      style={{
                        padding: '4px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                        background: form.offer_badge === b ? '#92400e' : '#fff',
                        color: form.offer_badge === b ? '#fde68a' : '#92400e',
                        border: '1px solid #fde68a', flexShrink: 0, letterSpacing: '0.06em',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                  {form.offer_badge && (
                    <button
                      type="button"
                      onClick={() => set('offer_badge', '')}
                      style={{ padding: '4px 6px', fontSize: 9, cursor: 'pointer', background: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb', flexShrink: 0 }}
                    >✕</button>
                  )}
                </div>
              </div>
            </div>

            {creating && activeCount >= 5 && form.status === 'active' && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', padding: '8px 12px', marginBottom: 10, fontSize: 11 }}>
                ⚠ 5 active sponsors already — homepage shows max 5. Set Inactive or deactivate another first.
              </div>
            )}

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', marginBottom: 10, fontSize: 12 }}>⚠ {error}</div>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={save} disabled={busy || uploading} style={{ flex: 2, padding: '9px 16px', background: '#1a1a1a', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Saving…' : creating ? '+ Add Sponsor' : '💾 Save'}
              </button>
              {editing && (
                <button onClick={() => toggleStatus(editing)} style={{ padding: '9px 12px', background: editing.status === 'active' ? '#fef2f2' : '#ecfdf5', color: editing.status === 'active' ? '#b91c1c' : '#065f46', border: `1px solid ${editing.status === 'active' ? '#fecaca' : '#a7f3d0'}`, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  {editing.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              )}
              {editing && (
                <button onClick={() => del(editing.id)} style={{ padding: '9px 12px', background: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb', fontSize: 11, cursor: 'pointer' }}>🗑</button>
              )}
              <button onClick={cancel} style={{ flex: 1, padding: '9px 16px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────
export default function AdminNoticesPanel() {
  const [mainTab, setMainTab]       = useState<MainTab>('notices');
  const [statusTab, setStatusTab]   = useState<StatusTab>('pending');
  const [notices, setNotices]       = useState<Notice[]>([]);
  const [selected, setSelected]     = useState<Notice | null>(null);
  const [editing, setEditing]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy]             = useState(false);

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/notices?status=${statusTab}&limit=50`, { headers: authHeader() });
      const data = await res.json();
      setNotices(data.notices ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (mainTab === 'notices') { fetchNotices(); setSelected(null); setEditing(false); } }, [statusTab, mainTab]);

  const approve = async () => {
    if (!selected) return; setBusy(true);
    try {
      await fetch(`${API}/admin/notices/${selected.id}/approve`, { method: 'POST', headers: authHeader() });
      setSelected(null); setEditing(false); fetchNotices();
    } finally { setBusy(false); }
  };

  const reject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) { alert('Enter a rejection reason'); return; }
    setBusy(true);
    try {
      await fetch(`${API}/admin/notices/${selected.id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ reason: rejectReason }) });
      setRejectReason(''); setSelected(null); setEditing(false); fetchNotices();
    } finally { setBusy(false); }
  };

  const handleSaved = (updated: Notice) => {
    setSelected(updated); setEditing(false);
    setNotices(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const isObit = (n: Notice) => ['samvedana','shraddhanjali'].includes(n.notice_type);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600, fontFamily: 'Inter,sans-serif', background: '#f9fafb' }}>

      {/* ── Top tab bar ── */}
      <div style={{ display: 'flex', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <div style={{ padding: '14px 16px', borderRight: '1px solid #333' }}>
          <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Admin Panel</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Content Management</div>
        </div>
        {([
          { key: 'notices',   label: 'सूचना / Notices' },
          { key: 'lostfound', label: '🔍 Lost & Found' },
          { key: 'sponsors',  label: '★ Sponsors' },
        ] as { key: MainTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)} style={{
            padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: 12,
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            background: mainTab === t.key ? '#fff' : 'transparent',
            color: mainTab === t.key ? '#1a1a1a' : '#9ca3af',
            borderBottom: mainTab === t.key ? '2px solid #fff' : '2px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Notices ── */}
      {mainTab === 'notices' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ width: 290, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              {(['pending','approved','rejected'] as StatusTab[]).map(s => (
                <button key={s} onClick={() => setStatusTab(s)} style={{ flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', background: statusTab === s ? '#1a1a1a' : '#f9fafb', color: statusTab === s ? '#fff' : '#6b7280' }}>
                  {s}
                  {s === 'pending' && statusTab === 'pending' && notices.length > 0 && (
                    <span style={{ marginLeft: 3, background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 5px', fontSize: 9 }}>{notices.length}</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>Loading...</div>
              : notices.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No {statusTab} notices</div>
              : notices.map(n => (
                <button key={n.id} onClick={() => { setSelected(n); setEditing(false); }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', borderBottom: '1px solid #f3f4f6', border: 'none', borderLeft: `3px solid ${selected?.id === n.id ? '#1a1a1a' : 'transparent'}`, background: selected?.id === n.id ? '#f5f5f2' : '#fff', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2, color: isObit(n) ? '#374151' : '#b8860b' }}>
                        {TYPE_LABEL[n.notice_type] ?? n.notice_type}{n.is_premium && ' ★'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', fontFamily: "'Noto Sans Devanagari',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isObit(n) ? `स्व. ${n.deceased_name ?? '—'}` : (n.person1_name || n.title)}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.published_by}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>#{n.id}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginTop: 2 }}>Rs {n.total_cost}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 8 }}>📋</div><div>Select a notice to review</div></div>
              </div>
            ) : (
              <div style={{ maxWidth: 680, margin: '0 auto' }}>
                {selected.notice_status === 'pending' && !editing && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={approve} disabled={busy} style={{ padding: '8px 20px', background: '#059669', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: busy ? 0.6 : 1 }}>✓ Approve</button>
                    <button onClick={() => setEditing(true)} style={{ padding: '8px 16px', background: '#f5f5f0', color: '#374151', border: '1px solid #d1d5db', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✏️ Edit</button>
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason..." style={{ flex: 1, border: '1px solid #d1d5db', padding: '7px 10px', fontSize: 12, outline: 'none' }} />
                    <button onClick={reject} disabled={busy} style={{ padding: '8px 14px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: busy ? 0.6 : 1 }}>✗</button>
                  </div>
                )}
                {selected.notice_status === 'approved' && !editing && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '8px 14px', marginBottom: 20, fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✓ Approved — live on /notices</span>
                    <button onClick={() => setEditing(true)} style={{ padding: '5px 12px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>✏️ Edit</button>
                  </div>
                )}
                {selected.notice_status === 'rejected' && !editing && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 14px', marginBottom: 20, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✗ Rejected{selected.admin_note ? ` — ${selected.admin_note}` : ''}</span>
                    <button onClick={() => setEditing(true)} style={{ padding: '5px 12px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>✏️ Edit</button>
                  </div>
                )}
                {editing && <EditForm notice={selected} onSave={handleSaved} onCancel={() => setEditing(false)} />}
                {!editing && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#92400e', marginBottom: 10 }}>🔐 Legal Verification</div>
                    {([
                      ['Advertiser', selected.advertiser_name], ['Citizenship No.', selected.advertiser_citizenship],
                      ['Relationship', selected.advertiser_relationship], ['Family consent', selected.family_consent_agreed ? '✓ Agreed' : '✗ Not agreed'],
                      ['Terms agreed', selected.terms_agreed ? '✓ Yes' : '✗ No'],
                      ...(selected.admin_note ? [['Admin Note', selected.admin_note]] : []),
                    ] as [string, string | boolean | undefined][]).map(([label, value]) =>
                      value != null && value !== '' && (
                        <div key={String(label)} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
                          <span style={{ color: '#92400e', fontWeight: 600, width: 160, flexShrink: 0 }}>{String(label)}:</span>
                          <span style={{ color: '#374151' }}>{String(value)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {!editing && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 12 }}>Card Preview</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}><NoticeCard notice={selected} /></div>
                  </div>
                )}
                {!editing && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 10 }}>Submission Details</div>
                    {([
                      ['ID', `#${selected.id}`], ['Type', `${TYPE_LABEL[selected.notice_type] ?? selected.notice_type} · ${selected.display_size ?? '—'}`],
                      ['Cost', `Rs. ${selected.total_cost}${selected.is_premium ? ' (Premium)' : ''}`], ['Contact', selected.contact_phone ?? '—'],
                      ['Submitted', new Date(selected.created_at ?? selected.createdAt ?? '').toLocaleString('en-NP')],
                      ['Expires', selected.expires_at ? new Date(selected.expires_at).toLocaleDateString('en-NP') : '—'],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: '#9ca3af', width: 80, flexShrink: 0 }}>{label}:</span>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Lost & Found ── */}
      {mainTab === 'lostfound' && (
        <div style={{ flex: 1, minHeight: 0 }}><LostFoundPanel /></div>
      )}

      {/* ── Sponsors ── */}
      {mainTab === 'sponsors' && (
        <div style={{ flex: 1, minHeight: 0 }}><SponsorsPanel /></div>
      )}
    </div>
  );
}
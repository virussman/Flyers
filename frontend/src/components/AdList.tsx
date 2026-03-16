import { useState, useEffect, useCallback } from 'react';
import { adsApi } from '@/api/client';
import type { Ad } from '@/types';
import AdCard from './AdCard';
import { TOKEN, FONT } from '@/lib/constants';

interface AdListProps {
  refresh?: number;
  initialCategory?: string;
}

export default function AdList({ refresh, initialCategory = 'all' }: AdListProps) {
  const [ads, setAds]         = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [total, setTotal]     = useState(0);
  const [location, setLocation] = useState('');
  const [page, setPage]       = useState(1);
  const LIMIT = 12;

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page, limit: LIMIT, status: 'approved',
      };
      if (initialCategory !== 'all') params.category = initialCategory;
      if (location.trim()) params.location = location.trim();
      const res = await adsApi.list(params);
      setAds(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Could not load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [initialCategory, location, page, refresh]);

  useEffect(() => { fetchAds(); }, [fetchAds]);
  useEffect(() => { setPage(1); }, [location, initialCategory]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Location search */}
        <div style={{ position: 'relative', maxWidth: 240 }}>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={TOKEN.ink5} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Filter by location…"
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              border: `1px solid ${TOKEN.border}`,
              fontFamily: FONT.sans, fontSize: 12, color: TOKEN.ink,
              background: TOKEN.white, outline: 'none',
              transition: 'border-color .15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = TOKEN.ink)}
            onBlur={e => (e.currentTarget.style.borderColor = TOKEN.border)}
          />
        </div>

        {/* Stats + refresh */}
        {!loading && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {total} listing{total !== 1 ? 's' : ''}{location ? ` in "${location}"` : ''}
            </span>
            <button
              onClick={fetchAds}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: TOKEN.ink5, background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = TOKEN.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = TOKEN.ink5)}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <style>{`
            @keyframes adlist-spin { to { transform: rotate(360deg); } }
          `}</style>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${TOKEN.border}`,
            borderTopColor: TOKEN.ink,
            animation: 'adlist-spin .7s linear infinite',
          }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Loading
          </span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, textAlign: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TOKEN.border2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: TOKEN.ink4 }}>{error}</p>
          <button
            onClick={fetchAds}
            style={{
              padding: '7px 18px', border: `1px solid ${TOKEN.border}`,
              background: TOKEN.white, fontFamily: FONT.mono, fontSize: 9,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKEN.ink4,
              cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = TOKEN.bg)}
            onMouseLeave={e => (e.currentTarget.style.background = TOKEN.white)}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && ads.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 0', gap: 8, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.serif, fontSize: 56, color: TOKEN.border, lineHeight: 1 }}>—</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 17, color: TOKEN.ink4, marginTop: 8 }}>No listings found</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
            {initialCategory !== 'all' || location ? 'Try adjusting your filters' : 'Be the first to post an ad'}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && ads.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingTop: 24, borderTop: `1px solid ${TOKEN.border}`,
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '7px 16px', border: `1px solid ${TOKEN.border}`,
                  background: TOKEN.white, fontFamily: FONT.mono, fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKEN.ink4,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1, transition: 'background .15s',
                }}
                onMouseEnter={e => { if (page !== 1) (e.currentTarget.style.background = TOKEN.bg); }}
                onMouseLeave={e => (e.currentTarget.style.background = TOKEN.white)}
              >
                ← Prev
              </button>

              <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.1em', padding: '0 12px' }}>
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '7px 16px', border: `1px solid ${TOKEN.border}`,
                  background: TOKEN.white, fontFamily: FONT.mono, fontSize: 9,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKEN.ink4,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1, transition: 'background .15s',
                }}
                onMouseEnter={e => { if (page !== totalPages) (e.currentTarget.style.background = TOKEN.bg); }}
                onMouseLeave={e => (e.currentTarget.style.background = TOKEN.white)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
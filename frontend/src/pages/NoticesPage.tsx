// FILE: src/pages/NoticesPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoticeCard } from '@/components/NoticeCards';
import NoticeForm from '@/components/NoticeForm';
import CategoryBanner from '@/components/CategoryBanner';
import { IcArrowLeft } from '@/components/Icons';
import { TOKEN, FONT, NOTICE_TABS, API } from '@/lib/constants';
import type { Notice, NoticeType } from '@/types';

const PER_PAGE = 8;

export default function NoticesPage() {
  const navigate = useNavigate();
  const [all,       setAll]       = useState<Notice[]>([]);
  const [noticeTab, setNoticeTab] = useState<NoticeType|''>('');
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [page,      setPage]      = useState(0);

  const fetchNotices = useCallback(async (type: NoticeType|'' = noticeTab) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '80' });
      if (type) params.set('type', type);
      const res  = await fetch(`${API}/notices?${params}`);
      const data = await res.json();
      setAll(data.notices ?? []);
      setPage(0);
    } catch { setAll([]); }
    finally { setLoading(false); }
  }, [noticeTab]);

  useEffect(() => { fetchNotices(noticeTab); }, [noticeTab]);

  // Split premium vs regular
  const premium = all.filter(n => n.is_premium);
  const regular = all.filter(n => !n.is_premium);
  const totalPages = Math.ceil(regular.length / PER_PAGE);
  const visible    = regular.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    fontFamily: FONT.deva, fontWeight: active ? 700 : 500,
    padding: '12px 16px', border: 'none', background: 'none',
    color: active ? TOKEN.ink : TOKEN.ink5,
    borderBottom: `2px solid ${active ? TOKEN.ink : 'transparent'}`,
    whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
    transition: 'color 0.15s', fontSize: 13,
  });

  return (
    <>
      <CategoryBanner category="notices" />

      {/* Breadcrumb */}
      <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 52px' }}>
          <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: TOKEN.ink4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <IcArrowLeft /> Home
          </button>
          <span style={{ color: TOKEN.border2, fontSize: 12 }}>›</span>
          <span style={{ fontFamily: FONT.deva, fontSize: 11, color: TOKEN.ink }}>सूचनाहरू</span>
        </div>
      </div>

      <div style={{ background: TOKEN.bg3 }}>
        <div style={{ height: 4, background: `repeating-linear-gradient(90deg,${TOKEN.gold2} 0,${TOKEN.gold2} 5px,${TOKEN.goldx} 5px,${TOKEN.goldx} 10px)` }} />

        {/* Header */}
        <div style={{ padding: '24px 52px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: FONT.deva, fontWeight: 800, fontSize: 44, color: TOKEN.ink, lineHeight: 1 }}>सूचनाहरू</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold, marginTop: 6 }}>
              Notices · Death &amp; Celebration
            </div>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: TOKEN.ink, color: TOKEN.white, border: 'none', padding: '10px 20px', fontFamily: FONT.deva, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + सूचना दिनुहोस्
          </button>
        </div>

        {/* Tabs */}
        <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}`, marginTop: 20 }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 52px' }}>
            {NOTICE_TABS.map(t => (
              <button key={t.key} onClick={() => setNoticeTab(t.key as NoticeType|'')} style={tabBtn(noticeTab === t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '24px 52px' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ height: 220, background: TOKEN.border, opacity: 0.25 }} />)}
          </div>
        ) : all.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 14 }}>
            <div style={{ fontSize: 52 }}>📋</div>
            <p style={{ fontFamily: FONT.deva, fontSize: 16, color: TOKEN.ink4 }}>कुनै सूचना छैन</p>
            <button onClick={() => setShowForm(true)} style={{ marginTop: 8, padding: '12px 28px', background: TOKEN.ink, color: TOKEN.white, border: 'none', fontFamily: FONT.sans, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              पहिलो सूचना दिनुहोस्
            </button>
          </div>
        ) : (
          <>
            {/* ── PREMIUM FEATURED ROW ── */}
            {premium.length > 0 && (
              <div style={{ padding: '20px 52px 0' }}>
                {/* Section label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ height: 3, width: 24, background: TOKEN.gold2 }} />
                  <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold2, fontWeight: 700 }}>★ Premium Notices</span>
                  <div style={{ flex: 1, height: 1, background: TOKEN.gold2, opacity: 0.2 }} />
                  <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5 }}>{premium.length} featured</span>
                </div>

                {/* Premium grid — always 4 cols, gold tinted bg */}
                <div style={{ background: `linear-gradient(135deg, ${TOKEN.goldx} 0%, ${TOKEN.bg3} 100%)`, border: `1px solid rgba(180,135,40,.2)`, padding: '16px', marginBottom: 0 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {premium.map(n => (
                      <div key={n.id} style={{ position: 'relative' }}>
                        {/* ★ badge */}
                        <div style={{ position: 'absolute', top: -8, right: -8, zIndex: 3, background: TOKEN.gold2, color: TOKEN.ink, fontFamily: FONT.mono, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', textTransform: 'uppercase' }}>★ PREMIUM</div>
                        <NoticeCard notice={n} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── REGULAR GRID ── */}
            {regular.length > 0 && (
              <div style={{ padding: premium.length > 0 ? '24px 52px 0' : '20px 52px 0' }}>
                {/* Section label — only show if premium section also visible */}
                {premium.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ height: 3, width: 24, background: TOKEN.border2 }} />
                    <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.ink5, fontWeight: 700 }}>All Notices</span>
                    <div style={{ flex: 1, height: 1, background: TOKEN.border2, opacity: 0.5 }} />
                    <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5 }}>{regular.length} notices</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {visible.map(n => (
                    <div key={n.id}>
                      <NoticeCard notice={n} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      style={{ padding: '6px 14px', border: `1px solid ${TOKEN.border2}`, background: page === 0 ? TOKEN.bg3 : TOKEN.white, color: page === 0 ? TOKEN.ink5 : TOKEN.ink, fontFamily: FONT.mono, fontSize: 10, cursor: page === 0 ? 'default' : 'pointer' }}>← Prev</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i)} style={{ width: 32, height: 32, border: `1px solid ${i === page ? TOKEN.ink : TOKEN.border2}`, background: i === page ? TOKEN.ink : TOKEN.white, color: i === page ? TOKEN.white : TOKEN.ink4, fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                      style={{ padding: '6px 14px', border: `1px solid ${TOKEN.border2}`, background: page === totalPages - 1 ? TOKEN.bg3 : TOKEN.white, color: page === totalPages - 1 ? TOKEN.ink5 : TOKEN.ink, fontFamily: FONT.mono, fontSize: 10, cursor: page === totalPages - 1 ? 'default' : 'pointer' }}>Next →</button>
                  </div>
                )}
              </div>
            )}

            <div style={{ height: 32 }} />
          </>
        )}
      </div>

      {showForm && (
        <NoticeForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchNotices(noticeTab); }}
        />
      )}
    </>
  );
}

// ================================================================
// FILE: src/components/FeaturedBelt.tsx
// Premium belt — fetches premium data from API, falls back on error
// bc = ad card (white, gold top border, grey PREMIUM badge)
// bn = notice card (tinted bg, coloured top border + badge)
// Clicking navigates to the category/notices page
// ================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, TOKEN, FONT } from '@/lib/constants';

const CAT_ROUTE: Record<string, string> = {
  'real-estate': '/real-estate',
  'realestate':  '/real-estate',
  'real estate': '/real-estate',
  'jobs':        '/jobs',
  'employment':  '/jobs',
  'services':    '/services',
  'matrimonial': '/matrimonial',
  'automobiles': '/automobiles',
  'automobile':  '/automobiles',
  'notices':     '/notices',
};

const CAT_LABEL: Record<string, string> = {
  'real-estate': 'Real Estate',
  'realestate':  'Real Estate',
  'real estate': 'Real Estate',
  'jobs':        'Employment',
  'employment':  'Employment',
  'services':    'Services',
  'matrimonial': 'Matrimonial',
  'automobiles': 'Automobiles',
  'automobile':  'Automobiles',
};

const NOTICE_THEMES: Record<string, { color: string; bg: string; label: string }> = {
  samvedana:     { color: '#5C3D1E', bg: '#FDF6EE', label: 'समवेदना'       },
  shraddhanjali: { color: '#4A3728', bg: '#F5EFE8', label: 'श्रद्धाञ्जली' },
  bibaha:        { color: '#9D174D', bg: '#FFF0F5', label: 'विवाह'         },
  graduation:    { color: '#1E3A8A', bg: '#EFF2FF', label: 'उत्तीर्ण'      },
  birth:         { color: '#14532D', bg: '#F0FAF4', label: 'जन्म'          },
  business:      { color: '#4C1D95', bg: '#F5F0FF', label: 'व्यापार'       },
  bratabandha:   { color: '#92400E', bg: '#FFFBEB', label: 'ब्रतबन्ध'      },
};

interface CardItem {
  id: string; type: 'ad' | 'notice';
  title: string; cat: string; catKey: string;
  desc: string; phone: string; loc: string;
  noticeType: string; meta: string; by: string;
}

function mapAd(ad: Record<string, unknown>): CardItem {
  const cat = String(ad.category ?? '').toLowerCase();
  return {
    id: `ad-${ad.id}`, type: 'ad',
    title: String(ad.title ?? ''),
    cat: CAT_LABEL[cat] ?? String(ad.category ?? ''),
    catKey: cat,
    desc: String(ad.description ?? ''),
    phone: String(ad.contact_phone ?? ''),
    loc: String(ad.location ?? ''),
    noticeType: '', meta: '', by: '',
  };
}

function mapNotice(n: Record<string, unknown>): CardItem {
  const nType = String(n.notice_type ?? '').toLowerCase();
  let meta = '';
  if (n.birth_date_bs && n.death_date_bs) meta = `${n.birth_date_bs} – ${n.death_date_bs}`;
  else if (n.event_date_bs) meta = String(n.event_date_bs);
  else if (n.event_date_ad) meta = String(n.event_date_ad);
  let title = String(n.title ?? '');
  if (n.deceased_name) title = String(n.deceased_name);
  else if (n.person1_name && n.person2_name) title = `${n.person1_name} & ${n.person2_name}`;
  else if (n.person1_name) title = String(n.person1_name);
  return {
    id: `notice-${n.id}`, type: 'notice',
    title, cat: 'Notices', catKey: 'notices',
    desc: '', phone: '', loc: '',
    noticeType: nType, meta, by: String(n.published_by ?? ''),
  };
}

function BnEm({ type, color }: { type: string; color: string }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.5' } as const;
  if (type === 'bibaha')     return <svg {...p}><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2.5"/></svg>;
  if (type === 'graduation') return <svg {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
  if (type === 'birth')      return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  return null;
}

interface FeaturedBeltProps { category?: string; }

export default function FeaturedBelt({ category }: FeaturedBeltProps) {
  const navigate   = useNavigate();
  const trackRef   = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const offsetRef  = useRef<number>(0);
  const pausedRef  = useRef<boolean>(false);
  const halfRef    = useRef<number>(0);

  const [items,   setItems]   = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [ready,   setReady]   = useState(false);

  const SPEED = 0.55; // px per frame — increase for faster scroll

  // ── Fetch data ─────────────────────────────────────────────
  useEffect(() => {
    setLoading(true); setError(false); setReady(false);
    offsetRef.current = 0;

    const adParams = new URLSearchParams({ premium: 'true', status: 'approved', limit: '15' });
    if (category && category !== 'all') adParams.set('category', category);
    const noticeParams = new URLSearchParams({ premium: 'true', limit: '8' });

    const adsP = fetch(`${API}/ads?${adParams}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: { data: Record<string, unknown>[] }) => (d.data ?? []).map(mapAd))
      .catch(() => [] as CardItem[]);

    const noticesP = (!category || category === 'all' || category === 'notices')
      ? fetch(`${API}/notices?${noticeParams}`)
          .then(r => { if (!r.ok) throw new Error(); return r.json(); })
          .then((d: { notices: Record<string, unknown>[] }) => (d.notices ?? []).map(mapNotice))
          .catch(() => [] as CardItem[])
      : Promise.resolve([] as CardItem[]);

    Promise.all([adsP, noticesP]).then(([ads, notices]) => {
      if (ads.length === 0 && notices.length === 0) { setError(true); setLoading(false); return; }
      const merged: CardItem[] = [];
      let ni = 0;
      ads.forEach((ad, idx) => {
        merged.push(ad);
        if ((idx + 1) % 3 === 0 && ni < notices.length) merged.push(notices[ni++]);
      });
      while (ni < notices.length) merged.push(notices[ni++]);
      setItems(merged);
      setLoading(false);
    });
  }, [category]);

  // ── Measure track once DOM paints ─────────────────────────
  useEffect(() => {
    if (loading || error || items.length === 0) return;
    // Two rAF frames to ensure layout is complete
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!trackRef.current) return;
        halfRef.current = trackRef.current.scrollWidth / 2;
        setReady(true);
      });
    });
    return () => cancelAnimationFrame(r1);
  }, [loading, error, items]);

  // ── Animation loop ─────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      if (!pausedRef.current && trackRef.current && halfRef.current > 0) {
        offsetRef.current += SPEED;
        if (offsetRef.current >= halfRef.current) offsetRef.current = 0;
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  // ── Ad card ────────────────────────────────────────────────
  const AdCard = ({ item, keyIdx }: { item: CardItem; keyIdx: number }) => (
    <div
      key={keyIdx}
      onClick={() => navigate(CAT_ROUTE[item.catKey] ?? '/')}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      style={{
        flexShrink: 0, width: 195,
        background: TOKEN.white,
        borderTop: `2.5px solid ${TOKEN.gold3}`,
        display: 'flex', flexDirection: 'column',
        position: 'relative', cursor: 'pointer',
        boxShadow: '0 1px 8px rgba(0,0,0,.18)',
        transition: 'transform .15s, box-shadow .15s',
        userSelect: 'none',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.28)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 8px rgba(0,0,0,.18)';
      }}
    >
      <div style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(0,0,0,.07)', color: TOKEN.ink4,
        fontFamily: FONT.mono, fontSize: 7,
        letterSpacing: '0.1em', padding: '2px 8px',
        borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap',
      }}>★ PREMIUM</div>

      <div style={{ padding: '14px 13px 0', flex: 1 }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 7,
        }}>{item.cat}</div>
        <div style={{
          fontFamily: FONT.serif, fontSize: 14, fontWeight: 700,
          lineHeight: 1.25, color: TOKEN.ink, marginBottom: 5,
        }}>{item.title}</div>
        <div style={{
          fontSize: 11, color: TOKEN.ink3, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>{item.desc}</div>
      </div>

      <div style={{ borderTop: `1px solid ${TOKEN.border}`, padding: '9px 13px 12px', marginTop: 10 }}>
        {item.phone && <div style={{ fontFamily: FONT.mono, fontSize: 11, color: TOKEN.ink, marginBottom: 3 }}>📞 {item.phone}</div>}
        {item.loc   && <div style={{ fontSize: 10, color: TOKEN.ink5 }}>📍 {item.loc}</div>}
      </div>
    </div>
  );

  // ── Notice card ────────────────────────────────────────────
  const NoticeCard = ({ item, keyIdx }: { item: CardItem; keyIdx: number }) => {
    const theme   = NOTICE_THEMES[item.noticeType] ?? { color: TOKEN.gold2, bg: TOKEN.goldx, label: item.noticeType };
    const hasIcon = ['bibaha', 'graduation', 'birth'].includes(item.noticeType);
    return (
      <div
        key={keyIdx}
        onClick={() => navigate('/notices')}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{
          flexShrink: 0, width: 152,
          background: theme.bg,
          borderTop: `2.5px solid ${theme.color}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          position: 'relative', cursor: 'pointer',
          padding: '14px 12px 16px',
          boxShadow: '0 1px 8px rgba(0,0,0,.18)',
          transition: 'transform .15s, box-shadow .15s',
          userSelect: 'none',
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.28)';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 8px rgba(0,0,0,.18)';
        }}
      >
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: theme.color, color: '#fff',
          fontFamily: FONT.mono, fontSize: 7,
          letterSpacing: '0.1em', fontWeight: 600,
          padding: '3px 8px', whiteSpace: 'nowrap',
        }}>★ NOTICE</div>

        <div style={{ fontFamily: FONT.deva, fontSize: 13, fontWeight: 700, color: theme.color, marginBottom: hasIcon ? 4 : 7 }}>
          {theme.label}
        </div>
        {hasIcon && <span style={{ display: 'block', marginBottom: 5, lineHeight: 0 }}><BnEm type={item.noticeType} color={theme.color} /></span>}
        <div style={{ width: 24, height: 1, background: theme.color, opacity: 0.3, margin: '0 0 9px' }}/>
        <div style={{ fontFamily: FONT.deva, fontSize: 14, fontWeight: 700, color: TOKEN.ink, lineHeight: 1.3, marginBottom: 4 }}>
          {item.title}
        </div>
        {item.meta && <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.03em', marginBottom: 4 }}>{item.meta}</div>}
        {item.by   && <div style={{ fontFamily: FONT.deva, fontSize: 11, color: TOKEN.ink4 }}>{item.by}</div>}
      </div>
    );
  };

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: TOKEN.dark2 }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,.05)', padding: '11px 52px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em', color: TOKEN.gold3 }}>
            • &nbsp;Featured — Premium Ads &amp; Notices
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '14px 52px 18px', overflow: 'hidden' }}>
          {[195,152,195,195,152,195,152].map((w, i) => (
            <div key={i} style={{
              flexShrink: 0, width: w, height: 160,
              background: 'rgba(255,255,255,.06)',
              borderTop: '2.5px solid rgba(255,255,255,.08)',
              animation: `pulse 1.5s ease-in-out ${i*0.1}s infinite`,
            }}/>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div style={{ background: TOKEN.dark2 }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,.05)', padding: '11px 52px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em', color: TOKEN.gold3 }}>
            • &nbsp;Featured — Premium Ads &amp; Notices
          </div>
        </div>
        <div style={{ padding: '28px 52px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,.2)', letterSpacing: '0.08em' }}>
            No premium listings yet
          </div>
        </div>
      </div>
    );
  }

  // Duplicate for seamless infinite loop
  const allItems = [...items, ...items];

  return (
    <div style={{ background: TOKEN.dark2, position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 100% at 0% 50%,rgba(180,135,40,.09),transparent 65%)',
      }}/>

      {/* Fade masks — left & right edges */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 72, zIndex: 2, pointerEvents: 'none',
        background: `linear-gradient(to right, ${TOKEN.dark2} 30%, transparent)`,
      }}/>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 72, zIndex: 2, pointerEvents: 'none',
        background: `linear-gradient(to left, ${TOKEN.dark2} 30%, transparent)`,
      }}/>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,.05)',
        padding: '11px 52px', position: 'relative', zIndex: 3,
      }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: TOKEN.gold3,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>•</span>
          <span style={{ width: 14, height: 1, background: TOKEN.gold2, opacity: 0.4, display: 'inline-block' }}/>
          Featured — Premium Ads &amp; Notices
        </div>
        
      </div>

      {/* Marquee viewport */}
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 8,
            padding: '14px 0 18px',
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {allItems.map((item, idx) =>
            item.type === 'ad'
              ? <AdCard    key={`${item.id}-${idx}`} item={item} keyIdx={idx} />
              : <NoticeCard key={`${item.id}-${idx}`} item={item} keyIdx={idx} />
          )}
        </div>
      </div>
    </div>
  );
}
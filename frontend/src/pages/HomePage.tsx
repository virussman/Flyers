// ================================================================
// FILE: src/pages/HomePage.tsx
// Home page — three-col section (Sponsors | Lost & Found | Live)
//           + FeaturedBelt + Latest Listings + Browse + Advertise CTA + Notices
// ================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate }   from 'react-router-dom';
import AdList            from '@/components/AdList';
import { NoticeCard }    from '@/components/NoticeCards';
import NoticeForm        from '@/components/NoticeForm';
import FeaturedBelt      from '@/components/FeaturedBelt';
import LoginModal        from '@/components/LoginModal';
import AdForm            from '@/components/AdForm';
import LostFoundModal    from '@/components/LostFoundModal';   // ← NEW
import { useAuth }       from '@/context/AuthContext';
import {
  TOKEN, FONT, API,
  CAT_COLORS, NOTICE_TABS,
  type CatKey,
} from '@/lib/constants';
import type { CategoryCount, Notice } from '@/types';

// ── Types ────────────────────────────────────────────────────────

interface LiveFeedItem {
  id:      string;
  title:   string;
  desc:    string;
  cat:     string;
  catKey:  string;
  phone:   string;
  loc:     string;
  premium: boolean;
  time:    string;
}

interface Sponsor {
  id:            string;
  name:          string;
  category:      string;
  location:      string;
  website_url?:  string;
  logo_url?:     string;
  tier:          'Gold' | 'Featured';
  tagline?:      string;
  offer_text?:   string;
  offer_badge?:  string;
}

interface LostFoundItem {
  id:          string;
  type:        'lost' | 'found';
  title:       string;
  description: string;
  phone:       string;
  location:    string;
  photo_url?:  string;
  created_at:  string;
}

// ── Helpers ──────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapAdToFeedItem(ad: Record<string, unknown>): LiveFeedItem {
  const cat = String(ad.category ?? '').toLowerCase();
  return {
    id:      String(ad.id),
    title:   String(ad.title ?? ''),
    desc:    String(ad.description ?? ''),
    cat:     String(ad.category ?? ''),
    catKey:  cat,
    phone:   String(ad.contact_phone ?? ''),
    loc:     String(ad.location ?? ''),
    premium: Boolean(ad.is_premium),
    time:    timeAgo(String(ad.created_at ?? '')),
  };
}

function toInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const POLL_INTERVAL = 8_000;

// ── Shared ghost button ──────────────────────────────────────────
function GhostBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase',
        padding: '7px 14px', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white,
        color: TOKEN.ink4, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = TOKEN.bg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = TOKEN.white; }}
    >
      {label}
    </button>
  );
}

// ── Column header ────────────────────────────────────────────────
function ColHeader({
  eyebrow, title, action, live = false,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
      padding: '18px 24px 14px',
      background: TOKEN.white,
      borderBottom: `2.5px solid ${TOKEN.ink}`,
      flexShrink: 0,
    }}>
      <div>
        <div style={{
          fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: live ? TOKEN.gold2 : TOKEN.ink5,
          marginBottom: 5,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {live ? (
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: '#22C55E',
              display: 'inline-block', flexShrink: 0,
              animation: 'flyers-pulse 2.2s ease infinite',
            }} />
          ) : (
            <span style={{ width: 18, height: 1, background: TOKEN.gold2, opacity: 0.5, display: 'inline-block', flexShrink: 0 }} />
          )}
          {eyebrow}
        </div>
        <div style={{
          fontFamily: FONT.serif, fontWeight: 700, fontSize: 22,
          color: TOKEN.ink, lineHeight: 1,
        }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── Col 1: Sponsors ───────────────────────────────────────────────
function SponsorsCol({
  sponsors, loading, onAdvertise,
}: {
  sponsors: Sponsor[];
  loading: boolean;
  onAdvertise: () => void;
}) {
  const TINTS = [
    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    { bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
    { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
    { bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC' },
  ];

  // Badge accent colours — cycles per sponsor index
  const BADGE_ACCENTS = [
    { bg: '#7f1d1d', text: '#fca5a5' }, // deep red
    { bg: '#14532d', text: '#86efac' }, // deep green
    { bg: '#713f12', text: '#fde68a' }, // deep amber
    { bg: '#1e1b4b', text: '#c7d2fe' }, // deep indigo
    { bg: '#4a044e', text: '#f5d0fe' }, // deep purple
  ];

  const visible = sponsors.slice(0, 5);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: TOKEN.white,
      borderRight: `1px solid ${TOKEN.border}`,
      height: '100%', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes sp-flash { 0%,100%{opacity:1} 50%{opacity:.6} }
        .sp-offer-badge { animation: sp-flash 2.4s ease infinite; }
        .sp-row-link:hover .sp-offer-strip { opacity: 1 !important; }
        .sp-row-link:hover { background: ${TOKEN.bg} !important; }
        .sp-row-plain:hover { background: ${TOKEN.bg} !important; }
      `}</style>

      <ColHeader
        eyebrow="Promoted · Partners"
        title="Sponsors"
        action={<GhostBtn label="Advertise →" onClick={onAdvertise} />}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

        {/* ── Loading skeleton ── */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ flex: 1, padding: '0 16px', borderBottom: `1px solid ${TOKEN.border}`, display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, background: TOKEN.bg3, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, width: '52%', background: TOKEN.bg3, marginBottom: 7 }} />
              <div style={{ height: 7, width: '70%', background: TOKEN.border }} />
            </div>
          </div>
        ))}

        {/* ── Empty ── */}
        {!loading && visible.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.8 }}>
              No sponsors yet.<br />Be the first to advertise.
            </div>
          </div>
        )}

        {/* ── Sponsor rows ── */}
        {!loading && visible.map((s, idx) => {
          const tint      = TINTS[idx % TINTS.length];
          const badge_acc = BADGE_ACCENTS[idx % BADGE_ACCENTS.length];
          const hasWeb    = !!s.website_url?.trim();
          const hasOffer  = !!(s.offer_text?.trim() || s.tagline?.trim());
          const hasBadge  = !!s.offer_badge?.trim();

          const rowContent = (
            <>
              {/* ── Logo / initials ── */}
              <div style={{ flexShrink: 0, position: 'relative' }}>
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name}
                    style={{ width: 40, height: 40, objectFit: 'cover', display: 'block', border: `1px solid ${TOKEN.border}` }} />
                ) : (
                  <div style={{
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tint.bg, color: tint.color, border: `1px solid ${tint.border}`,
                    fontFamily: FONT.serif, fontWeight: 900, fontSize: 14,
                  }}>
                    {toInitials(s.name)}
                  </div>
                )}
                {/* Flash sale badge on logo corner */}
                {hasBadge && (
                  <span
                    className="sp-offer-badge"
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      background: badge_acc.bg, color: badge_acc.text,
                      fontFamily: FONT.mono, fontSize: 6, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 5px', whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}>
                    {s.offer_badge}
                  </span>
                )}
              </div>

              {/* ── Text ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + tier */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: hasOffer ? 3 : 0 }}>
                  <span style={{
                    fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700,
                    color: TOKEN.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {s.name}
                  </span>
                  {hasWeb && <span style={{ fontSize: 8, color: TOKEN.ink5, fontFamily: FONT.mono, flexShrink: 0 }}>↗</span>}
                  <span style={{
                    fontFamily: FONT.mono, fontSize: 6.5, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '2px 6px', flexShrink: 0, border: '1px solid', marginLeft: 'auto',
                    ...(s.tier === 'Gold'
                      ? { background: '#FEF9C3', color: '#92400E', borderColor: '#FCD34D' }
                      : { background: TOKEN.goldx, color: TOKEN.gold, borderColor: 'rgba(180,135,40,.35)' }),
                  }}>
                    {s.tier}
                  </span>
                </div>

                {/* Tagline — always visible if set */}
                {s.tagline?.trim() && (
                  <div style={{
                    fontFamily: FONT.mono, fontSize: 8.5, color: TOKEN.ink4,
                    letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: s.offer_text?.trim() ? 4 : 0,
                  }}>
                    {s.tagline}
                  </div>
                )}

                {/* Offer strip — highlighted */}
                {s.offer_text?.trim() && (
                  <div
                    className="sp-offer-strip"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '3px 7px',
                      background: TOKEN.goldx,
                      border: `1px solid rgba(180,135,40,.25)`,
                      opacity: 0.9, transition: 'opacity .15s',
                    }}
                  >
                    <span style={{ fontSize: 8, flexShrink: 0 }}>✦</span>
                    <span style={{
                      fontFamily: FONT.mono, fontSize: 8, fontWeight: 700,
                      color: TOKEN.gold2, letterSpacing: '0.04em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.offer_text}
                    </span>
                  </div>
                )}

                {/* Fallback — category + location when no offer */}
                {!hasOffer && (
                  <div style={{
                    fontFamily: FONT.mono, fontSize: 8.5, color: TOKEN.ink5,
                    letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {s.category}{s.location ? ` · ${s.location}` : ''}
                  </div>
                )}
              </div>
            </>
          );

          const baseStyle: React.CSSProperties = {
            flex: 1, display: 'flex', alignItems: 'center', gap: 11,
            padding: '0 14px', borderBottom: `1px solid ${TOKEN.border}`,
            minHeight: 0, transition: 'background .12s',
          };

          return hasWeb ? (
            <a
              key={s.id}
              href={s.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="sp-row-link"
              style={{ ...baseStyle, textDecoration: 'none', cursor: 'pointer', background: 'transparent' }}
            >
              {rowContent}
            </a>
          ) : (
            <div key={s.id} className="sp-row-plain" style={{ ...baseStyle, background: 'transparent' }}>
              {rowContent}
            </div>
          );
        })}
      </div>

      {/* ── Advertise CTA ── */}
      <style>{`
        @keyframes sp-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes sp-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(180,135,40,0); }
          50% { box-shadow: 0 0 12px 2px rgba(180,135,40,0.18); }
        }
        .sp-cta-btn { transition: background .15s; }
        .sp-cta-btn:hover { background: ${TOKEN.ink} !important; }
        .sp-cta-btn:hover .sp-cta-text { color: ${TOKEN.white} !important; }
        .sp-cta-btn:hover .sp-cta-arrow { color: ${TOKEN.gold2} !important; opacity: 1 !important; }
        .sp-cta-btn:hover .sp-bulb { background: ${TOKEN.gold2} !important; animation: none !important; }
        .sp-cta-btn:hover .sp-bulb-label { color: ${TOKEN.gold2} !important; }
      `}</style>
      <div
        className="sp-cta-btn"
        onClick={onAdvertise}
        style={{
          flexShrink: 0,
          height: 56,
          display: 'flex', alignItems: 'center',
          padding: '0 16px',
          background: TOKEN.ink,
          borderTop: `3px solid ${TOKEN.gold2}`,
          cursor: 'pointer', gap: 12,
          animation: 'sp-glow 2.8s ease infinite',
        }}
      >
        {/* Blinking bulb */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <div
            className="sp-bulb"
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: TOKEN.gold2,
              animation: 'sp-blink 1.1s step-start infinite',
            }}
          />
          <div
            className="sp-bulb-label"
            style={{
              fontFamily: FONT.mono, fontSize: 5.5, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: TOKEN.gold2,
              animation: 'sp-blink 1.1s step-start infinite',
            }}
          >ad</div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="sp-cta-text"
            style={{
              fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)',
              fontWeight: 700, lineHeight: 1.5,
            }}
          >
            Promote your business
          </div>
          <div style={{
            fontFamily: FONT.mono, fontSize: 7, letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.35)', marginTop: 1,
          }}>
            77 districts · reach Nepal
          </div>
        </div>

        {/* Arrow */}
        <span
          className="sp-cta-arrow"
          style={{ fontFamily: FONT.mono, fontSize: 16, color: TOKEN.gold2, opacity: 0.7, flexShrink: 0 }}
        >→</span>
      </div>
    </div>
  );
}

// ── Col 2: Lost & Found ───────────────────────────────────────────
function LostFoundCol({
  items, loading, onReport, onViewAll,
}: {
  items: LostFoundItem[];
  loading: boolean;
  onReport: () => void;
  onViewAll: () => void;
}) {
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);
  const swipeStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = items.length;

  const goTo = useCallback((next: number) => {
    const idx = ((next % (n || 1)) + (n || 1)) % (n || 1);
    setFading(true);
    setTimeout(() => { setCur(idx); setFading(false); }, 200);
  }, [n]);

  useEffect(() => {
    if (n < 2) return;
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCur(c => { setFading(false); return (c + 1) % n; }); }, 200);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  const item = items[cur];
  const isLost = item?.type === 'lost';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      background: TOKEN.bg2,
      borderRight: `1px solid ${TOKEN.border}`,
    }}>
      <style>{`
        @keyframes lf-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes lf-prog {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .lf-fade { transition: opacity .2s ease; }
        .lf-fade.out { opacity: 0; }
        .lf-in { animation: lf-up .3s cubic-bezier(0.22,1,0.36,1) both; }
        .lf-nav-btn { transition: background .15s; }
        .lf-nav-btn:hover { background: rgba(0,0,0,0.42) !important; }
        .lf-phone:hover { opacity: 0.88; }
        .lf-cta:hover { background: ${TOKEN.gold2} !important; }
        .lf-cta:hover .lf-cta-label { color: ${TOKEN.ink} !important; }
        .lf-cta:hover .lf-cta-plus { background: ${TOKEN.ink} !important; color: ${TOKEN.gold2} !important; }
      `}</style>

      {/* ── Header ── */}
      <ColHeader
        eyebrow="Community · गुमेका वस्तुहरू"
        title="Lost & Found"
        action={<GhostBtn label="View all →" onClick={onViewAll} />}
      />

      {/* ── Progress bar ── */}
      {n > 1 && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{
              flex: 1, height: 3, background: TOKEN.border2,
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}>
              {i === cur && (
                <div style={{
                  position: 'absolute', inset: 0, background: TOKEN.gold2,
                  transformOrigin: 'left', animation: 'lf-prog 5s linear both',
                }} />
              )}
              {i < cur && <div style={{ position: 'absolute', inset: 0, background: TOKEN.gold2, opacity: 0.4 }} />}
            </div>
          ))}
        </div>
      )}

      {/* ── PHOTO — 50% of column ── */}
      <div
        style={{ flex: '0 0 50%', position: 'relative', overflow: 'hidden', minHeight: 0 }}
        onTouchStart={e => { swipeStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = swipeStartX.current - e.changedTouches[0].clientX;
          if (dx > 40) goTo(cur + 1);
          if (dx < -40) goTo(cur - 1);
        }}
      >
        <div className={`lf-fade${fading ? ' out' : ''}`} style={{ width: '100%', height: '100%' }}>
          {loading ? (
            <div style={{ width: '100%', height: '100%', background: TOKEN.bg3 }} />
          ) : item?.photo_url ? (
            <img src={item.photo_url} alt={item?.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(150deg, ${TOKEN.bg3} 0%, ${TOKEN.bg2} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 56, opacity: 0.13, userSelect: 'none' }}>
                {isLost ? '🔍' : '📦'}
              </span>
            </div>
          )}
        </div>

        {/* Seamless scrim */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
          background: `linear-gradient(to top, ${TOKEN.bg2} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }} />

        {/* Type badge */}
        {!loading && item && (
          <div style={{
            position: 'absolute', bottom: 10, left: 12,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px',
            fontFamily: FONT.mono, fontSize: 7.5, fontWeight: 700,
            letterSpacing: '0.13em', textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
            ...(isLost
              ? { background: 'rgba(127,29,29,0.88)', color: '#fca5a5' }
              : { background: 'rgba(20,83,45,0.88)', color: '#86efac' }),
          }}>
            {isLost ? '✦ LOST' : '◈ FOUND'}
          </div>
        )}

        {/* Time */}
        {!loading && item && (
          <div style={{
            position: 'absolute', top: 9, right: 10,
            background: 'rgba(17,16,9,0.5)', backdropFilter: 'blur(5px)',
            padding: '2px 8px',
            fontFamily: FONT.mono, fontSize: 7.5, color: 'rgba(255,255,255,0.82)',
            letterSpacing: '0.05em',
          }}>
            {timeAgo(item.created_at)}
          </div>
        )}

        {/* Nav arrows */}
        {n > 1 && !loading && (
          <>
            <button className="lf-nav-btn" onClick={() => goTo(cur - 1)} style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              width: 26, height: 26, borderRadius: '50%', zIndex: 4,
              border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.22)',
              color: '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>
            <button className="lf-nav-btn" onClick={() => goTo(cur + 1)} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              width: 26, height: 26, borderRadius: '50%', zIndex: 4,
              border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.22)',
              color: '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>
          </>
        )}
      </div>

      {/* ── DESCRIPTION — fills remaining space ── */}
      <div
        className={fading ? '' : 'lf-in'}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '10px 16px 6px', minHeight: 0, overflow: 'hidden',
          background: TOKEN.bg2,
        }}
      >
        {loading ? (
          <>
            <div style={{ height: 15, width: '72%', background: TOKEN.border, marginBottom: 9 }} />
            <div style={{ height: 10, width: '100%', background: TOKEN.border, marginBottom: 5 }} />
            <div style={{ height: 10, width: '80%', background: TOKEN.border }} />
          </>
        ) : !item ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
              No reports yet.<br />Be the first to post.
            </span>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: FONT.serif, fontSize: 15, fontWeight: 700,
              color: TOKEN.ink, lineHeight: 1.2, marginBottom: 5, flexShrink: 0,
              display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>
              {item.title}
            </div>
            <div style={{
              fontFamily: FONT.sans, fontSize: 11.5, color: TOKEN.ink4,
              lineHeight: 1.6, flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>
              {item.description}
            </div>
          </>
        )}
      </div>

      {/* ── BOTTOM — same height & style as Promote strip ── */}
      <div style={{
        flexShrink: 0,
        height: 56,
        display: 'flex',
        alignItems: 'stretch',
        borderTop: `3px solid ${TOKEN.gold2}`,
        background: TOKEN.ink,
      }}>

        {/* BOX 1 — Contact info on ink bg */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
          padding: '0 16px',
          minWidth: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}>

          {/* Row 1: phone icon + number + WA icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <a
              href={item ? `tel:${item.phone}` : '#'}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                textDecoration: 'none', flex: 1, minWidth: 0,
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z"/>
              </svg>
              <span style={{
                fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
                color: TOKEN.gold2, letterSpacing: '0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item?.phone ?? '—'}
              </span>
            </a>
            {/* WhatsApp */}
            <a
              href={item ? `https://wa.me/977${(item.phone ?? '').replace(/^0/, '')}` : '#'}
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#25D366', flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#1da851'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#25D366'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* Row 2: location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{
              fontFamily: FONT.mono, fontSize: 10, color: 'rgba(255,255,255,0.4)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item?.location ?? '—'}
            </span>
          </div>
        </div>

        {/* BOX 2 — Report button */}
        <div
          className="lf-cta"
          onClick={onReport}
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '0 16px', flexShrink: 0,
            background: TOKEN.gold2, cursor: 'pointer',
            transition: 'background .18s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = TOKEN.gold2}
        >
          <span className="lf-cta-plus" style={{
            width: 18, height: 18, borderRadius: '50%',
            background: TOKEN.ink, color: TOKEN.gold2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, lineHeight: 1, fontWeight: 700,
            transition: 'background .18s, color .18s',
          }}>+</span>
          <span className="lf-cta-label" style={{
            fontFamily: FONT.mono, fontSize: 7, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: TOKEN.ink, fontWeight: 700,
            transition: 'color .18s',
          }}>Report</span>
        </div>
      </div>

    </div>
  );
}

// ── Cat route map — maps catKey → page path ───────────────────────
const CAT_ROUTES: Record<string, string> = {
  'real-estate':  '/real-estate',
  'jobs':         '/jobs',
  'services':     '/services',
  'matrimonial':  '/matrimonial',
  'automobiles':  '/automobiles',
  'notices':      '/notices',
  'general':      '/',
};

// Fallback colors for categories not in CAT_COLORS
const CAT_PILL_FALLBACK = { bg: '#F0EDE6', color: '#6A6458', border: '#DDD8CE' };

// ── Col 3: Live Feed ──────────────────────────────────────────────
const FEED_CAP = 10; // max rows shown; oldest drops off when newer arrive

function LiveFeedCol({
  items,
  loading,
  newEntryId,
  onViewAll,
  onNavigate,
  onCategoryNavigate,
}: {
  items: LiveFeedItem[];
  loading: boolean;
  newEntryId: string | null;
  onViewAll: () => void;
  onNavigate: (id: string) => void;
  onCategoryNavigate: (catKey: string) => void;
}) {
  const visible = items.slice(0, FEED_CAP);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: TOKEN.white, overflow: 'hidden', height: '100%' }}>

      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
        padding: '18px 24px 14px',
        borderBottom: `2.5px solid ${TOKEN.ink}`,
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: TOKEN.gold2, marginBottom: 5,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: '#22C55E',
              display: 'inline-block', flexShrink: 0,
              animation: 'flyers-pulse 2.2s ease infinite',
            }} />
            Live · Updating now
          </div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 22, color: TOKEN.ink, lineHeight: 1 }}>
            Latest Ads
          </div>
        </div>
        <GhostBtn label="View all →" onClick={onViewAll} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          Array.from({ length: FEED_CAP }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 16px 0 24px',
              borderBottom: i < FEED_CAP - 1 ? `1px solid ${TOKEN.border}` : 'none',
              opacity: 1 - i * 0.09,
            }}>
              <div style={{ width: 58, height: 18, background: TOKEN.bg3, borderRadius: 2, flexShrink: 0, animation: 'flyers-skeleton 1.4s ease infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '70%', background: TOKEN.border, marginBottom: 5, animation: 'flyers-skeleton 1.4s ease infinite' }} />
                <div style={{ height: 8, width: '45%', background: TOKEN.bg3, animation: 'flyers-skeleton 1.4s ease infinite' }} />
              </div>
              <div style={{ width: 24, height: 8, background: TOKEN.bg3, flexShrink: 0, animation: 'flyers-skeleton 1.4s ease infinite' }} />
            </div>
          ))
        ) : visible.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 10, color: TOKEN.ink5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              No listings yet
            </span>
          </div>
        ) : (
          visible.map((item, i) => {
            const catColor = CAT_COLORS[item.catKey as CatKey] ?? CAT_PILL_FALLBACK;
            const isNew    = item.id === newEntryId;
            const isLast   = i === visible.length - 1;

            return (
              <div
                key={item.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  paddingRight: 16,
                  paddingLeft: isNew ? 20 : 24,
                  borderBottom: isLast ? 'none' : `1px solid ${TOKEN.border}`,
                  borderLeft: isNew ? `4px solid ${TOKEN.gold2}` : '4px solid transparent',
                  background: isNew ? `rgba(180,135,40,.04)` : 'transparent',
                  transition: 'background 0.12s',
                  animation: isNew
                    ? 'live-slide-in 0.45s cubic-bezier(0.22,1,0.36,1) both'
                    : `flyers-feed-in 0.28s ease ${i * 0.04}s both`,
                  minHeight: 0,
                }}
                onMouseEnter={e => {
                  if (!isNew) (e.currentTarget as HTMLDivElement).style.background = TOKEN.bg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = isNew ? 'rgba(180,135,40,.04)' : 'transparent';
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); onCategoryNavigate(item.catKey); }}
                  title={`Browse ${item.cat}`}
                  style={{
                    fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    border: `1px solid ${catColor.border}`,
                    background: catColor.bg,
                    color: catColor.color,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    lineHeight: 1.7,
                    fontWeight: 700,
                    borderRadius: 2,
                    filter: 'saturate(1.4)',
                    transition: 'filter 0.1s, transform 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.filter = 'saturate(2) brightness(0.92)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.filter = 'saturate(1.4)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }}
                >
                  {item.cat}
                </button>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigate(item.id)}
                  onKeyDown={e => { if (e.key === 'Enter') onNavigate(item.id); }}
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer', outline: 'none', transition: 'opacity 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.7'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                >
                  <div style={{
                    fontFamily: FONT.serif, fontSize: 13, fontWeight: 700,
                    color: TOKEN.ink, lineHeight: 1.25, marginBottom: 2,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {isNew && (
                      <span style={{
                        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                        background: TOKEN.gold2, flexShrink: 0,
                        animation: 'flyers-pulse 1.8s ease infinite',
                      }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5,
                  }}>
                    {item.loc && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                        {item.loc}
                      </span>
                    )}
                    {item.loc && item.phone && <span style={{ color: TOKEN.border2, flexShrink: 0 }}>·</span>}
                    {item.phone && <span style={{ flexShrink: 0 }}>{item.phone}</span>}
                    {item.premium && (
                      <>
                        <span style={{ color: TOKEN.border2, flexShrink: 0 }}>·</span>
                        <span style={{ color: TOKEN.gold2, flexShrink: 0 }}>★</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{
                  fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {item.time}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Ad Post Modal ─────────────────────────────────────────────────
function AdPostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: TOKEN.white,
        width: '100%', maxWidth: 520,
        maxHeight: '92vh', overflowY: 'auto',
        margin: '0 16px',
        boxShadow: '0 24px 80px rgba(0,0,0,.35)',
        animation: 'modal-in 0.2s ease',
      }}>
        <div style={{ height: 3, background: TOKEN.ink }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px',
          position: 'sticky', top: 0, background: TOKEN.white, zIndex: 1,
          borderBottom: `1px solid ${TOKEN.border}`,
        }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 22, color: TOKEN.ink, lineHeight: 1 }}>Post Your Ad</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: TOKEN.ink5, marginTop: 4 }}>Flyers · Classified Advertisement</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${TOKEN.border}`, padding: '6px 12px', cursor: 'pointer', color: TOKEN.ink5, fontSize: 14, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px 32px' }}>
          <AdForm onSuccess={() => { onSuccess(); onClose(); }} />
        </div>
      </div>
    </div>
  );
}

// ── Notices preview ───────────────────────────────────────────────
function NoticesPreview() {
  const navigate                  = useNavigate();
  const [premium,  setPremium]    = useState<Notice[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [cur,      setCur]        = useState(0);
  const [showForm, setShowForm]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API}/notices?limit=20`)
      .then(r => r.json())
      .then((d: { notices: Notice[] }) => setPremium((d.notices ?? []).filter(n => n.is_premium)))
      .catch(() => setPremium([]))
      .finally(() => setLoading(false));
  }, []);

  const n = premium.length;

  useEffect(() => {
    if (n < 2) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  const goTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const next = ((i % (n || 1)) + (n || 1)) % (n || 1);
    setCur(next);
    if (n > 1) timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
  };

  const slot = (offset: number) => premium[((cur + offset) % n + n) % n];

  return (
    <>
      <style>{`
        @keyframes nc-in { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
        .nc-center { animation: nc-in .35s cubic-bezier(0.22,1,0.36,1) both; }
        .nc-side-card { transition: opacity .3s, transform .3s, filter .3s; }
        .nc-nav:hover { background: ${TOKEN.ink} !important; color: ${TOKEN.white} !important; }
      `}</style>
      <div style={{ background: TOKEN.bg3 }}>
        <div style={{ height: 4, background: `repeating-linear-gradient(90deg,${TOKEN.gold2} 0,${TOKEN.gold2} 5px,${TOKEN.goldx} 5px,${TOKEN.goldx} 10px)` }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '24px 52px 0' }}>
          <div>
            <div style={{ fontFamily: FONT.deva, fontWeight: 800, fontSize: 34, color: TOKEN.ink, lineHeight: 1 }}>सूचनाहरू</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold, marginTop: 5 }}>
              Notices · Death &amp; Celebration
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/notices')} style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '7px 14px', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white, color: TOKEN.ink4, cursor: 'pointer' }}>View all</button>
            <button onClick={() => setShowForm(true)} style={{ background: TOKEN.ink, color: TOKEN.white, border: 'none', padding: '8px 16px', fontFamily: FONT.deva, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ सूचना दिनुहोस्</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}`, marginTop: 14 }}>
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 52px' }}>
            {NOTICE_TABS.slice(0, 5).map(t => (
              <button key={t.key} onClick={() => navigate('/notices')} style={{ fontFamily: FONT.deva, fontWeight: t.key === '' ? 700 : 500, padding: '10px 14px', border: 'none', background: 'none', color: t.key === '' ? TOKEN.ink : TOKEN.ink5, borderBottom: `2px solid ${t.key === '' ? TOKEN.ink : 'transparent'}`, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer' }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Carousel body */}
        <div style={{ padding: '24px 52px 28px' }}>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 20 }}>
              {[0,1,2].map(i => <div key={i} style={{ height: 240, background: TOKEN.border, opacity: 0.22 }} />)}
            </div>
          )}

          {!loading && n === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', fontFamily: FONT.mono, fontSize: 10, color: TOKEN.ink5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              No premium notices yet ·{' '}
              <button onClick={() => setShowForm(true)} style={{ background: 'none', border: 'none', color: TOKEN.gold2, fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', textDecoration: 'underline' }}>Post one</button>
            </div>
          )}

          {!loading && n === 1 && (
            <div style={{ maxWidth: 340, margin: '0 auto' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, zIndex: 3, background: TOKEN.gold2, color: TOKEN.ink, fontFamily: FONT.mono, fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', textTransform: 'uppercase' }}>★ PREMIUM</div>
                <NoticeCard notice={premium[0]} />
              </div>
            </div>
          )}

          {!loading && n > 1 && (
            <div style={{ position: 'relative', padding: '0 36px' }}>
              {/* ★ label + counter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold2, fontWeight: 700 }}>★ Featured Premium Notices</span>
                <div style={{ flex: 1, height: 1, background: TOKEN.gold2, opacity: 0.2 }} />
                <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5 }}>{cur + 1} / {n}</span>
              </div>

              {/* 3-slot stage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 16, alignItems: 'center' }}>

                {/* LEFT */}
                <div className="nc-side-card" onClick={() => goTo(cur - 1)} style={{ opacity: 0.4, transform: 'scale(0.88) translateX(8px)', cursor: 'pointer', filter: 'grayscale(0.25)', transformOrigin: 'right center', pointerEvents: 'auto' }}>
                  <NoticeCard notice={slot(-1)} />
                </div>

                {/* CENTER */}
                <div key={`center-${cur}`} className="nc-center" style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, zIndex: 3, background: TOKEN.gold2, color: TOKEN.ink, fontFamily: FONT.mono, fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', textTransform: 'uppercase' }}>★ PREMIUM</div>
                  <NoticeCard notice={premium[cur]} />
                </div>

                {/* RIGHT */}
                <div className="nc-side-card" onClick={() => goTo(cur + 1)} style={{ opacity: 0.4, transform: 'scale(0.88) translateX(-8px)', cursor: 'pointer', filter: 'grayscale(0.25)', transformOrigin: 'left center', pointerEvents: 'auto' }}>
                  <NoticeCard notice={slot(1)} />
                </div>
              </div>

              {/* Nav arrows */}
              <button className="nc-nav" onClick={() => goTo(cur - 1)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white, cursor: 'pointer', fontSize: 16, color: TOKEN.ink4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', zIndex: 5 }}>‹</button>
              <button className="nc-nav" onClick={() => goTo(cur + 1)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white, cursor: 'pointer', fontSize: 16, color: TOKEN.ink4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', zIndex: 5 }}>›</button>

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 14 }}>
                {premium.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} style={{ width: i === cur ? 20 : 6, height: 6, borderRadius: 3, border: 'none', background: i === cur ? TOKEN.gold2 : TOKEN.border2, cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <NoticeForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); navigate('/notices'); }}
        />
      )}
    </>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────
export default function HomePage() {
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();

  const [liveFeed,       setLiveFeed]       = useState<LiveFeedItem[]>([]);
  const [sponsors,       setSponsors]       = useState<Sponsor[]>([]);
  const [lostFound,      setLostFound]      = useState<LostFoundItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [feedLoading,    setFeedLoading]    = useState(true);
  const [sponsorLoading, setSponsorLoading] = useState(true);
  const [lfLoading,      setLfLoading]      = useState(true);
  const [newEntryId,     setNewEntryId]     = useState<string | null>(null);
  const [refreshKey,     setRefreshKey]     = useState(0);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const [showLogin,   setShowLogin]   = useState(false);
  const [showAdForm,  setShowAdForm]  = useState(false);
  const [showLFModal, setShowLFModal] = useState(false);   // ← NEW
  const pendingAdRef = useRef(false);

  const handlePostAd = () => {
    if (isLoggedIn) { setShowAdForm(true); }
    else { pendingAdRef.current = true; setShowLogin(true); }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingAdRef.current) { pendingAdRef.current = false; setShowAdForm(true); }
  };

  const handleAdSuccess = () => {
    setShowAdForm(false);
    setRefreshKey(k => k + 1);
  };

  // ── Refetch lost & found after a successful report ────────────
  const refetchLostFound = () => {
    fetch(`${API}/lost-found?limit=8`)
      .then(r => r.json())
      .then((d: { items: LostFoundItem[] }) => setLostFound(d.items ?? []))
      .catch(() => {});
  };

  // ── Live feed polling ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchFeed = (isFirst = false) => {
      if (isFirst) setFeedLoading(true);
      fetch(`${API}/ads/live?limit=10`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d: { data: Record<string, unknown>[] }) => {
          if (cancelled) return;
          const mapped = (d.data ?? []).map(mapAdToFeedItem);
          mapped.forEach(item => {
            if (!prevIdsRef.current.has(item.id)) {
              setNewEntryId(item.id);
              setTimeout(() => setNewEntryId(null), 1500);
            }
          });
          prevIdsRef.current = new Set(mapped.map(i => i.id));
          setLiveFeed(mapped);
          setFeedLoading(false);
        })
        .catch(() => { if (!cancelled) setFeedLoading(false); });
    };

    if (refreshKey > 0) prevIdsRef.current = new Set();
    fetchFeed(true);
    const timer = setInterval(() => fetchFeed(false), POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(timer); };
  }, [refreshKey]);

  // ── Sponsors ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/sponsors?status=active&limit=5`)
      .then(r => r.json())
      .then((d: { sponsors: Sponsor[] }) => setSponsors(d.sponsors ?? []))
      .catch(() => setSponsors([]))
      .finally(() => setSponsorLoading(false));
  }, []);

  // ── Lost & Found ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/lost-found?limit=8`)
      .then(r => r.json())
      .then((d: { items: LostFoundItem[] }) => setLostFound(d.items ?? []))
      .catch(() => setLostFound([]))
      .finally(() => setLfLoading(false));
  }, []);

  // ── Category counts ───────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/categories/counts`)
      .then(r => r.json())
      .then((d: { categories: CategoryCount[] }) => setCategoryCounts(d.categories ?? []))
      .catch(() => setCategoryCounts([]));
  }, [refreshKey]);

  return (
    <>
      <style>{`
        @keyframes feed-flash      { 0%   { background: rgba(180,135,40,.14); } 100% { background: transparent; } }
        @keyframes live-slide-in   { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        @keyframes modal-in        { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes flyers-feed-in  { from { opacity:0; transform:translateY(4px);  } to { opacity:1; transform:none; } }
        @keyframes flyers-skeleton { 0%,100% { opacity:.45; } 50% { opacity:.2; } }
        @keyframes flyers-pulse    { 0%,100% { opacity:1;  } 50% { opacity:.35; } }
      `}</style>

      <LoginModal
        open={showLogin}
        onClose={() => { setShowLogin(false); pendingAdRef.current = false; }}
        onSuccess={handleLoginSuccess}
      />

      {showAdForm && (
        <AdPostModal onClose={() => setShowAdForm(false)} onSuccess={handleAdSuccess} />
      )}

      {/* Lost & Found modal — opens in-place, no page navigation */}
      <LostFoundModal
        open={showLFModal}
        onClose={() => setShowLFModal(false)}
        onSuccess={() => {
          setShowLFModal(false);
          refetchLostFound();   // carousel updates immediately after submit
        }}
      />

      {/* THREE-COLUMN SECTION */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        height: 560,
        borderBottom: `1px solid ${TOKEN.border}`,
        background: TOKEN.bg,
      }}>
        <SponsorsCol
          sponsors={sponsors}
          loading={sponsorLoading}
          onAdvertise={handlePostAd}
        />
        <LostFoundCol
          items={lostFound}
          loading={lfLoading}
          onReport={() => setShowLFModal(true)}
          onViewAll={() => navigate('/lost-found')}
        />
        <LiveFeedCol
          items={liveFeed}
          loading={feedLoading}
          newEntryId={newEntryId}
          onViewAll={() => navigate('/?view=all')}
          onNavigate={(id) => navigate(`/ads/${id}`)}
          onCategoryNavigate={(catKey) => navigate(CAT_ROUTES[catKey] ?? '/')}
        />
      </div>

      {/* Featured Belt */}
      <FeaturedBelt />

      {/* Latest Listings */}
      <div style={{ borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '22px 52px 15px' }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 26, color: TOKEN.ink, lineHeight: 1 }}>Latest Listings</div>
            <div style={{ fontSize: 11, color: TOKEN.ink4, marginTop: 4, fontStyle: 'italic' }}>Verified advertisements from across Nepal</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 52px 32px', background: TOKEN.bg }}>
        <AdList key={`all-${refreshKey}`} refresh={refreshKey} initialCategory="all" />
      </div>

      {/* Browse by Section */}
      <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ padding: '26px 52px 18px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 4 }}>Explore</div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 22, color: TOKEN.ink }}>Browse by Section</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, padding: '0 52px 26px' }}>
          {([
            { value: 'real-estate', path: '/real-estate', label: 'Real Estate', isNP: false },
            { value: 'jobs',        path: '/jobs',        label: 'Employment',  isNP: false },
            { value: 'services',    path: '/services',    label: 'Services',    isNP: false },
            { value: 'matrimonial', path: '/matrimonial', label: 'Matrimonial', isNP: false },
            { value: 'automobiles', path: '/automobiles', label: 'Automobiles', isNP: false },
            { value: 'notices',     path: '/notices',     label: 'सूचनाहरू',   isNP: true  },
          ] as const).map(card => {
            const count = categoryCounts.find(c => c.value === card.value)?.count ?? 0;
            return (
              <button
                key={card.value}
                onClick={() => navigate(card.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '15px 16px', textAlign: 'left',
                  border: `1px solid ${card.isNP ? 'rgba(150,112,26,.28)' : TOKEN.border}`,
                  borderRadius: 10,
                  background: card.isNP ? TOKEN.goldx : TOKEN.bg,
                  cursor: 'pointer', position: 'relative',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(0,0,0,.1)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                }}
              >
                <div style={{
                  position: 'absolute', top: 8, right: 10,
                  fontFamily: FONT.mono, fontSize: 9, fontWeight: 600,
                  color: card.isNP ? '#92400E' : TOKEN.ink5,
                  background: card.isNP ? 'rgba(150,112,26,.12)' : TOKEN.bg2,
                  borderRadius: 20, padding: '1px 7px',
                }}>
                  {count}
                </div>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    fontFamily: card.isNP ? FONT.deva : FONT.sans,
                    color: card.isNP ? '#92400E' : TOKEN.ink,
                    marginBottom: 2,
                  }}>
                    {card.label}
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 10, color: card.isNP ? 'rgba(146,64,14,.6)' : TOKEN.ink5 }}>
                    {count} {card.isNP ? 'notices' : 'listings'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advertise CTA */}
      <div style={{ background: TOKEN.dark, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 55% 70% at 110% -10%,rgba(180,135,40,.12),transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, padding: '40px 52px' }}>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 10 }}>Advertise with Flyers</div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 34, color: TOKEN.white, lineHeight: 1.18, marginBottom: 8 }}>
              Your ad,<br />their <em style={{ color: TOKEN.gold3 }}>attention.</em>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, marginBottom: 22, maxWidth: 440 }}>
              Post a classified in minutes. Buyers, job seekers, and families across all 77 districts of Nepal see your listing the moment it goes live.
            </div>
            <button onClick={handlePostAd} style={{ padding: '12px 30px', background: TOKEN.gold2, color: TOKEN.dark, border: 'none', fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Post an Ad →
            </button>
          </div>
          <div style={{ display: 'flex', flexShrink: 0, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
            {([
              { label: 'Per Word', value: 'Rs. 20',   gold: false },
              { label: 'Minimum', value: 'Rs. 200',  gold: false },
              { label: 'Premium', value: 'Rs. 400+', gold: true  },
            ] as const).map((p, i) => (
              <div key={i} style={{ padding: '20px 30px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 7 }}>{p.label}</div>
                <div style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 500, color: p.gold ? TOKEN.gold3 : 'rgba(255,255,255,.5)' }}>{p.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NoticesPreview />
    </>
  );
}
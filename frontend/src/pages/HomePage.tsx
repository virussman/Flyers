// ================================================================
// FILE: src/pages/HomePage.tsx
// Home page — three-col section (Banner | Premium Notices | Live)
//           + FeaturedBelt + Latest Listings + Advertise CTA + Lost & Found
// ================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate }   from 'react-router-dom';
import AdList            from '@/components/AdList';
import { NoticeCard }    from '@/components/NoticeCards';
import FeaturedBelt      from '@/components/FeaturedBelt';
import LoginModal        from '@/components/LoginModal';
import AdForm            from '@/components/AdForm';
import LostFoundModal    from '@/components/LostFoundModal';
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

interface SponsorRecord {
  id:            number;
  name:          string;
  category:      string;
  location:      string;
  website_url?:  string;
  logo_url?:     string;
  tier:          'Gold' | 'Featured';
  status:        'active' | 'inactive';
  display_order: number;
  tagline?:      string;
  offer_text?:   string;
  offer_badge?:  string;
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

// ── Tints for sponsor initials ───────────────────────────────────
const SP_TINTS = [
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  { bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
  { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  { bg: '#ECFEFF', color: '#0E7490', border: '#A5F3FC' },
];
function spInitials(name: string) {
  const w = name.trim().split(/\s+/);
  return w.length === 1 ? w[0].slice(0, 2).toUpperCase() : (w[0][0] + w[1][0]).toUpperCase();
}

// Badge colour map for offer_badge keywords
const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  HOT:     { bg: '#7f1d1d', text: '#fca5a5' },
  SALE:    { bg: '#14532d', text: '#86efac' },
  NEW:     { bg: '#1e1b4b', text: '#c7d2fe' },
  LIMITED: { bg: '#713f12', text: '#fde68a' },
};
function badgeColor(badge: string) {
  return BADGE_COLORS[badge.toUpperCase()] ?? { bg: '#1a1a1a', text: '#e5e7eb' };
}

// ── Col 1: Sponsors — top banner 50% + bottom HOT/SALE 50% ───────
function SponsorCol({
  sponsors,
  loading,
}: {
  sponsors: SponsorRecord[];
  loading: boolean;
}) {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerFade, setBannerFade] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tileIdx, setTileIdx] = useState(0);
  const [tileFade, setTileFade] = useState(false);
  const tileTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const hotSponsors = sponsors.filter(s => s.offer_badge?.trim());
  const bn = sponsors.length;
  const hn = hotSponsors.length;

  const startBannerTimer = (count: number) => {
    if (bannerTimer.current) clearInterval(bannerTimer.current);
    if (count < 2) return;
    bannerTimer.current = setInterval(() => {
      setBannerFade(true);
      setTimeout(() => { setBannerIdx(c => { setBannerFade(false); return (c + 1) % count; }); }, 200);
    }, 4000);
  };
  useEffect(() => {
    startBannerTimer(bn);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, [bn]);

  const startTileTimer = (count: number) => {
    if (tileTimer.current) clearInterval(tileTimer.current);
    if (count < 2) return;
    tileTimer.current = setInterval(() => {
      setTileFade(true);
      setTimeout(() => { setTileIdx(c => { setTileFade(false); return (c + 1) % count; }); }, 180);
    }, 3500);
  };
  useEffect(() => {
    startTileTimer(hn);
    return () => { if (tileTimer.current) clearInterval(tileTimer.current); };
  }, [hn]);

  const goBanner = (next: number) => {
    const idx = ((next % (bn || 1)) + (bn || 1)) % (bn || 1);
    setBannerFade(true);
    setTimeout(() => { setBannerIdx(idx); setBannerFade(false); }, 200);
    startBannerTimer(bn);
  };

  const goTile = (next: number) => {
    const idx = ((next % (hn || 1)) + (hn || 1)) % (hn || 1);
    setTileFade(true);
    setTimeout(() => { setTileIdx(idx); setTileFade(false); }, 180);
    startTileTimer(hn);
  };

  const banner = sponsors[bannerIdx] ?? null;
  const tile   = hotSponsors[tileIdx] ?? null;
  const tint   = SP_TINTS[bannerIdx % SP_TINTS.length];
  const bc     = tile ? badgeColor(tile.offer_badge ?? '') : { bg: '#1a1a1a', text: '#e5e7eb' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRight: `1px solid ${TOKEN.border}` }}>
      <style>{`
        @keyframes sp-prog    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes sp-drift   { 0%{transform:scale(1.05) translate(0px,0px)} 33%{transform:scale(1.08) translate(-6px,-3px)} 66%{transform:scale(1.06) translate(4px,-5px)} 100%{transform:scale(1.05) translate(0px,0px)} }
        @keyframes sp-bpulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes sp-tile-in { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .sp-banner-img  { animation: sp-drift 14s ease-in-out infinite; }
        .sp-nav-btn:hover { background: rgba(0,0,0,0.42) !important; }
        .sp-tile-row:hover { background: ${TOKEN.bg} !important; }
      `}</style>

      {/* ── Column header ── */}
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
            color: TOKEN.ink5, marginBottom: 5,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 18, height: 1, background: TOKEN.gold2, opacity: 0.5, display: 'inline-block', flexShrink: 0 }} />
            Promoted · Partners
          </div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 22, color: TOKEN.ink, lineHeight: 1 }}>
            Sponsors
          </div>
        </div>
        {bn > 1 && (
          <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5, flexShrink: 0 }}>
            {bannerIdx + 1} / {bn}
          </span>
        )}
      </div>

      {/* ══ TOP 50% — Sponsor banner ══ */}
      <div style={{ flex: '0 0 calc(50% - 57px)', position: 'relative', overflow: 'hidden', minHeight: 0 }}>

        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: TOKEN.bg3, animation: 'flyers-skeleton 1.4s ease infinite' }} />
        )}

        {!loading && (
          <div style={{ position: 'absolute', inset: 0, transition: 'opacity .2s ease', opacity: bannerFade ? 0 : 1 }}>
            {banner?.logo_url ? (
              <img
                key={`sb-${bannerIdx}`}
                src={banner.logo_url}
                alt={banner.name}
                className="sp-banner-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : banner ? (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${tint.bg} 0%, ${TOKEN.bg2} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 72, color: tint.color, opacity: 0.14, userSelect: 'none' }}>
                  {spInitials(banner.name)}
                </span>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', background: TOKEN.bg3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TOKEN.border2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <span style={{ fontFamily: FONT.mono, fontSize: 7.5, color: TOKEN.ink5, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.9 }}>No sponsors yet</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom scrim + info overlay */}
        {!loading && banner && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.28) 60%, transparent 100%)',
            padding: '36px 14px 10px',
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 4, padding: '2px 7px', fontFamily: FONT.mono, fontSize: 6.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', ...(banner.tier === 'Gold' ? { background: 'rgba(254,243,195,0.9)', color: '#92400e' } : { background: 'rgba(180,135,40,0.22)', color: TOKEN.gold2, border: '1px solid rgba(180,135,40,.4)' }) }}>
              {banner.tier}
            </div>
            <div style={{ fontFamily: FONT.serif, fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {banner.name}
            </div>
            {banner.tagline?.trim() && (
              <div style={{ fontFamily: FONT.mono, fontSize: 8.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {banner.tagline}
              </div>
            )}
            {banner.website_url?.trim() && (
              <a
                href={banner.website_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontFamily: FONT.mono, fontSize: 8, color: TOKEN.gold2, textDecoration: 'none', pointerEvents: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {banner.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        )}

        {/* Progress bar */}
        {bn > 1 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 1, zIndex: 5 }}>
            {sponsors.map((_, i) => (
              <div key={i} onClick={() => goBanner(i)} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.18)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {i === bannerIdx && <div style={{ position: 'absolute', inset: 0, background: TOKEN.gold2, transformOrigin: 'left', animation: 'sp-prog 4s linear both' }} />}
                {i < bannerIdx  && <div style={{ position: 'absolute', inset: 0, background: TOKEN.gold2, opacity: 0.5 }} />}
              </div>
            ))}
          </div>
        )}

        {/* Counter + prev/next */}
        {bn > 1 && !loading && (
          <>
            <button className="sp-nav-btn" onClick={() => goBanner(bannerIdx - 1)} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', zIndex: 5, border: '1px solid rgba(255,255,255,.28)', background: 'rgba(0,0,0,.22)', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>‹</button>
            <button className="sp-nav-btn" onClick={() => goBanner(bannerIdx + 1)} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', zIndex: 5, border: '1px solid rgba(255,255,255,.28)', background: 'rgba(0,0,0,.22)', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>›</button>
          </>
        )}
      </div>

      {/* ══ BOTTOM 50% — HOT & SALE tiles (warm light design) ══ */}
      <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', background: TOKEN.bg2, borderTop: `2px solid ${TOKEN.border}`, overflow: 'hidden', minHeight: 0 }}>

        {/* Section header — same style as rest of site */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 6px', flexShrink: 0, borderBottom: `1px solid ${TOKEN.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'sp-bpulse 1.4s step-start infinite' }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 7.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: TOKEN.gold2, fontWeight: 700 }}>Hot Deals &amp; Offers</span>
          </div>
          {hn > 1 && <span style={{ fontFamily: FONT.mono, fontSize: 7.5, color: TOKEN.ink5 }}>{tileIdx + 1} / {hn}</span>}
        </div>

        {/* Tiles */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>

          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px' }}>
              {[0,1,2].map(i => <div key={i} style={{ flex: 1, background: TOKEN.border, animation: 'flyers-skeleton 1.4s ease infinite', opacity: 0.4 - i * 0.1 }} />)}
            </div>
          )}

          {!loading && hn === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 7.5, color: TOKEN.ink5, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 2 }}>
                Add offer badges to sponsors<br />to show deals here
              </span>
            </div>
          )}

          {!loading && tile && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transition: 'opacity .18s', opacity: tileFade ? 0 : 1 }}>

              {/* Featured tile */}
              <div
                key={`tile-${tileIdx}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0 16px',
                  borderBottom: `1px solid ${TOKEN.border}`,
                  animation: 'sp-tile-in .3s cubic-bezier(0.22,1,0.36,1) both',
                  background: TOKEN.white,
                  cursor: tile.website_url?.trim() ? 'pointer' : 'default',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = TOKEN.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = TOKEN.white; }}
                onClick={() => { if (tile.website_url?.trim()) window.open(tile.website_url, '_blank'); }}
              >
                {/* Coloured badge pill */}
                <span style={{
                  background: bc.bg, color: bc.text,
                  fontFamily: FONT.mono, fontSize: 7, fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '3px 7px', flexShrink: 0,
                  animation: 'sp-bpulse 2.2s ease infinite',
                }}>
                  {tile.offer_badge}
                </span>

                {/* Logo */}
                {tile.logo_url
                  ? <img src={tile.logo_url} alt={tile.name} style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0, border: `1px solid ${TOKEN.border}` }} />
                  : <div style={{ width: 36, height: 36, flexShrink: 0, background: TOKEN.bg3, border: `1px solid ${TOKEN.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.serif, fontWeight: 900, fontSize: 13, color: TOKEN.gold2 }}>{spInitials(tile.name)}</div>
                }

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT.serif, fontSize: 13.5, fontWeight: 700, color: TOKEN.ink, lineHeight: 1.2, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tile.name}
                  </div>
                  {(tile.offer_text?.trim() || tile.tagline?.trim()) && (
                    <div style={{ fontFamily: FONT.mono, fontSize: 8.5, color: tile.offer_text?.trim() ? TOKEN.gold2 : TOKEN.ink4, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tile.offer_text?.trim() ? `✦ ${tile.offer_text}` : tile.tagline}
                    </div>
                  )}
                </div>

                {tile.website_url?.trim() && (
                  <span style={{ color: TOKEN.ink5, flexShrink: 0, fontSize: 12 }}>↗</span>
                )}
              </div>

              {/* Secondary mini rows */}
              {hn > 1 && hotSponsors
                .filter((_, i) => i !== tileIdx)
                .slice(0, 2)
                .map(hs => {
                  const hbc = badgeColor(hs.offer_badge ?? '');
                  return (
                    <div
                      key={hs.id}
                      className="sp-tile-row"
                      onClick={() => goTile(hotSponsors.indexOf(hs))}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderTop: `1px solid ${TOKEN.border}`, cursor: 'pointer', transition: 'background .12s', background: TOKEN.bg2 }}
                    >
                      <span style={{ background: hbc.bg, color: hbc.text, fontFamily: FONT.mono, fontSize: 6, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 5px', flexShrink: 0 }}>{hs.offer_badge}</span>
                      {hs.logo_url
                        ? <img src={hs.logo_url} alt={hs.name} style={{ width: 22, height: 22, objectFit: 'cover', flexShrink: 0, border: `1px solid ${TOKEN.border}` }} />
                        : <div style={{ width: 22, height: 22, flexShrink: 0, background: TOKEN.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.serif, fontWeight: 900, fontSize: 8, color: TOKEN.gold2 }}>{spInitials(hs.name)}</div>
                      }
                      <span style={{ fontFamily: FONT.sans, fontSize: 11, color: TOKEN.ink4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{hs.name}</span>
                      {hs.offer_text?.trim() && (
                        <span style={{ fontFamily: FONT.mono, fontSize: 7.5, color: TOKEN.gold2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, maxWidth: 90 }}>
                          {hs.offer_text.slice(0, 24)}{hs.offer_text.length > 24 ? '…' : ''}
                        </span>
                      )}
                    </div>
                  );
                })
              }

              {/* Dot nav */}
              {hn > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '6px 0', flexShrink: 0, borderTop: `1px solid ${TOKEN.border}` }}>
                  {hotSponsors.map((_, i) => (
                    <button key={i} onClick={() => goTile(i)} style={{ width: i === tileIdx ? 14 : 5, height: 5, borderRadius: 3, border: 'none', background: i === tileIdx ? TOKEN.gold2 : TOKEN.border2, cursor: 'pointer', transition: 'all .25s', padding: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Col 2: Premium Notices — max fill, seamless, click → /notices ─
function PremiumNoticesCol({
  notices,
  loading,
  onViewAll,
}: {
  notices: Notice[];
  loading: boolean;
  onViewAll: () => void;
}) {
  const navigate  = useNavigate();
  const [cur, setCur]       = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = notices.length;

  const startTimer = (count: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count < 2) return;
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCur(c => { setFading(false); return (c + 1) % count; }); }, 240);
    }, 5500);
  };

  const goTo = useCallback((next: number) => {
    const idx = ((next % (n || 1)) + (n || 1)) % (n || 1);
    setFading(true);
    setTimeout(() => { setCur(idx); setFading(false); }, 240);
    startTimer(n);
  }, [n]);

  useEffect(() => {
    startTimer(n);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  const NOTICE_TYPE_ROUTES: Record<string, string> = {
    samvedana: 'samvedana', shraddhanjali: 'shraddhanjali',
    bibaha: 'bibaha', bratabandha: 'bratabandha',
    graduation: 'graduation', birth: 'birth', business: 'business',
  };
  const NP_LABEL: Record<string, string> = {
    samvedana: 'समवेदना', shraddhanjali: 'श्रद्धाञ्जली',
    bibaha: 'विवाह', bratabandha: 'व्रतबन्ध',
    graduation: 'उत्तीर्ण', birth: 'जन्म', business: 'व्यापार',
  };

  const notice = notices[cur] ?? null;
  const isObit = notice && ['samvedana','shraddhanjali'].includes(notice.notice_type);

  const handleClick = () => {
    if (!notice) { navigate('/notices'); return; }
    const type = NOTICE_TYPE_ROUTES[notice.notice_type];
    navigate(type ? `/notices?type=${type}` : '/notices');
  };

  return (
    <>
      <style>{`
        @keyframes pn-prog { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes pn-in   { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .pn-fade           { transition:opacity .24s ease; }
        .pn-fade.out       { opacity:0; }
        .pn-card           { animation:pn-in .36s cubic-bezier(0.22,1,0.36,1) both; cursor:pointer; }
        .pn-hint           { opacity:0; transition:opacity .18s; }
        .pn-card:hover .pn-hint { opacity:1; }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:TOKEN.white, borderRight:`1px solid ${TOKEN.border}` }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, padding:'18px 24px 14px', background:TOKEN.white, borderBottom:`2.5px solid ${TOKEN.ink}`, flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:TOKEN.gold2, marginBottom:5, display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:18, height:1, background:TOKEN.gold2, opacity:0.5, display:'inline-block', flexShrink:0 }} />
              Premium · सूचनाहरू
            </div>
            <div style={{ fontFamily:FONT.serif, fontWeight:700, fontSize:22, color:TOKEN.ink, lineHeight:1 }}>Notices</div>
          </div>
          <GhostBtn label="View all →" onClick={onViewAll} />
        </div>

        {/* ── Thin progress bar — flush under header, no gap ── */}
        {n > 1 && (
          <div style={{ display:'flex', flexShrink:0 }}>
            {notices.map((_, i) => (
              <div key={i} onClick={() => goTo(i)}
                style={{ flex:1, height:2, background:TOKEN.bg3, cursor:'pointer', position:'relative', overflow:'hidden' }}>
                {i === cur && <div style={{ position:'absolute', inset:0, background:TOKEN.gold2, transformOrigin:'left', animation:'pn-prog 5.5s linear both' }} />}
                {i < cur   && <div style={{ position:'absolute', inset:0, background:TOKEN.gold2, opacity:0.35 }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Card fills 100% of remaining space ── */}
        <div style={{ flex:1, position:'relative', minHeight:0, overflow:'hidden' }}>

          {/* Skeleton */}
          {loading && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:TOKEN.bg2 }}>
              <div style={{ width:'80%', height:'70%', background:TOKEN.border, opacity:0.25, animation:'flyers-skeleton 1.4s ease infinite' }} />
            </div>
          )}

          {/* Empty */}
          {!loading && n === 0 && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10, background:TOKEN.bg2 }}>
              <span style={{ fontSize:28, opacity:0.1 }}>★</span>
              <span style={{ fontFamily:FONT.mono, fontSize:8, color:TOKEN.ink5, letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center', lineHeight:1.9 }}>No premium notices yet.</span>
            </div>
          )}

          {/* Notice — crossfade container */}
          {!loading && n > 0 && (
            <div className={`pn-fade${fading ? ' out' : ''}`}
              style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}>

              {/* Floating top-left overlay: PREMIUM badge + type */}
              <div style={{ position:'absolute', top:10, left:10, zIndex:3, display:'flex', alignItems:'center', gap:5, pointerEvents:'none' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:6.5, letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, color:TOKEN.gold2, background:TOKEN.ink, padding:'2px 7px' }}>★ PREMIUM</span>
                {notice && (
                  <span style={{
                    fontFamily:FONT.mono, fontSize:6.5, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600,
                    padding:'2px 6px',
                    background: isObit ? 'rgba(55,65,81,0.08)' : TOKEN.goldx,
                    color: isObit ? '#374151' : TOKEN.gold2,
                    border: `1px solid ${isObit ? TOKEN.border : 'rgba(180,135,40,.25)'}`,
                  }}>
                    {NP_LABEL[notice.notice_type] ?? notice.notice_type}
                  </span>
                )}
              </div>

              {/* Floating counter top-right */}
              {n > 1 && (
                <div style={{ position:'absolute', top:10, right:10, zIndex:3, fontFamily:FONT.mono, fontSize:8, color:TOKEN.ink5, background:TOKEN.white, border:`1px solid ${TOKEN.border}`, padding:'2px 7px', pointerEvents:'none' }}>
                  {cur + 1} / {n}
                </div>
              )}

              {/* Card scaled to fill — transformOrigin top center pushes it upward to use all space */}
              <div
                key={`pnc-${cur}`}
                className="pn-card"
                onClick={handleClick}
                title={notice ? `Browse ${NP_LABEL[notice.notice_type] ?? 'Notices'}` : 'View Notices'}
                style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', overflow:'hidden', paddingTop:2 }}
              >
                <div style={{
                  width:'100%',
                  transform:'scale(0.88)',
                  transformOrigin:'top center',
                }}>
                  <NoticeCard notice={notices[cur]} />
                </div>

                {/* Hover hint */}
                <div className="pn-hint" style={{
                  position:'absolute', inset:0,
                  background:'rgba(17,16,9,0.05)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  pointerEvents:'none',
                }}>
                  <div style={{
                    background:'rgba(17,16,9,0.76)', backdropFilter:'blur(8px)',
                    padding:'5px 14px',
                    fontFamily:FONT.mono, fontSize:8, letterSpacing:'0.14em',
                    textTransform:'uppercase', color:TOKEN.gold2, fontWeight:700,
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    → {notice ? `Browse ${NP_LABEL[notice.notice_type] ?? 'Notices'}` : 'View Notices'}
                  </div>
                </div>
              </div>

              {/* Subtle left/right tap zones — no visible buttons, just ghost areas */}
              {n > 1 && (
                <>
                  <div onClick={e => { e.stopPropagation(); goTo(cur - 1); }}
                    style={{ position:'absolute', left:0, top:40, bottom:0, width:28, cursor:'w-resize', zIndex:4, opacity:0 }} />
                  <div onClick={e => { e.stopPropagation(); goTo(cur + 1); }}
                    style={{ position:'absolute', right:0, top:40, bottom:0, width:28, cursor:'e-resize', zIndex:4, opacity:0 }} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Cat route map ─────────────────────────────────────────────────
const CAT_ROUTES: Record<string, string> = {
  'real-estate':  '/real-estate',
  'jobs':         '/jobs',
  'services':     '/services',
  'matrimonial':  '/matrimonial',
  'automobiles':  '/automobiles',
  'notices':      '/notices',
  'general':      '/',
};

const CAT_PILL_FALLBACK = { bg: '#F0EDE6', color: '#6A6458', border: '#DDD8CE' };

// ── Col 3: Live Feed ──────────────────────────────────────────────
const FEED_CAP = 10;

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

// ── Lost & Found Full Section (replaces NoticesPreview) ───────────
function LostFoundSection() {
  const navigate                  = useNavigate();
  const [items,    setItems]      = useState<LostFoundItem[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [cur,      setCur]        = useState(0);
  const [fading,   setFading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const swipeStartX = useRef(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchItems = () => {
    fetch(`${API}/lost-found?limit=10`)
      .then(r => r.json())
      .then((d: { items: LostFoundItem[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const n = items.length;

  const goTo = useCallback((next: number) => {
    const idx = ((next % (n || 1)) + (n || 1)) % (n || 1);
    setFading(true);
    setTimeout(() => { setCur(idx); setFading(false); }, 200);
    if (timerRef.current) clearInterval(timerRef.current);
    if (n > 1) timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCur(c => { setFading(false); return (c + 1) % n; }); }, 200);
    }, 5000);
  }, [n]);

  useEffect(() => {
    if (n < 2) return;
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCur(c => { setFading(false); return (c + 1) % n; }); }, 200);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [n]);

  const item   = items[cur];
  const isLost = item?.type === 'lost';

  return (
    <>
      <style>{`
        @keyframes lfs-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes lfs-prog {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .lfs-fade { transition: opacity .2s ease; }
        .lfs-fade.out { opacity: 0; }
        .lfs-in { animation: lfs-up .35s cubic-bezier(0.22,1,0.36,1) both; }
        .lfs-item:hover { background: ${TOKEN.bg} !important; }
        .lfs-report-btn:hover { background: ${TOKEN.ink} !important; color: ${TOKEN.white} !important; }
      `}</style>

      <div style={{ background: TOKEN.bg2 }}>
        <div style={{ height: 4, background: `repeating-linear-gradient(90deg,${TOKEN.gold2} 0,${TOKEN.gold2} 5px,${TOKEN.goldx} 5px,${TOKEN.goldx} 10px)` }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '24px 52px 0' }}>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 1, background: TOKEN.gold2, opacity: 0.5, display: 'inline-block' }} />
              Community · गुमेका वस्तुहरू
            </div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 34, color: TOKEN.ink, lineHeight: 1 }}>
              Lost &amp; Found
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/lost-found')}
              style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '7px 14px', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white, color: TOKEN.ink4, cursor: 'pointer' }}
            >
              View all
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: TOKEN.ink, color: TOKEN.white, border: 'none', padding: '8px 16px', fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}
            >
              + Report
            </button>
          </div>
        </div>

        {/* Main content — two-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 0, padding: '20px 52px 28px' }}>

          {/* LEFT — Featured carousel card */}
          <div style={{ borderRight: `1px solid ${TOKEN.border}`, paddingRight: 24 }}>

            {/* Progress bar */}
            {n > 1 && (
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                {items.map((_, i) => (
                  <div key={i} onClick={() => goTo(i)} style={{
                    flex: 1, height: 3, background: TOKEN.border2,
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  }}>
                    {i === cur && (
                      <div style={{
                        position: 'absolute', inset: 0, background: TOKEN.gold2,
                        transformOrigin: 'left', animation: 'lfs-prog 5s linear both',
                      }} />
                    )}
                    {i < cur && <div style={{ position: 'absolute', inset: 0, background: TOKEN.gold2, opacity: 0.4 }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Photo */}
            <div
              style={{ position: 'relative', height: 260, overflow: 'hidden', marginBottom: 0 }}
              onTouchStart={e => { swipeStartX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                const dx = swipeStartX.current - e.changedTouches[0].clientX;
                if (dx > 40) goTo(cur + 1);
                if (dx < -40) goTo(cur - 1);
              }}
            >
              <div className={`lfs-fade${fading ? ' out' : ''}`} style={{ width: '100%', height: '100%' }}>
                {loading ? (
                  <div style={{ width: '100%', height: '100%', background: TOKEN.bg3, animation: 'flyers-skeleton 1.4s ease infinite' }} />
                ) : item?.photo_url ? (
                  <img src={item.photo_url} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(150deg, ${TOKEN.bg3} 0%, ${TOKEN.bg2} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 64, opacity: 0.1, userSelect: 'none' }}>
                      {isLost ? '🔍' : '📦'}
                    </span>
                  </div>
                )}
              </div>

              {/* Scrim */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
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
                  <button onClick={() => goTo(cur - 1)} style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 26, height: 26, borderRadius: '50%', zIndex: 4,
                    border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.22)',
                    color: '#fff', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>‹</button>
                  <button onClick={() => goTo(cur + 1)} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 26, height: 26, borderRadius: '50%', zIndex: 4,
                    border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.22)',
                    color: '#fff', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>›</button>
                </>
              )}
            </div>

            {/* Description */}
            <div className={fading ? '' : 'lfs-in'} style={{
              padding: '12px 0 0',
              background: TOKEN.bg2,
            }}>
              {loading ? (
                <>
                  <div style={{ height: 16, width: '72%', background: TOKEN.border, marginBottom: 8 }} />
                  <div style={{ height: 10, width: '100%', background: TOKEN.border, marginBottom: 5 }} />
                  <div style={{ height: 10, width: '60%', background: TOKEN.border }} />
                </>
              ) : !item ? (
                <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  No reports yet.
                </div>
              ) : (
                <>
                  <div style={{
                    fontFamily: FONT.serif, fontSize: 16, fontWeight: 700,
                    color: TOKEN.ink, lineHeight: 1.2, marginBottom: 6,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>
                    {item.title}
                  </div>
                  <div style={{
                    fontFamily: FONT.sans, fontSize: 12, color: TOKEN.ink4,
                    lineHeight: 1.65, marginBottom: 10,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>
                    {item.description}
                  </div>

                  {/* Contact row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: TOKEN.ink,
                    borderTop: `2px solid ${TOKEN.gold2}`,
                  }}>
                    <a href={`tel:${item.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', flex: 1, minWidth: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14z"/>
                      </svg>
                      <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, color: TOKEN.gold2, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.phone}
                      </span>
                    </a>
                    <a
                      href={`https://wa.me/977${(item.phone ?? '').replace(/^0/, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#25D366', flexShrink: 0, textDecoration: 'none' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontFamily: FONT.mono, fontSize: 9, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                        {item.location}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT — List of recent items */}
          <div style={{ paddingLeft: 24 }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 12 }}>
              Recent Reports
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${TOKEN.border}`, opacity: 1 - i * 0.15 }}>
                  <div style={{ width: 44, height: 44, background: TOKEN.bg3, flexShrink: 0, animation: 'flyers-skeleton 1.4s ease infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 11, width: '60%', background: TOKEN.border, marginBottom: 6, animation: 'flyers-skeleton 1.4s ease infinite' }} />
                    <div style={{ height: 8, width: '80%', background: TOKEN.bg3, animation: 'flyers-skeleton 1.4s ease infinite' }} />
                  </div>
                </div>
              ))
            ) : items.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 12 }}>
                <span style={{ fontSize: 36, opacity: 0.2 }}>🔍</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
                  No reports yet.<br />Be the first to post.
                </span>
                <button
                  onClick={() => setShowModal(true)}
                  className="lfs-report-btn"
                  style={{ marginTop: 6, padding: '8px 20px', background: TOKEN.white, border: `1px solid ${TOKEN.border2}`, fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKEN.ink4, cursor: 'pointer', transition: 'background .15s, color .15s' }}
                >
                  + Report Item
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((it, i) => {
                  const isActive = i === cur;
                  const lost     = it.type === 'lost';
                  return (
                    <div
                      key={it.id}
                      className="lfs-item"
                      onClick={() => goTo(i)}
                      style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        padding: '10px 10px',
                        borderBottom: `1px solid ${TOKEN.border}`,
                        cursor: 'pointer', transition: 'background .12s',
                        background: isActive ? TOKEN.goldx : 'transparent',
                        borderLeft: isActive ? `3px solid ${TOKEN.gold2}` : '3px solid transparent',
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: 44, height: 44, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        {it.photo_url ? (
                          <img src={it.photo_url} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            background: lost ? 'rgba(127,29,29,0.08)' : 'rgba(20,83,45,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, opacity: 0.5,
                          }}>
                            {lost ? '🔍' : '📦'}
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                          <span style={{
                            fontFamily: FONT.mono, fontSize: 6.5, fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            padding: '1px 5px',
                            ...(lost
                              ? { background: 'rgba(127,29,29,0.1)', color: '#991b1b' }
                              : { background: 'rgba(20,83,45,0.1)', color: '#166534' }),
                          }}>
                            {lost ? 'LOST' : 'FOUND'}
                          </span>
                          <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.ink5, marginLeft: 'auto', flexShrink: 0 }}>
                            {timeAgo(it.created_at)}
                          </span>
                        </div>
                        <div style={{
                          fontFamily: FONT.serif, fontSize: 13, fontWeight: 700,
                          color: TOKEN.ink, lineHeight: 1.2, marginBottom: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {it.title}
                        </div>
                        <div style={{
                          fontFamily: FONT.sans, fontSize: 11, color: TOKEN.ink4, lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        } as React.CSSProperties}>
                          {it.description}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View all footer */}
                <button
                  onClick={() => navigate('/lost-found')}
                  style={{
                    marginTop: 12, padding: '9px 0',
                    background: 'none', border: `1px solid ${TOKEN.border2}`,
                    fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: TOKEN.ink4, cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = TOKEN.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                >
                  View all reports →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <LostFoundModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchItems(); }}
        />
      )}
    </>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────
export default function HomePage() {
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();

  const [liveFeed,        setLiveFeed]        = useState<LiveFeedItem[]>([]);
  const [sponsors,        setSponsors]        = useState<SponsorRecord[]>([]);
  const [premiumNotices,  setPremiumNotices]  = useState<Notice[]>([]);
  const [categoryCounts,  setCategoryCounts]  = useState<CategoryCount[]>([]);
  const [feedLoading,     setFeedLoading]     = useState(true);
  const [bannerLoading,   setBannerLoading]   = useState(true);  const [noticesLoading,  setNoticesLoading]  = useState(true);
  const [newEntryId,      setNewEntryId]      = useState<string | null>(null);
  const [refreshKey,      setRefreshKey]      = useState(0);
  const prevIdsRef = useRef<Set<string>>(new Set());

  const [showLogin,  setShowLogin]  = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const pendingAdRef = useRef(false);

  const handlePostAd = () => {
    if (isLoggedIn) { setShowAdForm(true); }
    else { pendingAdRef.current = true; setShowLogin(true); }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingAdRef.current) { pendingAdRef.current = false; setShowAdForm(true); }
  };

  // ── Live feed polling ──────────────────────────────────────────
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

  // ── Sponsors ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/sponsors?status=active&limit=10`)
      .then(r => r.json())
      .then((d: { sponsors: SponsorRecord[] }) =>
        setSponsors((d.sponsors ?? []).sort((a, b) => a.display_order - b.display_order))
      )
      .catch(() => setSponsors([]))
      .finally(() => setBannerLoading(false));
  }, []);

  // ── Premium notices ────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/notices?limit=20`)
      .then(r => r.json())
      .then((d: { notices: Notice[] }) => setPremiumNotices((d.notices ?? []).filter(n => n.is_premium)))
      .catch(() => setPremiumNotices([]))
      .finally(() => setNoticesLoading(false));
  }, []);

  // ── Category counts ────────────────────────────────────────────
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAdForm(false)} />
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
              <button onClick={() => setShowAdForm(false)} style={{ background: 'none', border: `1px solid ${TOKEN.border}`, padding: '6px 12px', cursor: 'pointer', color: TOKEN.ink5, fontSize: 14, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px 32px' }}>
              <AdForm onSuccess={() => { setShowAdForm(false); setRefreshKey(k => k + 1); }} />
            </div>
          </div>
        </div>
      )}

      {/* ── THREE-COLUMN SECTION ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        height: 560,
        borderBottom: `1px solid ${TOKEN.border}`,
        background: TOKEN.bg,
      }}>
        {/* Col 1: Sponsors carousel */}
        <SponsorCol
          sponsors={sponsors}
          loading={bannerLoading}
        />

        {/* Col 2: Premium Notices carousel */}
        <PremiumNoticesCol
          notices={premiumNotices}
          loading={noticesLoading}
          onViewAll={() => navigate('/notices')}
        />

        {/* Col 3: Live Feed — unchanged */}
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

      {/* Lost & Found section — replaces NoticesPreview */}
      <LostFoundSection />
    </>
  );
}
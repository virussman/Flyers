// ================================================================
// FILE: src/pages/CategoryPage.tsx
// Generic category page — used for all 5 classified categories.
// Route: /real-estate, /jobs, /services, /matrimonial, /automobiles
// Features:
//   • Custom uploaded banner (from admin)
//   • Category-specific featured belt
//   • Full AdList for that category
//   • Breadcrumb + section header
// ================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdList from '@/components/AdList';
import CategoryBanner from '@/components/CategoryBanner';
import FeaturedBelt from '@/components/FeaturedBelt';
import {
  TOKEN, FONT, SECTION_LABEL, SECTION_DESC, API,
} from '@/lib/constants';
import { IcSearch, IcMapPin, IcArrowLeft } from '@/components/Icons';

interface CategoryPageProps {
  category: string; // 'real-estate' | 'jobs' | 'services' | 'matrimonial' | 'automobiles'
}

export default function CategoryPage({ category }: CategoryPageProps) {
  const navigate = useNavigate();
  const [searchQuery,      setSearchQuery]      = useState('');
  const [locationQuery,    setLocationQuery]    = useState('');
  const [refreshKey,       setRefreshKey]       = useState(0);
  const [recentSearches,   setRecentSearches]   = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  const title = SECTION_LABEL[category] ?? category;
  const desc  = SECTION_DESC[category]  ?? 'Verified listings';

  useEffect(() => {
    fetch(`${API}/search/hints?category=${category}`)
      .then(r => r.json())
      .then((d: { recent: string[]; trending: string[] }) => {
        setRecentSearches(d.recent ?? []);
        setTrendingSearches(d.trending ?? []);
      })
      .catch(() => { setRecentSearches([]); setTrendingSearches([]); });
  }, [category]);

  const handleSearch = () => {
    // AdList will receive searchQuery via props — extend AdList to support it
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      {/* ── CUSTOM BANNER (uploaded via admin) ──────────────── */}
      <CategoryBanner category={category} />

      {/* ── BREADCRUMB BAR ──────────────────────────────────── */}
      <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 52px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em',
              color: TOKEN.ink4, background: 'none', border: 'none', cursor: 'pointer',
              padding: 0,
            }}
          >
            <IcArrowLeft /> Home
          </button>
          <span style={{ color: TOKEN.border2, fontSize: 12 }}>›</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em', color: TOKEN.ink }}>
            {title}
          </span>
        </div>
      </div>

      {/* ── SECTION HEADER ──────────────────────────────────── */}
      <div style={{ background: TOKEN.white, borderBottom: `3px solid ${TOKEN.ink}` }}>
        <div style={{ padding: '28px 52px 22px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold, marginBottom: 6 }}>
            Flyers · {title}
          </div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 44, color: TOKEN.ink, lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: TOKEN.ink4, fontStyle: 'italic' }}>{desc}</div>
        </div>
      </div>

      {/* ── FEATURED BELT for this category ─────────────────── */}
      <FeaturedBelt category={category} />

      {/* ── SEARCH + FILTER BAR ─────────────────────────────── */}
      <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 52px' }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 9, border: `1.5px solid ${TOKEN.border2}`, padding: '10px 14px', background: TOKEN.bg, minHeight: 44 }}>
            <IcSearch size={14} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ border: 'none', background: 'none', fontFamily: FONT.sans, fontSize: 13, color: TOKEN.ink, outline: 'none', width: '100%' }}
              placeholder={`Search in ${title}…`}
              aria-label={`Search ${title}`}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, border: `1.5px solid ${TOKEN.border2}`, padding: '10px 14px', background: TOKEN.bg, minHeight: 44 }}>
            <IcMapPin size={13} />
            <input
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              style={{ border: 'none', background: 'none', fontFamily: FONT.sans, fontSize: 13, color: TOKEN.ink, outline: 'none', width: '100%' }}
              placeholder="District…"
            />
            <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.gold, flexShrink: 0 }}>▾</span>
          </div>
          <button
            onClick={handleSearch}
            style={{ fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', padding: '0 22px', background: TOKEN.ink, color: TOKEN.white, border: 'none', minHeight: 44, cursor: 'pointer', flexShrink: 0 }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Search hints */}
      {(recentSearches.length > 0 || trendingSearches.length > 0) && (
        <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', padding: '7px 52px' }}>
            {recentSearches.length > 0 && (
              <>
                <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOKEN.ink5, flexShrink: 0 }}>Recent</span>
                {recentSearches.map(h => (
                  <div key={h} onClick={() => setSearchQuery(h)} style={{ display: 'inline-flex', alignItems: 'center', fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink4, background: TOKEN.white, border: `1px solid ${TOKEN.border2}`, padding: '3px 10px', borderRadius: 20, flexShrink: 0, cursor: 'pointer' }}>{h}</div>
                ))}
              </>
            )}
            {recentSearches.length > 0 && trendingSearches.length > 0 && (
              <span style={{ width: 1, height: 12, background: TOKEN.border2, flexShrink: 0 }} />
            )}
            {trendingSearches.length > 0 && (
              <>
                <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOKEN.ink5, flexShrink: 0 }}>Trending</span>
                {trendingSearches.map(h => (
                  <div key={h} onClick={() => setSearchQuery(h)} style={{ display: 'inline-flex', alignItems: 'center', fontFamily: FONT.mono, fontSize: 9, color: TOKEN.gold, border: `1px solid rgba(150,112,26,.3)`, background: TOKEN.goldx, padding: '3px 10px', borderRadius: 20, flexShrink: 0, cursor: 'pointer' }}>{h}</div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SORT/FILTER PILLS ───────────────────────────────── */}
      <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 52px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 14px', border: `1px solid ${TOKEN.gold2}`, borderRadius: 20, background: TOKEN.goldx, color: TOKEN.gold, flexShrink: 0, cursor: 'pointer', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>
            ★ Premium first
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 14px', border: `1px solid ${TOKEN.border2}`, borderRadius: 20, background: TOKEN.white, color: TOKEN.ink4, flexShrink: 0, cursor: 'pointer', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>
            Newest
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 14px', border: `1px solid ${TOKEN.border2}`, borderRadius: 20, background: TOKEN.white, color: TOKEN.ink4, flexShrink: 0, cursor: 'pointer', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>
            Price ↑
          </div>
        </div>
      </div>

      {/* ── LISTINGS HEADER ─────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '22px 52px 15px' }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 26, color: TOKEN.ink, lineHeight: 1 }}>
              {title} Listings
            </div>
            <div style={{ fontSize: 11, color: TOKEN.ink4, marginTop: 4, fontStyle: 'italic' }}>
              {desc}
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', color: TOKEN.ink5, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕ Clear filter
          </button>
        </div>
      </div>

      {/* ── AD LIST ─────────────────────────────────────────── */}
      <div style={{ padding: '24px 52px 32px', background: TOKEN.bg }}>
        <AdList
          key={`${category}-${refreshKey}`}
          refresh={refreshKey}
          initialCategory={category}
        />
      </div>

      {/* ── OTHER SECTIONS EXPLORE BAR ──────────────────────── */}
      <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}` }}>
        <div style={{ padding: '20px 52px 16px' }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 12 }}>
            Also browse
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: '🏠 Real Estate', path: '/real-estate', value: 'real-estate' },
              { label: '💼 Employment',  path: '/jobs',        value: 'jobs'        },
              { label: '🔧 Services',    path: '/services',    value: 'services'    },
              { label: '💍 Matrimonial', path: '/matrimonial', value: 'matrimonial' },
              { label: '🚗 Automobiles', path: '/automobiles', value: 'automobiles' },
              { label: '📋 सूचनाहरू',   path: '/notices',     value: 'notices'     },
            ]
              .filter(c => c.value !== category)
              .map(c => (
                <button
                  key={c.value}
                  onClick={() => navigate(c.path)}
                  style={{
                    fontFamily: FONT.sans, fontSize: 12, fontWeight: 500,
                    padding: '8px 16px', border: `1px solid ${TOKEN.border2}`,
                    borderRadius: 20, background: TOKEN.bg, color: TOKEN.ink3,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{c.label}</button>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
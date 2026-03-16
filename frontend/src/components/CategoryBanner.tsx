// ================================================================
// FILE: src/components/CategoryBanner.tsx
// Per-category custom banner — image uploaded via admin panel.
// Falls back gracefully to nothing if no banner is set.
// API: GET /banners/:category → { banner: CategoryBanner | null }
// ================================================================

import { useState, useEffect } from 'react';
import { API, TOKEN, FONT } from '@/lib/constants';
import type { CategoryBanner as CategoryBannerType } from '@/types';

interface CategoryBannerProps {
  category: string; // 'real-estate' | 'jobs' | etc.
}

export default function CategoryBanner({ category }: CategoryBannerProps) {
  const [banner,  setBanner]  = useState<CategoryBannerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!category || category === 'all') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);

    fetch(`${API}/banners/${category}`)
      .then(r => {
        if (!r.ok) throw new Error('No banner');
        return r.json();
      })
      .then((data: { banner: CategoryBannerType | null }) => {
        setBanner(data.banner);
      })
      .catch(() => {
        setBanner(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [category]);

  // No banner configured — render nothing, page content starts immediately
  if (!loading && (!banner || error)) return null;

  // Loading skeleton
  if (loading) {
    return (
      <div style={{
        width: '100%', height: 180,
        background: TOKEN.bg3,
        animation: 'flyers-skeleton 1.4s ease infinite',
      }} />
    );
  }

  if (!banner) return null;

  const inner = (
    <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
      <img
        src={banner.imageUrl}
        alt={banner.altText}
        style={{
          width: '100%',
          maxHeight: 320,
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
        onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Optional gold rule underneath */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg,${TOKEN.gold},${TOKEN.gold3} 45%,${TOKEN.gold2})`,
      }} />
    </div>
  );

  // If banner has a link, wrap in anchor
  if (banner.linkUrl) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textDecoration: 'none' }}
        aria-label={banner.altText}
      >
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}
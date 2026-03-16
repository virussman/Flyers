// ================================================================
// FILE: frontend/src/components/NoticeCards.tsx
// All 6 card types — obituary + 4 new celebration designs
// ================================================================

import type { Notice, NoticeType } from '../types/index';


// ── Shared primitives ─────────────────────────────────────────

const FlameIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none">
    <ellipse cx="20" cy="50" rx="10" ry="5" fill="#c8a84b" opacity="0.3"/>
    <path d="M20 52 C14 52 10 48 10 43 C10 36 14 30 18 24 C16 28 16 32 20 35 C20 35 18 28 22 22 C24 18 26 14 24 8 C28 14 30 22 28 30 C30 26 30 20 28 16 C32 22 34 30 32 38 C30 44 26 50 20 52Z" fill="#c8a84b"/>
    <path d="M20 48 C16 48 14 45 14 42 C14 38 17 34 19 30 C19 33 20 36 22 38 C22 38 21 34 23 30 C25 34 26 38 24 43 C23 46 22 48 20 48Z" fill="#e8c86a"/>
    <path d="M20 44 C18 44 17 43 17 41 C17 39 18 37 20 35 C21 37 21 39 20 41 C21 40 22 38 21 36 C23 38 24 41 22 43 C21 44 20 44 20 44Z" fill="#fff5cc"/>
  </svg>
);

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
const CornerOrnament = ({ pos, color }: { pos: Corner; color: string }) => {
  const isTop = pos.startsWith('top');
  const isLeft = pos.endsWith('Left');
  return (
    <div style={{ position: 'absolute', ...(isTop ? { top: 6 } : { bottom: 6 }), ...(isLeft ? { left: 6 } : { right: 6 }), width: 24, height: 24 }}>
      <div style={{ width: 16, height: 16, borderTop: isTop ? `2px solid ${color}` : 'none', borderBottom: !isTop ? `2px solid ${color}` : 'none', borderLeft: isLeft ? `2px solid ${color}` : 'none', borderRight: !isLeft ? `2px solid ${color}` : 'none' }} />
    </div>
  );
};
const CORNERS: Corner[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

const PaidTag = () => (
  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 8, color: '#aaa', letterSpacing: '0.15em' }}>
    विज्ञापन / PAID ADVERTISEMENT
  </div>
);

const PhotoCircle = ({ url, size = 90, border = '#8b6914' }: { url?: string | null; size?: number; border?: string }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${border}`, background: 'linear-gradient(135deg,#e8e4dc,#d4d0c8)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
    {url ? <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: size * 0.4, opacity: 0.3 }}>👤</span>}
  </div>
);

// ── 1. LARGE OBITUARY (हार्दिक समवेदना) ─────────────────────────

export function LargeObituaryCard({ notice }: { notice: Notice }) {
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: 380, background: '#fffef9', border: '1px solid #8b6914', boxShadow: 'inset 0 0 0 4px #fffef9, inset 0 0 0 6px #8b6914', position: 'relative', padding: 16 }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color="#8b6914" />)}

      <div style={{ textAlign: 'center', fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.02em', marginBottom: 12, borderBottom: '1px solid #8b6914', paddingBottom: 10 }}>
        {notice.title || 'हार्दिक समवेदना'}
        {notice.is_premium && <span style={{ fontSize: 9, marginLeft: 8, color: '#8b6914', letterSpacing: '0.1em' }}>★ PREMIUM</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <FlameIcon size={28} />
          <div style={{ fontSize: 10, color: '#555', marginTop: 4, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>जन्म:</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', fontFamily: 'monospace' }}>{notice.birth_date_bs || '—'}</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ width: 110, height: 110, borderRadius: '50%', border: '3px solid #8b6914', margin: '0 auto', background: 'linear-gradient(135deg,#d4d0c8,#a8a49c)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter: 'grayscale(0.3)' }}>
            {notice.photo_url ? <img src={notice.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.2)' }} alt="" /> : <span style={{ fontSize: 48, opacity: 0.3 }}>👤</span>}
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <FlameIcon size={28} />
          <div style={{ fontSize: 10, color: '#555', marginTop: 4, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>स्वर्गारोहण:</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', fontFamily: 'monospace' }}>{notice.death_date_bs || '—'}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.3 }}>स्व. {notice.deceased_name}</div>
        {notice.deceased_name_en && <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginTop: 2 }}>Late {notice.deceased_name_en}</div>}
      </div>

      <div style={{ height: 1, background: '#8b6914', opacity: 0.3, margin: '0 16px 12px' }} />
      <div style={{ fontSize: 12, lineHeight: 1.8, color: '#222', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 14, padding: '0 4px' }}>{notice.body_text}</div>

      {(notice.kriya_text || notice.funeral_location) && (
        <div style={{ background: '#f5f0e0', border: '1px solid #c8a84b', padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#333' }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>क्रिया तथा अन्तिम संस्कार:</div>
          {notice.funeral_location && <div>स्थान: {notice.funeral_location}{notice.funeral_datetime ? ` · ${notice.funeral_datetime}` : ''}</div>}
          {notice.kriya_text && <div>{notice.kriya_text}</div>}
        </div>
      )}

      <div style={{ borderTop: '1px solid #8b6914', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontSize: 22 }}>🏛️</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      </div>
      <PaidTag />
    </div>
  );
}

// ── 2. SMALL OBITUARY (हार्दिक श्रद्धाञ्जली) ────────────────────

export function SmallObituaryCard({ notice }: { notice: Notice }) {
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: 340, background: '#fffef9', border: '1px solid #8b6914', boxShadow: 'inset 0 0 0 3px #fffef9, inset 0 0 0 5px #8b6914', position: 'relative', padding: '14px 16px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color="#8b6914" />)}

      <div style={{ textAlign: 'center', fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 10, borderBottom: '1px solid #8b6914', paddingBottom: 8 }}>
        {notice.title || 'हार्दिक श्रद्धाञ्जली'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
        <div style={{ textAlign: 'center' }}>
          <FlameIcon size={22} />
          <div style={{ fontSize: 9, color: '#666', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>जन्म:</div>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{notice.birth_date_bs || '—'}</div>
        </div>
        <div style={{ width: 80, height: 95, border: '2px solid #8b6914', background: 'linear-gradient(135deg,#d4d0c8,#a8a49c)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter: 'grayscale(0.2)' }}>
          {notice.photo_url ? <img src={notice.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.2)' }} alt="" /> : <span style={{ fontSize: 36, opacity: 0.3 }}>👤</span>}
        </div>
        <div style={{ textAlign: 'center' }}>
          <FlameIcon size={22} />
          <div style={{ fontSize: 9, color: '#666', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>स्वर्गारोहण:</div>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{notice.death_date_bs || '—'}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
        स्व. {notice.deceased_name}
        {notice.deceased_title && <span style={{ fontSize: 12, fontWeight: 400 }}> ({notice.deceased_title})</span>}
      </div>
      <div style={{ height: 1, background: '#8b6914', opacity: 0.3, margin: '0 8px 10px' }} />
      <div style={{ fontSize: 11, lineHeight: 1.75, color: '#222', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 10 }}>{notice.body_text}</div>
      <div style={{ borderTop: '1px solid #8b6914', paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 11, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      <PaidTag />
    </div>
  );
}

// ── 3. WEDDING CARD (शुभ विवाह) ──────────────────────────────────
// Red/maroon palette · mandala motif · side-by-side circular photos

const WEDDING_RED = '#8b1a1a';
const WEDDING_GOLD = '#c8973a';

export function WeddingCard({ notice }: { notice: Notice }) {
  const w = notice.display_size === 'large' ? 420 : 360;
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: w, background: '#fff9f5', border: `1px solid ${WEDDING_RED}`, boxShadow: `inset 0 0 0 3px #fff9f5, inset 0 0 0 5px ${WEDDING_RED}`, position: 'relative', padding: '16px 18px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={WEDDING_RED} />)}

      {/* Top mangal strip */}
      <div style={{ background: `linear-gradient(90deg, ${WEDDING_RED}, #a52020, ${WEDDING_RED})`, color: '#fff', textAlign: 'center', padding: '5px 0', marginBottom: 12, fontSize: 13, letterSpacing: '0.3em', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
        ॥ शुभ विवाह ॥
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 700, color: WEDDING_RED, marginBottom: 14, letterSpacing: '0.02em' }}>
        {notice.title || 'विवाह शुभकामना'}
        {notice.is_premium && <span style={{ fontSize: 9, marginLeft: 6, color: WEDDING_GOLD }}>★ PREMIUM</span>}
      </div>

      {/* Side-by-side photos */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <PhotoCircle url={notice.person1_photo_url} size={80} border={WEDDING_RED} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginTop: 6 }}>{notice.person1_name || 'वर'}</div>
          <div style={{ fontSize: 9, color: WEDDING_RED, letterSpacing: '0.08em', fontWeight: 600 }}>वर</div>
        </div>

        {/* Mangal symbol center */}
        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <div style={{ fontSize: 28, color: WEDDING_RED, lineHeight: 1 }}>❦</div>
          <div style={{ fontSize: 10, color: WEDDING_GOLD, letterSpacing: '0.2em', marginTop: 2 }}>✦</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <PhotoCircle url={notice.person2_photo_url} size={80} border={WEDDING_RED} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginTop: 6 }}>{notice.person2_name || 'वधु'}</div>
          <div style={{ fontSize: 9, color: WEDDING_RED, letterSpacing: '0.08em', fontWeight: 600 }}>वधु</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px' }}>
        <div style={{ flex: 1, height: 1, background: WEDDING_RED, opacity: 0.25 }} />
        <div style={{ color: WEDDING_RED, fontSize: 12, opacity: 0.5 }}>✿ ✿ ✿</div>
        <div style={{ flex: 1, height: 1, background: WEDDING_RED, opacity: 0.25 }} />
      </div>

      {/* Date/venue strip */}
      {(notice.event_date_bs || notice.event_venue) && (
        <div style={{ background: `linear-gradient(135deg, ${WEDDING_RED}, #a52020)`, color: '#fff', textAlign: 'center', padding: '8px 14px', marginBottom: 12, fontFamily: "'Noto Sans Devanagari',sans-serif", borderRadius: 2 }}>
          {notice.event_date_bs && <div style={{ fontSize: 13, fontWeight: 700 }}>{notice.event_date_bs}</div>}
          {notice.event_date_ad && <div style={{ fontSize: 10, opacity: 0.85 }}>({notice.event_date_ad})</div>}
          {notice.event_time && <div style={{ fontSize: 11, marginTop: 2 }}>{notice.event_time}</div>}
          {notice.event_venue && <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>📍 {notice.event_venue}</div>}
        </div>
      )}

      {/* Body */}
      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.75, color: '#333', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12 }}>{notice.body_text}</div>
      )}

      {/* Blessings */}
      {notice.blessings_from && (
        <div style={{ background: '#fff3f0', border: `1px solid ${WEDDING_RED}20`, padding: '8px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: WEDDING_RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>आशीर्वाद दिनुहुनेछ</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: '#444', fontFamily: "'Noto Sans Devanagari',sans-serif", whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${WEDDING_RED}40`, paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      {notice.contact_phone && <div style={{ textAlign: 'center', fontSize: 10, color: WEDDING_RED, marginTop: 4, fontFamily: 'monospace' }}>📞 {notice.contact_phone}</div>}
      <PaidTag />
    </div>
  );
}

// ── 4. GRADUATION CARD (उत्तीर्णता शुभकामना) ────────────────────
// Deep navy/blue · graduation cap icon · academic feel

const GRAD_NAVY = '#1a3a5c';
const GRAD_GOLD = '#c8973a';

export function GraduationCard({ notice }: { notice: Notice }) {
  const w = notice.display_size === 'large' ? 400 : 340;
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: w, background: '#f5f8ff', border: `1px solid ${GRAD_NAVY}`, boxShadow: `inset 0 0 0 3px #f5f8ff, inset 0 0 0 5px ${GRAD_NAVY}`, position: 'relative', padding: '16px 18px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={GRAD_GOLD} />)}

      {/* Header banner */}
      <div style={{ background: GRAD_NAVY, color: '#fff', textAlign: 'center', padding: '10px 0', marginBottom: 14 }}>
        <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 4 }}>🎓</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.03em' }}>
          {notice.title || 'उत्तीर्णता शुभकामना'}
        </div>
        {notice.is_premium && <div style={{ fontSize: 9, color: GRAD_GOLD, marginTop: 2, letterSpacing: '0.1em' }}>★ PREMIUM</div>}
      </div>

      {/* Photo */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <PhotoCircle url={notice.person1_photo_url} size={85} border={GRAD_NAVY} />
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 800, color: GRAD_NAVY }}>{notice.person1_name}</div>
      </div>

      {/* Gold date strip */}
      {(notice.event_date_bs || notice.event_venue) && (
        <div style={{ background: GRAD_GOLD, color: '#fff', textAlign: 'center', padding: '7px 12px', marginBottom: 12, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
          {notice.event_date_bs && <div style={{ fontSize: 12, fontWeight: 700 }}>{notice.event_date_bs}</div>}
          {notice.event_venue && <div style={{ fontSize: 10, marginTop: 2 }}>{notice.event_venue}</div>}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px' }}>
        <div style={{ flex: 1, height: 1, background: GRAD_NAVY, opacity: 0.2 }} />
        <div style={{ color: GRAD_GOLD, fontSize: 10 }}>✦ ✦ ✦</div>
        <div style={{ flex: 1, height: 1, background: GRAD_NAVY, opacity: 0.2 }} />
      </div>

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.75, color: '#334', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12 }}>{notice.body_text}</div>
      )}

      {notice.blessings_from && (
        <div style={{ background: '#eef2ff', border: `1px solid ${GRAD_NAVY}20`, padding: '8px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: GRAD_NAVY, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>आशीर्वाद दिनुहुनेछ</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: '#334', fontFamily: "'Noto Sans Devanagari',sans-serif", whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${GRAD_NAVY}30`, paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: GRAD_NAVY, textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      <PaidTag />
    </div>
  );
}

// ── 5. BIRTH CARD (शिशु जन्म शुभकामना) ─────────────────────────
// Soft pink/mint · baby footprint · warm pastel

const BIRTH_PINK = '#c2185b';
const BIRTH_MINT = '#00897b';

export function BirthCard({ notice }: { notice: Notice }) {
  const w = notice.display_size === 'large' ? 400 : 340;
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: w, background: '#fff5f8', border: `1px solid ${BIRTH_PINK}50`, boxShadow: `inset 0 0 0 3px #fff5f8, inset 0 0 0 5px ${BIRTH_PINK}50`, position: 'relative', padding: '16px 18px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={BIRTH_PINK} />)}

      {/* Top strip */}
      <div style={{ background: `linear-gradient(90deg, ${BIRTH_PINK}, #e91e8c, ${BIRTH_PINK})`, color: '#fff', textAlign: 'center', padding: '8px 0', marginBottom: 14 }}>
        <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 2 }}>👶</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.03em' }}>
          {notice.title || 'शिशु जन्म शुभकामना'}
        </div>
      </div>

      {/* Photo */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <PhotoCircle url={notice.person1_photo_url} size={80} border={BIRTH_PINK} />
      </div>

      {/* Baby name */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 800, color: BIRTH_PINK }}>{notice.person1_name}</div>
        {notice.is_premium && <div style={{ fontSize: 9, color: BIRTH_MINT, marginTop: 2, letterSpacing: '0.1em' }}>★ PREMIUM</div>}
      </div>

      {/* Date strip */}
      {(notice.event_date_bs || notice.event_venue) && (
        <div style={{ background: `${BIRTH_PINK}15`, border: `1px solid ${BIRTH_PINK}30`, textAlign: 'center', padding: '7px 12px', marginBottom: 12, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
          {notice.event_date_bs && <div style={{ fontSize: 12, fontWeight: 700, color: BIRTH_PINK }}>📅 {notice.event_date_bs}</div>}
          {notice.event_date_ad && <div style={{ fontSize: 10, color: '#777', marginTop: 1 }}>({notice.event_date_ad})</div>}
          {notice.event_venue && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>📍 {notice.event_venue}</div>}
        </div>
      )}

      {/* Mint divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px' }}>
        <div style={{ flex: 1, height: 1, background: BIRTH_MINT, opacity: 0.3 }} />
        <div style={{ color: BIRTH_MINT, fontSize: 12 }}>✿ ✿ ✿</div>
        <div style={{ flex: 1, height: 1, background: BIRTH_MINT, opacity: 0.3 }} />
      </div>

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.75, color: '#333', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12 }}>{notice.body_text}</div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${BIRTH_MINT}10`, border: `1px solid ${BIRTH_MINT}30`, padding: '8px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: BIRTH_MINT, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>परिवारजन</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: '#333', fontFamily: "'Noto Sans Devanagari',sans-serif", whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${BIRTH_PINK}30`, paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      {notice.contact_phone && <div style={{ textAlign: 'center', fontSize: 10, color: BIRTH_PINK, marginTop: 4, fontFamily: 'monospace' }}>📞 {notice.contact_phone}</div>}
      <PaidTag />
    </div>
  );
}

// ── 6. BUSINESS CARD (शुभ उद्घाटन) ──────────────────────────────
// Dark green · professional · ribbon/ribbon motif

const BIZ_GREEN = '#1b5e20';
const BIZ_GOLD  = '#f9a825';

export function BusinessCard({ notice }: { notice: Notice }) {
  const w = notice.display_size === 'large' ? 420 : 360;
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: w, background: '#f1f8f1', border: `1px solid ${BIZ_GREEN}`, boxShadow: `inset 0 0 0 3px #f1f8f1, inset 0 0 0 5px ${BIZ_GREEN}`, position: 'relative', padding: '16px 18px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={BIZ_GOLD} />)}

      {/* Header */}
      <div style={{ background: BIZ_GREEN, color: '#fff', textAlign: 'center', padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 4 }}>🎊</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>
          {notice.title || 'शुभ उद्घाटन'}
        </div>
        {notice.is_premium && <div style={{ fontSize: 9, color: BIZ_GOLD, marginTop: 2, letterSpacing: '0.1em' }}>★ PREMIUM</div>}
      </div>

      {/* Business name / person */}
      {notice.person1_name && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {notice.person1_photo_url && <PhotoCircle url={notice.person1_photo_url} size={80} border={BIZ_GREEN} />}
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 17, fontWeight: 800, color: BIZ_GREEN, marginTop: notice.person1_photo_url ? 8 : 0 }}>{notice.person1_name}</div>
        </div>
      )}

      {/* Gold ribbon date/venue */}
      {(notice.event_date_bs || notice.event_venue) && (
        <div style={{ background: BIZ_GOLD, color: '#1a1a1a', textAlign: 'center', padding: '8px 14px', marginBottom: 12, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
          {notice.event_date_bs && <div style={{ fontSize: 13, fontWeight: 700 }}>📅 {notice.event_date_bs}</div>}
          {notice.event_date_ad && <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>({notice.event_date_ad})</div>}
          {notice.event_time && <div style={{ fontSize: 11, marginTop: 2 }}>🕐 {notice.event_time}</div>}
          {notice.event_venue && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>📍 {notice.event_venue}</div>}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px' }}>
        <div style={{ flex: 1, height: 1, background: BIZ_GREEN, opacity: 0.2 }} />
        <div style={{ color: BIZ_GOLD, fontSize: 10 }}>✦ ✦ ✦</div>
        <div style={{ flex: 1, height: 1, background: BIZ_GREEN, opacity: 0.2 }} />
      </div>

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.75, color: '#1a2a1a', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12 }}>{notice.body_text}</div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${BIZ_GREEN}10`, border: `1px solid ${BIZ_GREEN}20`, padding: '8px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: BIZ_GREEN, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>आमन्त्रण</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: '#1a2a1a', fontFamily: "'Noto Sans Devanagari',sans-serif", whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${BIZ_GREEN}30`, paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: BIZ_GREEN, textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      {notice.contact_phone && <div style={{ textAlign: 'center', fontSize: 10, color: BIZ_GREEN, marginTop: 4, fontFamily: 'monospace' }}>📞 {notice.contact_phone}</div>}
      <PaidTag />
    </div>
  );
}

// ── 7. BRATABANDHA CARD (व्रतबन्ध शुभकामना) ────────────────────
// Saffron/orange · sacred thread ceremony · traditional

const BRATA_SAFFRON = '#bf6000';
const BRATA_CREAM   = '#fff8ee';

export function BratabandhaCard({ notice }: { notice: Notice }) {
  const w = notice.display_size === 'large' ? 400 : 340;
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: w, background: BRATA_CREAM, border: `1px solid ${BRATA_SAFFRON}`, boxShadow: `inset 0 0 0 3px ${BRATA_CREAM}, inset 0 0 0 5px ${BRATA_SAFFRON}`, position: 'relative', padding: '16px 18px' }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={BRATA_SAFFRON} />)}

      {/* Saffron header */}
      <div style={{ background: `linear-gradient(90deg, ${BRATA_SAFFRON}, #d4700a, ${BRATA_SAFFRON})`, color: '#fff', textAlign: 'center', padding: '8px 0', marginBottom: 14 }}>
        <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>🪔</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 16, fontWeight: 700 }}>
          {notice.title || 'व्रतबन्ध शुभकामना'}
        </div>
        {notice.is_premium && <div style={{ fontSize: 9, color: '#ffe082', marginTop: 2 }}>★ PREMIUM</div>}
      </div>

      {/* Photo */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <PhotoCircle url={notice.person1_photo_url} size={80} border={BRATA_SAFFRON} />
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 17, fontWeight: 800, color: BRATA_SAFFRON }}>{notice.person1_name}</div>
      </div>

      {/* Date strip */}
      {(notice.event_date_bs || notice.event_venue) && (
        <div style={{ background: `${BRATA_SAFFRON}15`, border: `1px solid ${BRATA_SAFFRON}40`, textAlign: 'center', padding: '7px 12px', marginBottom: 12, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
          {notice.event_date_bs && <div style={{ fontSize: 12, fontWeight: 700, color: BRATA_SAFFRON }}>{notice.event_date_bs}</div>}
          {notice.event_time && <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{notice.event_time}</div>}
          {notice.event_venue && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>📍 {notice.event_venue}</div>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px' }}>
        <div style={{ flex: 1, height: 1, background: BRATA_SAFFRON, opacity: 0.2 }} />
        <div style={{ color: BRATA_SAFFRON, fontSize: 12 }}>ॐ</div>
        <div style={{ flex: 1, height: 1, background: BRATA_SAFFRON, opacity: 0.2 }} />
      </div>

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.75, color: '#2a1a00', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12 }}>{notice.body_text}</div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${BRATA_SAFFRON}10`, padding: '8px 12px', marginBottom: 10, border: `1px solid ${BRATA_SAFFRON}25` }}>
          <div style={{ fontSize: 9, color: BRATA_SAFFRON, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>आशीर्वाद दिनुहुनेछ</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: '#2a1a00', fontFamily: "'Noto Sans Devanagari',sans-serif", whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${BRATA_SAFFRON}30`, paddingTop: 8, fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, fontWeight: 700, color: BRATA_SAFFRON, textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{notice.published_by}</div>
      <PaidTag />
    </div>
  );
}

// ── Router: pick the right card ───────────────────────────────

const OBITUARY_TYPES: NoticeType[] = ['samvedana', 'shraddhanjali'];

export function NoticeCard({ notice }: { notice: Notice }) {
  const { notice_type, display_size } = notice;

  if (OBITUARY_TYPES.includes(notice_type)) {
    if (notice_type === 'samvedana' || display_size === 'large') return <LargeObituaryCard notice={notice} />;
    return <SmallObituaryCard notice={notice} />;
  }
  if (notice_type === 'bibaha')      return <WeddingCard notice={notice} />;
  if (notice_type === 'graduation')  return <GraduationCard notice={notice} />;
  if (notice_type === 'birth')       return <BirthCard notice={notice} />;
  if (notice_type === 'business')    return <BusinessCard notice={notice} />;
  if (notice_type === 'bratabandha') return <BratabandhaCard notice={notice} />;
  return <WeddingCard notice={notice} />; // fallback
}

export default NoticeCard;
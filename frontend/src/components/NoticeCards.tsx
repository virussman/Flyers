// ================================================================
// FILE: frontend/src/components/NoticeCards.tsx
// All card types — obituary (unchanged) + celebration cards
// redesigned to match obituary dimensions and layout language
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
  const isTop  = pos.startsWith('top');
  const isLeft = pos.endsWith('Left');
  return (
    <div style={{ position: 'absolute', ...(isTop ? { top: 6 } : { bottom: 6 }), ...(isLeft ? { left: 6 } : { right: 6 }), width: 24, height: 24 }}>
      <div style={{ width: 16, height: 16, borderTop: isTop ? `2px solid ${color}` : 'none', borderBottom: !isTop ? `2px solid ${color}` : 'none', borderLeft: isLeft ? `2px solid ${color}` : 'none', borderRight: !isLeft ? `2px solid ${color}` : 'none' }} />
    </div>
  );
};
const CORNERS: Corner[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

// Premium golden glow — only shown when is_premium is true
const PremiumGlow = ({ color = '#c8a84b' }: { color?: string }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
    boxShadow: `0 0 0 1px ${color}55, 0 4px 24px 0 ${color}44, 0 0 48px 0 ${color}22`,
    borderRadius: 'inherit',
  }} />
);

const PhotoCircle = ({ url, size = 90, border = '#8b6914' }: { url?: string | null; size?: number; border?: string }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${border}`, background: 'linear-gradient(135deg,#e8e4dc,#d4d0c8)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
    {url ? <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: size * 0.4, opacity: 0.3 }}>👤</span>}
  </div>
);

// ── 1. LARGE OBITUARY — समवेदना (UNCHANGED) ──────────────────────

export function LargeObituaryCard({ notice }: { notice: Notice }) {
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: 380, background: '#fffef9', border: '1px solid #8b6914', boxShadow: notice.is_premium ? 'inset 0 0 0 4px #fffef9, inset 0 0 0 6px #8b6914, 0 0 0 1px #c8a84b55, 0 4px 24px 0 #c8a84b44' : 'inset 0 0 0 4px #fffef9, inset 0 0 0 6px #8b6914', position: 'relative', padding: 16 }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color="#8b6914" />)}

      <div style={{ textAlign: 'center', fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.02em', marginBottom: 12, borderBottom: '1px solid #8b6914', paddingBottom: 10 }}>
        {notice.title || 'हार्दिक समवेदना'}
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
    </div>
  );
}

// ── 2. SMALL OBITUARY — श्रद्धाञ्जली (UNCHANGED) ─────────────────

export function SmallObituaryCard({ notice }: { notice: Notice }) {
  return (
    <div style={{ fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif", width: 340, background: '#fffef9', border: '1px solid #8b6914', boxShadow: notice.is_premium ? 'inset 0 0 0 3px #fffef9, inset 0 0 0 5px #8b6914, 0 0 0 1px #c8a84b55, 0 4px 24px 0 #c8a84b44' : 'inset 0 0 0 3px #fffef9, inset 0 0 0 5px #8b6914', position: 'relative', padding: '14px 16px' }}>
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
    </div>
  );
}

// ── Shared celebration card shell ─────────────────────────────
// Matches obituary: double-border inset, corner ornaments, same padding/widths

interface CelebShellProps {
  notice: Notice;
  accent: string;       // primary colour
  accentLight: string;  // bg tint
  accentMid: string;    // mid tone for borders/dividers
  children: React.ReactNode;
}
function CelebShell({ notice, accent, accentLight, accentMid, children }: CelebShellProps) {
  const isLarge = notice.display_size === 'large';
  const w = isLarge ? 380 : 340;
  const inset = isLarge ? 4 : 3;
  const premiumShadow = notice.is_premium
    ? `, 0 0 0 1px #c8a84b55, 0 4px 28px 0 #c8a84b44, 0 0 52px 0 #c8a84b18`
    : '';
  return (
    <div style={{
      fontFamily: "'Mukta','Noto Sans Devanagari',Arial,sans-serif",
      width: w,
      background: accentLight,
      border: `1px solid ${accent}`,
      boxShadow: `inset 0 0 0 ${inset}px ${accentLight}, inset 0 0 0 ${inset + 2}px ${accent}${premiumShadow}`,
      position: 'relative',
      padding: isLarge ? 16 : '14px 16px',
    }}>
      {CORNERS.map(pos => <CornerOrnament key={pos} pos={pos} color={accentMid} />)}
      {children}
    </div>
  );
}

// Shared celebration header strip — matches the obituary's title bar style
function CelebHeader({ title, icon, accent, accentMid }: { title: string; icon: string; accent: string; accentMid: string }) {
  return (
    <div style={{
      textAlign: 'center',
      fontFamily: "'Noto Sans Devanagari',sans-serif",
      fontSize: 19,
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '0.02em',
      marginBottom: 12,
      borderBottom: `1px solid ${accent}`,
      paddingBottom: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      {title}
    </div>
  );
}

// Shared date/venue info block — mirrors kriya box from obituary
function CelebDateBox({ notice, accent, accentLight }: { notice: Notice; accent: string; accentLight: string }) {
  if (!notice.event_date_bs && !notice.event_venue) return null;
  return (
    <div style={{
      background: accentLight,
      border: `1px solid ${accent}80`,
      padding: '8px 12px',
      marginBottom: 12,
      fontSize: 11,
      fontFamily: "'Noto Sans Devanagari',sans-serif",
      lineHeight: 1.7,
      color: '#333',
    }}>
      {notice.event_date_bs && (
        <div style={{ fontWeight: 700, marginBottom: 1 }}>
          📅 {notice.event_date_bs}{notice.event_date_ad ? ` (${notice.event_date_ad})` : ''}
        </div>
      )}
      {notice.event_time  && <div>🕐 {notice.event_time}</div>}
      {notice.event_venue && <div>📍 {notice.event_venue}</div>}
    </div>
  );
}

// Shared publisher footer — mirrors obituary's borderTop footer
function CelebFooter({ notice, accent }: { notice: Notice; accent: string }) {
  return (
    <div style={{ borderTop: `1px solid ${accent}60`, paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 11, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {notice.published_by}
      </div>
      {notice.contact_phone && (
        <div style={{ fontSize: 10, color: accent, fontFamily: 'monospace' }}>📞 {notice.contact_phone}</div>
      )}
    </div>
  );
}

// Shared divider
function Divider({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 12px' }}>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.25 }} />
      <div style={{ color, fontSize: 10, opacity: 0.6 }}>✦ ✦ ✦</div>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.25 }} />
    </div>
  );
}

// ── 3. WEDDING CARD — शुभ विवाह ──────────────────────────────────
// Deep crimson + antique gold · matches obituary gravitas

const W_RED  = '#7b1c1c';
const W_GOLD = '#b8892e';
const W_BG   = '#fff9f6';

export function WeddingCard({ notice }: { notice: Notice }) {
  return (
    <CelebShell notice={notice} accent={W_RED} accentLight={W_BG} accentMid={W_GOLD}>
      <CelebHeader title={notice.title || 'शुभ विवाह'} icon="❦" accent={W_RED} accentMid={W_GOLD} />

      {/* Side-by-side photos — same column symmetry as obituary flame+photo+flame */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <PhotoCircle url={notice.person1_photo_url} size={80} border={W_RED} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>
            {notice.person1_name || 'वर'}
          </div>
          <div style={{ fontSize: 9, color: W_RED, letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>वर</div>
        </div>

        {/* Centre symbol */}
        <div style={{ textAlign: 'center', flex: 1, paddingTop: 24 }}>
          <div style={{ fontSize: 26, color: W_RED, lineHeight: 1 }}>॥</div>
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 12, color: W_GOLD, marginTop: 4, fontWeight: 700, letterSpacing: '0.06em' }}>विवाह</div>
          <div style={{ fontSize: 11, color: W_GOLD, marginTop: 2, opacity: 0.7 }}>✦</div>
        </div>

        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <PhotoCircle url={notice.person2_photo_url} size={80} border={W_RED} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>
            {notice.person2_name || 'वधु'}
          </div>
          <div style={{ fontSize: 9, color: W_RED, letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>वधु</div>
        </div>
      </div>

      <div style={{ height: 1, background: W_RED, opacity: 0.2, margin: '0 16px 12px' }} />

      <CelebDateBox notice={notice} accent={W_RED} accentLight={`${W_RED}08`} />

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#222', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12, padding: '0 4px' }}>
          {notice.body_text}
        </div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${W_RED}07`, border: `1px solid ${W_GOLD}50`, padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#333' }}>
          <div style={{ fontWeight: 700, color: W_RED, marginBottom: 2, fontSize: 10 }}>आशीर्वाद दिनुहुनेछ:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <CelebFooter notice={notice} accent={W_RED} />
    </CelebShell>
  );
}

// ── 4. GRADUATION CARD — उत्तीर्णता ──────────────────────────────
// Deep navy + warm gold · academic gravitas matching obituary weight

const G_NAVY = '#1a3356';
const G_GOLD = '#b8892e';
const G_BG   = '#f5f7ff';

export function GraduationCard({ notice }: { notice: Notice }) {
  return (
    <CelebShell notice={notice} accent={G_NAVY} accentLight={G_BG} accentMid={G_GOLD}>
      <CelebHeader title={notice.title || 'उत्तीर्णता शुभकामना'} icon="🎓" accent={G_NAVY} accentMid={G_GOLD} />

      {/* Single photo — centred like obituary's centre photo column */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <PhotoCircle url={notice.person1_photo_url} size={100} border={G_NAVY} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginTop: 8, lineHeight: 1.2 }}>
            {notice.person1_name}
          </div>
          {notice.person2_name && (
            <div style={{ fontSize: 11, color: G_NAVY, marginTop: 2, fontStyle: 'italic' }}>{notice.person2_name}</div>
          )}
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ height: 1, background: G_NAVY, opacity: 0.2, margin: '0 16px 12px' }} />

      <CelebDateBox notice={notice} accent={G_NAVY} accentLight={`${G_NAVY}08`} />

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#222', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12, padding: '0 4px' }}>
          {notice.body_text}
        </div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${G_NAVY}07`, border: `1px solid ${G_GOLD}50`, padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#333' }}>
          <div style={{ fontWeight: 700, color: G_NAVY, marginBottom: 2, fontSize: 10 }}>आशीर्वाद दिनुहुनेछ:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <CelebFooter notice={notice} accent={G_NAVY} />
    </CelebShell>
  );
}

// ── 5. BIRTH CARD — शिशु जन्म ────────────────────────────────────
// Sage green + warm ivory · calm and tender, not childishly pink

const B_GREEN = '#2d5a3d';
const B_SAGE  = '#7a9e7e';
const B_BG    = '#f5faf6';

export function BirthCard({ notice }: { notice: Notice }) {
  return (
    <CelebShell notice={notice} accent={B_GREEN} accentLight={B_BG} accentMid={B_SAGE}>
      <CelebHeader title={notice.title || 'शिशु जन्म शुभकामना'} icon="👶" accent={B_GREEN} accentMid={B_SAGE} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <PhotoCircle url={notice.person1_photo_url} size={100} border={B_GREEN} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginTop: 8, lineHeight: 1.2 }}>
            {notice.person1_name}
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ height: 1, background: B_GREEN, opacity: 0.2, margin: '0 16px 12px' }} />

      <CelebDateBox notice={notice} accent={B_GREEN} accentLight={`${B_GREEN}08`} />

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#222', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12, padding: '0 4px' }}>
          {notice.body_text}
        </div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${B_GREEN}07`, border: `1px solid ${B_SAGE}60`, padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#333' }}>
          <div style={{ fontWeight: 700, color: B_GREEN, marginBottom: 2, fontSize: 10 }}>परिवारजन:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <CelebFooter notice={notice} accent={B_GREEN} />
    </CelebShell>
  );
}

// ── 6. BUSINESS CARD — शुभ उद्घाटन ──────────────────────────────
// Deep forest green + brass gold · formal and commercial

const BZ_GREEN = '#1c3d1c';
const BZ_BRASS = '#a07830';
const BZ_BG    = '#f4f8f4';

export function BusinessCard({ notice }: { notice: Notice }) {
  return (
    <CelebShell notice={notice} accent={BZ_GREEN} accentLight={BZ_BG} accentMid={BZ_BRASS}>
      <CelebHeader title={notice.title || 'शुभ उद्घाटन'} icon="🎊" accent={BZ_GREEN} accentMid={BZ_BRASS} />

      {notice.person1_name && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'center' }}>
            {notice.person1_photo_url && <PhotoCircle url={notice.person1_photo_url} size={90} border={BZ_GREEN} />}
            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 17, fontWeight: 800, color: '#1a1a1a', marginTop: notice.person1_photo_url ? 8 : 0, lineHeight: 1.2 }}>
              {notice.person1_name}
            </div>
            {notice.person2_name && (
              <div style={{ fontSize: 11, color: BZ_BRASS, marginTop: 2, fontStyle: 'italic' }}>{notice.person2_name}</div>
            )}
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}

      <div style={{ height: 1, background: BZ_GREEN, opacity: 0.2, margin: '0 16px 12px' }} />

      <CelebDateBox notice={notice} accent={BZ_GREEN} accentLight={`${BZ_GREEN}08`} />

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#1a2a1a', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12, padding: '0 4px' }}>
          {notice.body_text}
        </div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${BZ_GREEN}07`, border: `1px solid ${BZ_BRASS}50`, padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#333' }}>
          <div style={{ fontWeight: 700, color: BZ_GREEN, marginBottom: 2, fontSize: 10 }}>आमन्त्रण:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <CelebFooter notice={notice} accent={BZ_GREEN} />
    </CelebShell>
  );
}

// ── 7. BRATABANDHA CARD — व्रतबन्ध ──────────────────────────────
// Deep saffron-ochre + warm cream · sacred and traditional

const BR_OCHRE  = '#9c5a00';
const BR_WARM   = '#c8832a';
const BR_BG     = '#fffaf2';

export function BratabandhaCard({ notice }: { notice: Notice }) {
  return (
    <CelebShell notice={notice} accent={BR_OCHRE} accentLight={BR_BG} accentMid={BR_WARM}>
      <CelebHeader title={notice.title || 'व्रतबन्ध शुभकामना'} icon="🪔" accent={BR_OCHRE} accentMid={BR_WARM} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, padding: '0 8px' }}>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <PhotoCircle url={notice.person1_photo_url} size={100} border={BR_OCHRE} />
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginTop: 8, lineHeight: 1.2 }}>
            {notice.person1_name}
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Sacred divider with ॐ — matches obituary's gold rule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 16px 12px' }}>
        <div style={{ flex: 1, height: 1, background: BR_OCHRE, opacity: 0.25 }} />
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 14, color: BR_OCHRE, opacity: 0.7 }}>ॐ</div>
        <div style={{ flex: 1, height: 1, background: BR_OCHRE, opacity: 0.25 }} />
      </div>

      <CelebDateBox notice={notice} accent={BR_OCHRE} accentLight={`${BR_OCHRE}08`} />

      {notice.body_text && (
        <div style={{ fontSize: 11, lineHeight: 1.8, color: '#2a1800', textAlign: 'justify', fontFamily: "'Noto Sans Devanagari',sans-serif", marginBottom: 12, padding: '0 4px' }}>
          {notice.body_text}
        </div>
      )}

      {notice.blessings_from && (
        <div style={{ background: `${BR_OCHRE}07`, border: `1px solid ${BR_WARM}50`, padding: '8px 12px', marginBottom: 12, fontSize: 11, fontFamily: "'Noto Sans Devanagari',sans-serif", lineHeight: 1.7, color: '#2a1800' }}>
          <div style={{ fontWeight: 700, color: BR_OCHRE, marginBottom: 2, fontSize: 10 }}>आशीर्वाद दिनुहुनेछ:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{notice.blessings_from}</div>
        </div>
      )}

      <CelebFooter notice={notice} accent={BR_OCHRE} />
    </CelebShell>
  );
}

// ── Router ────────────────────────────────────────────────────

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
  return <WeddingCard notice={notice} />;
}

export default NoticeCard;
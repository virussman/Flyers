// FILE: src/components/LostFoundModal.tsx

import { useEffect } from 'react';
import LostFoundForm from '@/components/LostFoundForm';
import { TOKEN, FONT } from '@/lib/constants';

export default function LostFoundModal({
  open,
  onClose,
  onSuccess,
}: {
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop — same tone as homepage overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,14,11,.6)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Panel — matches column width + editorial feel */}
      <div style={{
        position: 'relative',
        background: TOKEN.bg2,           // same bg as LostFoundCol
        width: '100%', maxWidth: 420,    // roughly one grid column
        maxHeight: '90vh',
        overflowY: 'auto',
        margin: '0 16px',
        border: `1px solid ${TOKEN.border}`,
        boxShadow: '0 24px 72px rgba(15,14,11,.28)',
        animation: 'lf-in 0.2s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <style>{`
          @keyframes lf-in {
            from { opacity:0; transform:translateY(10px); }
            to   { opacity:1; transform:none; }
          }
        `}</style>

        {/* Top accent — same 3px ink bar as the main layout */}
        <div style={{ height: 3, background: TOKEN.ink, flexShrink: 0 }} />

        {/* Header — styled like ColHeader */}
        <div style={{
          padding: '16px 20px 14px',
          borderBottom: `1px solid ${TOKEN.border}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: TOKEN.bg2,
          position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div>
            {/* Eyebrow — same as ColHeader eyebrow */}
            <div style={{
              fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: TOKEN.gold2,
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
            }}>
              <span style={{ width: 14, height: 1, background: TOKEN.gold2, display: 'inline-block', opacity: 0.6 }} />
              Community · गुमेका वस्तुहरू
            </div>
            {/* Title — same weight/family as ColHeader */}
            <div style={{
              fontFamily: FONT.serif, fontWeight: 700,
              fontSize: 20, color: TOKEN.ink, lineHeight: 1.1,
            }}>
              Report Lost or Found
            </div>
            <div style={{
              fontFamily: FONT.sans, fontSize: 11, color: TOKEN.ink4,
              marginTop: 4, lineHeight: 1.5,
            }}>
              Help reunite items with their owners across Nepal.
            </div>
          </div>

          {/* Close — same ghost btn style */}
          <button
            onClick={onClose}
            style={{
              background: TOKEN.white,
              border: `1px solid ${TOKEN.border}`,
              padding: '5px 9px',
              cursor: 'pointer',
              color: TOKEN.ink5,
              fontFamily: FONT.mono,
              fontSize: 12,
              lineHeight: 1,
              flexShrink: 0,
              marginLeft: 12,
              marginTop: 2,
            }}
          >✕</button>
        </div>

        {/* Form — same horizontal padding as card content */}
        <div style={{ padding: '4px 20px 24px', background: TOKEN.white }}>
          <LostFoundForm
            onClose={onClose}
            onSuccess={() => { onSuccess(); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}
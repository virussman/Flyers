import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import MyAdsDashboard from '@/pages/MyAdsDashboard';
import NoticeForm from '@/components/NoticeForm';
import AdForm from '@/components/AdForm';
import { IcUser, IcPen } from '@/components/Icons';
import { TOKEN, FONT, CATEGORIES, API, adToBs } from '@/lib/constants';
import type { TickerItem } from '@/types';

interface SiteLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function SiteLayout({ children, onRefresh }: SiteLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  const [sheetOpen,       setSheetOpen]       = useState(false);
  const [noticeSheetOpen, setNoticeSheetOpen] = useState(false);
  const [loginOpen,       setLoginOpen]       = useState(false);
  const [dashboardOpen,   setDashboardOpen]   = useState(false);
  const [tickerItems,     setTickerItems]     = useState<TickerItem[]>([]);

  const activeCategory = (() => {
    const path = location.pathname.replace('/', '');
    return path === '' ? 'all' : path;
  })();

  useEffect(() => {
    fetch(`${API}/ads/ticker`)
      .then(r => r.json())
      .then((d: { items: TickerItem[] }) => setTickerItems(d.items ?? []))
      .catch(() => setTickerItems([]));
  }, []);

  
  // CRITICAL: Close modal immediately when user logs in
  useEffect(() => {
    if (isLoggedIn && loginOpen) {
      console.log('User logged in, closing modal');
      setLoginOpen(false);
    }
  }, [isLoggedIn, loginOpen]);

  const handlePostAdClick = () => {
    if (!isLoggedIn) { setLoginOpen(true); return; }
    setSheetOpen(true);
  };

  const handleAdPosted = () => {
    setSheetOpen(false);
    onRefresh?.();
  };

  const today  = new Date();
  const bsDate = adToBs(today);
  const enDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', background: TOKEN.bg, fontFamily: FONT.sans, WebkitFontSmoothing: 'antialiased' }}>

      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: TOKEN.white }}>

        {/* Dateline bar */}
        <div style={{ background: TOKEN.dark, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '0 52px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', color: '#C8B898' }}>{enDate}</span>
            <span style={{ fontFamily: FONT.deva, fontSize: 10, color: '#B8A882' }}>{bsDate.formatted}</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)' }}>
            {tickerItems.length > 0 && (
              <div style={{ display: 'inline-flex', gap: 48, whiteSpace: 'nowrap', animation: 'flyers-ticker 30s linear infinite' }}>
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} style={{ fontFamily: FONT.mono, fontSize: 10, color: '#9A8E76', letterSpacing: '0.05em' }}>
                    <b style={{ color: TOKEN.gold3, fontWeight: 500 }}>{item.cat}</b>{' '}{item.title}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A7E68', flexShrink: 0 }}>Nepal's Digital Classifieds</span>
        </div>

        {/* Masthead */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '22px 52px 18px', borderBottom: `2.5px solid ${TOKEN.ink}`, background: TOKEN.white }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 58, letterSpacing: '-0.04em', color: TOKEN.ink, lineHeight: 0.88 }}>
              Flyers<span style={{ color: TOKEN.gold2, fontWeight: 700 }}>.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8 }}>
              <div style={{ width: 48, height: 1, background: TOKEN.gold2, opacity: 0.45 }} />
              <span style={{ fontFamily: FONT.deva, fontSize: 11, color: TOKEN.ink5 }}>खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा</span>
            </div>
          </div>

                    {/* AUTH HEADER - KEY PROP FORCES RE-RENDER */}
          <div
            key={isLoggedIn ? `user-${user?.id}-${Date.now()}` : 'guest'}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          >
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setDashboardOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT.mono, fontSize: 11, padding: '8px 15px', border: `1px solid ${TOKEN.border2}`, background: 'transparent', color: TOKEN.ink3, cursor: 'pointer' }}
                >
                  <IcUser />
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name ?? user?.email ?? 'My Account'}
                  </span>
                </button>
                <button
                  onClick={() => { logout(); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT.mono, fontSize: 11, padding: '8px 12px', border: `1px solid ${TOKEN.border2}`, background: 'transparent', color: TOKEN.ink5, cursor: 'pointer' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONT.mono, fontSize: 11, padding: '8px 15px', border: `1px solid ${TOKEN.border2}`, background: 'transparent', color: TOKEN.ink3, cursor: 'pointer' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                Sign In
              </button>
            )}

            <button
              onClick={() => setNoticeSheetOpen(true)}
              style={{ fontFamily: FONT.deva, fontWeight: 500, fontSize: 12, padding: '8px 16px', border: `1px solid ${TOKEN.border2}`, background: 'transparent', color: TOKEN.ink, cursor: 'pointer' }}
            >
              📋 सूचना दिनुहोस्
            </button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  onClick={handlePostAdClick}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT.sans, fontWeight: 600, fontSize: 12, letterSpacing: '0.05em', background: TOKEN.ink, color: TOKEN.white, border: 'none', padding: '10px 24px', cursor: 'pointer' }}
                >
                  <IcPen /> Post Ad
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white border-stone-200">
                <SheetHeader className="mb-6">
                  <div className="h-0.5 bg-stone-900 mb-4 -mx-6" />
                  <SheetTitle className="font-serif text-xl font-bold text-stone-900">New Advertisement</SheetTitle>
                  <SheetDescription className="text-xs text-stone-500">Rs. 20 per word · Minimum Rs. 200 · Published after review</SheetDescription>
                </SheetHeader>
                <AdForm onSuccess={handleAdPosted} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category nav */}
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: `1px solid ${TOKEN.border}`, padding: '0 52px', background: TOKEN.white }}>
          {CATEGORIES.map(cat => {
            const active       = activeCategory === cat.value;
            const isNoticesCat = cat.value === 'notices';
            return (
              <button
                key={cat.value}
                onClick={() => navigate(cat.path)}
                style={{ fontFamily: isNoticesCat ? FONT.deva : FONT.sans, fontWeight: 600, letterSpacing: isNoticesCat ? '0.05em' : '0.08em', textTransform: isNoticesCat ? 'none' : 'uppercase', fontSize: isNoticesCat ? 13 : 10, padding: '10px 16px', border: 'none', borderBottom: `2px solid ${active ? TOKEN.ink : 'transparent'}`, color: active ? TOKEN.ink : TOKEN.ink5, background: 'none', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
              >
                {isNoticesCat && (
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: TOKEN.gold3, marginRight: 5, verticalAlign: 'middle', animation: 'flyers-pulse 2.2s ease infinite' }} />
                )}
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer style={{ background: TOKEN.dark }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${TOKEN.gold},${TOKEN.gold3} 45%,${TOKEN.gold2})` }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 52, padding: '48px 52px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div>
            <div onClick={() => navigate('/')} style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 46, color: TOKEN.white, lineHeight: 0.88, letterSpacing: '-0.04em', marginBottom: 14, cursor: 'pointer' }}>
              Flyers<span style={{ color: TOKEN.gold2, fontStyle: 'italic', fontWeight: 700 }}>.</span>
            </div>
            <div style={{ fontFamily: FONT.deva, fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.6, marginBottom: 18 }}>
              खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा<br />नेपाल · नेपाली · तपाईंको
            </div>
          </div>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Categories</div>
            {['Real Estate', 'Employment', 'Services', 'Matrimonial', 'Automobiles'].map(l => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer', marginBottom: 9 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Advertise</div>
            {['Post an Ad', 'Premium Listings', 'Post a Notice', 'Pricing'].map(l => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer', marginBottom: 9 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Company</div>
            {['About Flyers', 'Terms & Conditions', 'Privacy Policy', 'Contact Us'].map(l => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer', marginBottom: 9 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
              </div>
            ))}
            {isLoggedIn && (
              <div onClick={() => setDashboardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> My Ads Dashboard
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '16px 52px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.18)', lineHeight: 1.6 }}>© {new Date().getFullYear()} Flyers. All advertisements independently placed.</div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes flyers-ticker  { to { transform: translateX(-50%); } }
        @keyframes flyers-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.55)} }
        @keyframes flyers-feed-in { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes flyers-skeleton{ 0%,100%{opacity:.5} 50%{opacity:.2} }
        @keyframes flyers-slide-up{ from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        *::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {}}
      />
      {dashboardOpen && <MyAdsDashboard onClose={() => setDashboardOpen(false)} />}
      {noticeSheetOpen && (
        <NoticeForm
          onClose={() => setNoticeSheetOpen(false)}
          onSuccess={() => { setNoticeSheetOpen(false); navigate('/notices'); }}
        />
      )}
    </div>
  );
}

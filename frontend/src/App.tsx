import { useState } from 'react';
import AdForm from '@/components/AdForm';
import AdList from '@/components/AdList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { PenLine, Newspaper, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import MyAdsDashboard from '@/pages/MyAdsDashboard';

const CATEGORIES = [
  { value: 'all',          label: 'All Sections' },
  { value: 'real-estate',  label: 'Real Estate'  },
  { value: 'jobs',         label: 'Employment'   },
  { value: 'services',     label: 'Services'     },
  { value: 'matrimonial',  label: 'Matrimonial'  },
  { value: 'automobiles',  label: 'Automobiles'  },
];

const SECTION_LABEL: Record<string, string> = {
  all:          'Latest Listings',
  'real-estate':'Real Estate',
  jobs:         'Employment',
  services:     'Services',
  matrimonial:  'Matrimonial',
  automobiles:  'Automobiles',
};

export default function App() {
  const { user, isLoggedIn } = useAuth();
  const [refreshKey,     setRefreshKey]     = useState(0);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loginOpen,      setLoginOpen]      = useState(false);
  const [dashboardOpen,  setDashboardOpen]  = useState(false);

  const handleAdPosted = () => {
    setSheetOpen(false);
    setTimeout(() => setRefreshKey(k => k + 1), 400);
  };

  // If not logged in, show login modal instead of post form
  const handlePostAdClick = () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
    } else {
      setSheetOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-stone-900">

      {/* ── Masthead ─────────────────────────────────── */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="h-[3px] bg-stone-900" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Date bar */}
          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-[11px] text-stone-400 font-mono tracking-wider">
            <span>
              {new Date().toLocaleDateString('en-NP', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <span className="hidden sm:block uppercase tracking-widest">
              Nepal's Digital Classifieds
            </span>
          </div>

          {/* Masthead row */}
          <div className="flex items-center justify-between py-4 gap-3">
            {/* Brand */}
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-stone-900 leading-none">
                Flyers<span className="text-stone-300 font-light">.</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-6 h-px bg-stone-300" />
                <p className="text-[11px] text-stone-400 font-mono tracking-[0.15em] uppercase">
                  खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा
                </p>
              </div>
            </div>

            {/* Right: user + post ad */}
            <div className="flex items-center gap-2 shrink-0">

              {/* User button */}
              {isLoggedIn ? (
                <button
                  onClick={() => setDashboardOpen(true)}
                  className="flex items-center gap-2 text-xs border border-stone-200 px-3 py-2 hover:bg-stone-50 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-stone-500" />
                  <span className="hidden sm:inline text-stone-600 font-medium max-w-[100px] truncate">
                    {user?.name || user?.phone}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-xs border border-stone-200 px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-medium"
                >
                  Sign in
                </button>
              )}

              {/* Post Ad */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    onClick={handlePostAdClick}
                    className="bg-stone-900 hover:bg-stone-700 text-white h-9 px-4 text-sm font-semibold tracking-wide gap-2"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Post Ad</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white border-stone-200">
                  <SheetHeader className="mb-6">
                    <div className="h-0.5 bg-stone-900 mb-4 -mx-6" />
                    <SheetTitle className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Newspaper className="h-4 w-4" />
                      New Advertisement
                    </SheetTitle>
                    <SheetDescription className="text-xs text-stone-500">
                      Rs. 20 per word · Minimum Rs. 200 · Published after review
                    </SheetDescription>
                  </SheetHeader>
                  <AdForm onSuccess={handleAdPosted} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Category nav */}
          <nav className="flex overflow-x-auto pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`shrink-0 text-[12px] font-semibold tracking-wider uppercase px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                  activeCategory === cat.value
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">

          {/* Primary column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  {SECTION_LABEL[activeCategory]}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {activeCategory === 'all'
                    ? 'Verified advertisements from across Nepal'
                    : `Verified ${SECTION_LABEL[activeCategory].toLowerCase()} listings`}
                </p>
              </div>
              <div className="h-px flex-1 bg-stone-200" />
              {activeCategory !== 'all' && (
                <button
                  onClick={() => setActiveCategory('all')}
                  className="text-[11px] text-stone-400 hover:text-stone-700 font-mono uppercase tracking-wider transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <AdList
              key={`${activeCategory}-${refreshKey}`}
              refresh={refreshKey}
              initialCategory={activeCategory}
            />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-5">
            <div className="bg-stone-900 text-white p-5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">
                Advertise Here
              </div>
              <p className="font-serif text-sm leading-relaxed text-stone-200 mb-4">
                Reach thousands of Nepalis. Post your classified starting from Rs. 200.
              </p>
              <div className="space-y-1 text-xs text-stone-400 font-mono mb-4">
                <div className="flex justify-between"><span>Per word</span><span>Rs. 20</span></div>
                <div className="flex justify-between"><span>Minimum</span><span>Rs. 200</span></div>
                <div className="flex justify-between text-amber-400"><span>Premium 2×</span><span>Rs. 400+</span></div>
              </div>
              <Button
                variant="outline"
                onClick={handlePostAdClick}
                className="w-full border-white text-white bg-transparent hover:bg-white hover:text-stone-900 text-xs h-8 tracking-wider font-semibold"
              >
                Post an Ad <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <div className="border border-stone-200 p-5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">
                Browse by Section
              </div>
              <div className="space-y-1">
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`w-full text-left text-xs px-2 py-1.5 flex items-center justify-between transition-colors rounded-sm ${
                      activeCategory === cat.value
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    {cat.label}
                    <ChevronRight className="h-3 w-3 opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            {/* My Ads shortcut (when logged in) */}
            {isLoggedIn && (
              <button
                onClick={() => setDashboardOpen(true)}
                className="border border-stone-200 p-4 text-left hover:bg-stone-50 transition-colors"
              >
                <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">My Ads</div>
                <p className="text-xs text-stone-600">View and manage your posted advertisements</p>
              </button>
            )}

            <div className="border border-stone-200 p-5">
              <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">
                How It Works
              </div>
              <div className="space-y-3">
                {[
                  { step: '01', text: 'Sign in with your mobile number' },
                  { step: '02', text: 'Write your ad & choose category' },
                  { step: '03', text: 'Pay Rs. 20 per word' },
                  { step: '04', text: 'Published after review' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="font-mono text-[10px] font-bold text-stone-400 shrink-0 mt-0.5">{item.step}</span>
                    <span className="text-xs text-stone-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-stone-400 leading-relaxed">
              All advertisements subject to Nepal Advertisement (Regulation) Act 2076.
            </p>
          </aside>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="mt-16 border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-stone-900">Flyers<span className="text-stone-300">.</span></p>
              <p className="text-xs text-stone-400 mt-0.5">Nepal's trusted digital classifieds — est. 2026</p>
            </div>
            <div className="text-[11px] text-stone-400 text-right space-y-0.5">
              <p>Compliant with Advertisement (Regulation) Act 2076</p>
              <p>Registered with Department of Information</p>
            </div>
          </div>
          <Separator className="my-4 bg-stone-100" />
          <p className="text-[11px] text-stone-400 text-center">
            © {new Date().getFullYear()} Flyers. All advertisements are independently placed.
          </p>
        </div>
      </footer>

      {/* ── Modals ───────────────────────────────────── */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          setSheetOpen(true); // open post form after login
        }}
      />

      {dashboardOpen && (
        <MyAdsDashboard onClose={() => setDashboardOpen(false)} />
      )}
    </div>
  );
}
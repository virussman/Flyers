// // ================================================================
// // FILE: frontend/src/App.tsx
// // ================================================================

// import { useState, useEffect, useCallback } from 'react';
// import AdForm from '@/components/AdForm';
// import AdList from '@/components/AdList';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import {
//   Sheet, SheetContent, SheetDescription,
//   SheetHeader, SheetTitle, SheetTrigger,
// } from '@/components/ui/sheet';
// import { PenLine, Newspaper, ChevronRight, User } from 'lucide-react';
// import { useAuth } from '@/context/AuthContext';
// import LoginModal from '@/components/LoginModal';
// import MyAdsDashboard from '@/pages/MyAdsDashboard';
// import { NoticeCard } from '@/components/NoticeCards';
// import NoticeForm from '@/components/NoticeForm';
// import type { Notice, NoticeType } from '@/types/index';

// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// const CATEGORIES = [
//   { value: 'all',          label: 'All Sections' },
//   { value: 'real-estate',  label: 'Real Estate'  },
//   { value: 'jobs',         label: 'Employment'   },
//   { value: 'services',     label: 'Services'     },
//   { value: 'matrimonial',  label: 'Matrimonial'  },
//   { value: 'automobiles',  label: 'Automobiles'  },
//   { value: 'notices',      label: 'सूचना'        },
// ];

// const SECTION_LABEL: Record<string, string> = {
//   all:          'Latest Listings',
//   'real-estate':'Real Estate',
//   jobs:         'Employment',
//   services:     'Services',
//   matrimonial:  'Matrimonial',
//   automobiles:  'Automobiles',
//   notices:      'सूचनाहरू',
// };

// // ── Notice sub-tabs ───────────────────────────────────────────
// const NOTICE_TABS: { key: NoticeType | ''; label: string; sub: string }[] = [
//   { key: '',              label: 'सबै',           sub: 'All'        },
//   { key: 'samvedana',     label: 'समवेदना',       sub: 'Condolence' },
//   { key: 'shraddhanjali', label: 'श्रद्धाञ्जली', sub: 'Tribute'    },
//   { key: 'bibaha',        label: 'विवाह',         sub: 'Wedding'    },
//   { key: 'graduation',    label: 'उत्तीर्ण',      sub: 'Graduation' },
//   { key: 'birth',         label: 'जन्म',          sub: 'Birth'      },
//   { key: 'business',      label: 'व्यापार',       sub: 'Business'   },
// ];

// // ── Notices section (inline, no separate page/route) ─────────
// function NoticesSection() {
//   const [notices, setNotices]     = useState<Notice[]>([]);
//   const [total, setTotal]         = useState(0);
//   const [noticeTab, setNoticeTab] = useState<NoticeType | ''>('');
//   const [loading, setLoading]     = useState(true);
//   const [showForm, setShowForm]   = useState(false);

//   const fetchNotices = useCallback(async (type: NoticeType | '' = noticeTab) => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({ limit: '40' });
//       if (type) params.set('type', type);
//       const res  = await fetch(`${API}/notices?${params}`);
//       const data = await res.json();
//       setNotices(data.notices ?? []);
//       setTotal(data.total ?? 0);
//     } finally {
//       setLoading(false);
//     }
//   }, [noticeTab]);

//   useEffect(() => { fetchNotices(noticeTab); }, [noticeTab]);

//   return (
//     <>
      

//       {/* Notice sub-tabs */}
//       <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-stone-200 mb-6">
//         {NOTICE_TABS.map(t => (
//           <button
//             key={t.key}
//             onClick={() => setNoticeTab(t.key)}
//             className={`shrink-0 px-4 py-2.5 border-b-2 transition-all text-center ${
//               noticeTab === t.key
//                 ? 'border-stone-900 text-stone-900'
//                 : 'border-transparent text-stone-400 hover:text-stone-700'
//             }`}
//           >
//             <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 13, fontWeight: 600 }}>
//               {t.label}
//             </div>
//             <div className="text-[9px] text-stone-400 tracking-wider">{t.sub}</div>
//           </button>
//         ))}
//       </div>

//       {/* Section header */}
//       <div className="flex items-center gap-4 mb-6">
//         <div>
//           <h2 className="font-serif text-lg font-bold text-stone-900" style={{ fontFamily: "'Noto Sans Devanagari',serif" }}>
//             सूचनाहरू
//           </h2>
//           <p className="text-xs text-stone-400 mt-0.5">Notices · Death & Celebration</p>
//         </div>
//         <div className="h-px flex-1 bg-stone-200" />
//         <button
//           onClick={() => setShowForm(true)}
//           className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
//         >
//           + सूचना दिनुहोस्
//         </button>
//       </div>

//       {/* Cards */}
//       {loading ? (
//         <div className="flex items-center justify-center py-20 text-xs text-stone-400 font-mono tracking-widest uppercase">
//           सूचनाहरू लोड हुँदैछ...
//         </div>
//       ) : notices.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 gap-3">
//           <div className="text-5xl">📋</div>
//           <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }} className="text-stone-500">
//             कुनै सूचना छैन
//           </p>
//           <p className="text-xs text-stone-400">No notices in this category yet</p>
//           <button
//             onClick={() => setShowForm(true)}
//             className="mt-2 px-6 py-2 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-colors"
//           >
//             पहिलो सूचना दिनुहोस्
//           </button>
//         </div>
//       ) : (
//         <>
//           <p className="text-xs text-stone-400 font-mono mb-5">{total} सूचना{total !== 1 ? 'हरू' : ''}</p>
//           <div className="flex flex-wrap gap-6">
//             {notices.map(n => (
//               <div key={n.id}>
//                 <NoticeCard notice={n} />
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {showForm && (
//         <NoticeForm
//           onClose={() => setShowForm(false)}
//           onSuccess={() => { setShowForm(false); fetchNotices(noticeTab); }}
//         />
//       )}
//     </>
//   );
// }

// // ── Main App ──────────────────────────────────────────────────
// export default function App() {
//   const { user, isLoggedIn } = useAuth();
//   const [refreshKey,      setRefreshKey]      = useState(0);
//   const [sheetOpen,       setSheetOpen]       = useState(false);
//   const [noticeSheetOpen, setNoticeSheetOpen] = useState(false);
//   const [activeCategory,  setActiveCategory]  = useState('all');
//   const [loginOpen,       setLoginOpen]       = useState(false);
//   const [dashboardOpen,   setDashboardOpen]   = useState(false);

//   const isNotices = activeCategory === 'notices';

//   const handleAdPosted = () => {
//     setSheetOpen(false);
//     setTimeout(() => setRefreshKey(k => k + 1), 400);
//   };

//   const handlePostAdClick = () => {
//     if (!isLoggedIn) setLoginOpen(true);
//     else setSheetOpen(true);
//   };

//   const handlePostNoticeClick = () => {
//     setNoticeSheetOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-[#F9F7F2] text-stone-900">

//       {/* ── Masthead ─────────────────────────────────── */}
//       <header className="border-b border-stone-200 bg-white sticky top-0 z-20 shadow-sm">
//         <div className="h-[3px] bg-stone-900" />
//         <div className="max-w-6xl mx-auto px-4 sm:px-6">

//           {/* Date bar */}
//           <div className="flex items-center justify-between py-2 border-b border-stone-100 text-[11px] text-stone-400 font-mono tracking-wider">
//             <span>
//               {new Date().toLocaleDateString('en-NP', {
//                 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//               })}
//             </span>
//             <span className="hidden sm:block uppercase tracking-widest">
//               Nepal's Digital Classifieds
//             </span>
//           </div>

//           {/* Masthead row */}
//           <div className="flex items-center justify-between py-4 gap-3">
//             {/* Brand */}
//             <div>
//               <h1 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-stone-900 leading-none">
//                 Flyers<span className="text-stone-300 font-light">.</span>
//               </h1>
//               <div className="flex items-center gap-2 mt-1.5">
//                 <div className="w-6 h-px bg-stone-300" />
//                 <p className="text-[11px] text-stone-400 font-mono tracking-[0.15em] uppercase">
//                   खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा
//                 </p>
//               </div>
//             </div>

//             {/* Right: user + buttons */}
//             <div className="flex items-center gap-2 shrink-0">

//               {/* User button */}
//               {isLoggedIn ? (
//                 <button
//                   onClick={() => setDashboardOpen(true)}
//                   className="flex items-center gap-2 text-xs border border-stone-200 px-3 py-2 hover:bg-stone-50 transition-colors"
//                 >
//                   <User className="h-3.5 w-3.5 text-stone-500" />
//                   <span className="hidden sm:inline text-stone-600 font-medium max-w-[100px] truncate">
//                     {user?.name || user?.phone}
//                   </span>
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => setLoginOpen(true)}
//                   className="text-xs border border-stone-200 px-3 py-2 text-stone-600 hover:bg-stone-50 transition-colors font-medium"
//                 >
//                   Sign in
//                 </button>
//               )}

//               {/* Post Notice button — outline style, always visible */}
//               <Button
//                 variant="outline"
//                 onClick={handlePostNoticeClick}
//                 className="border-stone-400 text-stone-700 hover:bg-stone-100 h-9 px-3 text-xs font-semibold tracking-wide gap-1.5 hidden sm:flex"
//               >
//                 🕯 <span>Post Notice</span>
//               </Button>

//               {/* Post Ad */}
//               <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
//                 <SheetTrigger asChild>
//                   <Button
//                     onClick={handlePostAdClick}
//                     className="bg-stone-900 hover:bg-stone-700 text-white h-9 px-4 text-sm font-semibold tracking-wide gap-2"
//                   >
//                     <PenLine className="h-3.5 w-3.5" />
//                     <span className="hidden sm:inline">Post Ad</span>
//                     <span className="sm:hidden">Post</span>
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white border-stone-200">
//                   <SheetHeader className="mb-6">
//                     <div className="h-0.5 bg-stone-900 mb-4 -mx-6" />
//                     <SheetTitle className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
//                       <Newspaper className="h-4 w-4" />
//                       New Advertisement
//                     </SheetTitle>
//                     <SheetDescription className="text-xs text-stone-500">
//                       Rs. 20 per word · Minimum Rs. 200 · Published after review
//                     </SheetDescription>
//                   </SheetHeader>
//                   <AdForm onSuccess={handleAdPosted} />
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>

//           {/* Category nav */}
//           <nav className="flex overflow-x-auto pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
//             {CATEGORIES.map(cat => (
//               <button
//                 key={cat.value}
//                 onClick={() => setActiveCategory(cat.value)}
//                 className={`shrink-0 text-[12px] font-semibold tracking-wider uppercase px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
//                   activeCategory === cat.value
//                     ? 'border-stone-900 text-stone-900'
//                     : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-300'
//                 } ${cat.value === 'notices' ? 'font-["Noto_Sans_Devanagari",sans-serif]' : ''}`}
//                 style={cat.value === 'notices' ? { fontFamily: "'Noto Sans Devanagari',sans-serif", letterSpacing: '0.05em' } : {}}
//               >
//                 {cat.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </header>

//       {/* ── Main ─────────────────────────────────────── */}
//       <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

//         {isNotices ? (
//           /* ── NOTICES VIEW (full width, no sidebar) ── */
//           <NoticesSection />
//         ) : (
//           /* ── CLASSIFIEDS VIEW (with sidebar) ────── */
//           <div className="flex gap-8">

//             {/* Primary column */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-4 mb-6">
//                 <div>
//                   <h2 className="font-serif text-lg font-bold text-stone-900">
//                     {SECTION_LABEL[activeCategory]}
//                   </h2>
//                   <p className="text-xs text-stone-400 mt-0.5">
//                     {activeCategory === 'all'
//                       ? 'Verified advertisements from across Nepal'
//                       : `Verified ${SECTION_LABEL[activeCategory].toLowerCase()} listings`}
//                   </p>
//                 </div>
//                 <div className="h-px flex-1 bg-stone-200" />
//                 {activeCategory !== 'all' && (
//                   <button
//                     onClick={() => setActiveCategory('all')}
//                     className="text-[11px] text-stone-400 hover:text-stone-700 font-mono uppercase tracking-wider transition-colors"
//                   >
//                     ✕ Clear
//                   </button>
//                 )}
//               </div>
//               <AdList
//                 key={`${activeCategory}-${refreshKey}`}
//                 refresh={refreshKey}
//                 initialCategory={activeCategory}
//               />
//             </div>

//             {/* Sidebar */}
//             <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-5">
//               <div className="bg-stone-900 text-white p-5">
//                 <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">
//                   Advertise Here
//                 </div>
//                 <p className="font-serif text-sm leading-relaxed text-stone-200 mb-4">
//                   Reach thousands of Nepalis. Post your classified starting from Rs. 200.
//                 </p>
//                 <div className="space-y-1 text-xs text-stone-400 font-mono mb-4">
//                   <div className="flex justify-between"><span>Per word</span><span>Rs. 20</span></div>
//                   <div className="flex justify-between"><span>Minimum</span><span>Rs. 200</span></div>
//                   <div className="flex justify-between text-amber-400"><span>Premium 2×</span><span>Rs. 400+</span></div>
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={handlePostAdClick}
//                   className="w-full border-white text-white bg-transparent hover:bg-white hover:text-stone-900 text-xs h-8 tracking-wider font-semibold"
//                 >
//                   Post an Ad <ChevronRight className="h-3 w-3 ml-1" />
//                 </Button>
//               </div>

//               {/* Notices promo */}
//               <div className="border border-stone-200 p-5 bg-[#fffef9]">
//                 <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">
//                   सूचना / Notices
//                 </div>
//                 <p className="text-xs text-stone-600 leading-relaxed mb-3">
//                   Post obituaries, wedding announcements, graduations & more.
//                 </p>
//                 <div className="space-y-1 text-xs text-stone-400 font-mono mb-3">
//                   <div className="flex justify-between"><span>समवेदना</span><span>Rs. 1,000</span></div>
//                   <div className="flex justify-between"><span>शुभकामना</span><span>Rs. 500+</span></div>
//                 </div>
//                 <button
//                   onClick={() => setActiveCategory('notices')}
//                   className="w-full text-xs py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors font-semibold"
//                 >
//                   Browse Notices →
//                 </button>
//               </div>

//               <div className="border border-stone-200 p-5">
//                 <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">
//                   Browse by Section
//                 </div>
//                 <div className="space-y-1">
//                   {CATEGORIES.filter(c => c.value !== 'all' && c.value !== 'notices').map(cat => (
//                     <button
//                       key={cat.value}
//                       onClick={() => setActiveCategory(cat.value)}
//                       className={`w-full text-left text-xs px-2 py-1.5 flex items-center justify-between transition-colors rounded-sm ${
//                         activeCategory === cat.value
//                           ? 'bg-stone-900 text-white font-semibold'
//                           : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
//                       }`}
//                     >
//                       {cat.label}
//                       <ChevronRight className="h-3 w-3 opacity-40" />
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {isLoggedIn && (
//                 <button
//                   onClick={() => setDashboardOpen(true)}
//                   className="border border-stone-200 p-4 text-left hover:bg-stone-50 transition-colors"
//                 >
//                   <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">My Ads</div>
//                   <p className="text-xs text-stone-600">View and manage your posted advertisements</p>
//                 </button>
//               )}

//               <div className="border border-stone-200 p-5">
//                 <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-3">
//                   How It Works
//                 </div>
//                 <div className="space-y-3">
//                   {[
//                     { step: '01', text: 'Sign in with your mobile number' },
//                     { step: '02', text: 'Write your ad & choose category' },
//                     { step: '03', text: 'Pay Rs. 20 per word' },
//                     { step: '04', text: 'Published after review' },
//                   ].map(item => (
//                     <div key={item.step} className="flex items-start gap-3">
//                       <span className="font-mono text-[10px] font-bold text-stone-400 shrink-0 mt-0.5">{item.step}</span>
//                       <span className="text-xs text-stone-600">{item.text}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <p className="text-[10px] text-stone-400 leading-relaxed">
//                 All advertisements subject to Nepal Advertisement (Regulation) Act 2076.
//               </p>
//             </aside>
//           </div>
//         )}
//       </main>

//       {/* ── Footer ───────────────────────────────────── */}
//       <footer className="mt-16 border-t border-stone-200 bg-white">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div>
//               <p className="font-serif font-bold text-stone-900">Flyers<span className="text-stone-300">.</span></p>
//               <p className="text-xs text-stone-400 mt-0.5">Nepal's trusted digital classifieds — est. 2026</p>
//             </div>
//             <div className="text-[11px] text-stone-400 text-right space-y-0.5">
//               <p>Compliant with Advertisement (Regulation) Act 2076</p>
//               <p>Registered with Department of Information</p>
//             </div>
//           </div>
//           <Separator className="my-4 bg-stone-100" />
//           <p className="text-[11px] text-stone-400 text-center">
//             © {new Date().getFullYear()} Flyers. All advertisements are independently placed.
//           </p>
//         </div>
//       </footer>

//       {/* ── Modals / Sheets ──────────────────────────── */}
//       <LoginModal
//         open={loginOpen}
//         onClose={() => setLoginOpen(false)}
//         onSuccess={() => {
//           setLoginOpen(false);
//           setSheetOpen(true);
//         }}
//       />

//       {dashboardOpen && (
//         <MyAdsDashboard onClose={() => setDashboardOpen(false)} />
//       )}

//       {/* Post Notice sheet */}
//       {noticeSheetOpen && (
//         <NoticeForm
//           onClose={() => setNoticeSheetOpen(false)}
//           onSuccess={() => {
//             setNoticeSheetOpen(false);
//             setActiveCategory('notices');
//           }}
//         />
//       )}
//     </div>
//   );
// }. 

// ================================================================
// FILE: frontend/src/App.tsx
// Design: Flyers v18 — editorial broadsheet, desktop-first
// All mock/hardcoded data removed — fetched from backend API
// ================================================================

// import { useState, useEffect, useCallback } from 'react';
// import AdForm from '@/components/AdForm';
// import AdList from '@/components/AdList';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import { useAuth } from '@/context/AuthContext';
// import LoginModal from '@/components/LoginModal';
// import MyAdsDashboard from '@/pages/MyAdsDashboard';
// import { NoticeCard } from '@/components/NoticeCards';
// import NoticeForm from '@/components/NoticeForm';
// import type { Notice, NoticeType } from '@/types/index';

// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// // ── Design tokens ─────────────────────────────────────────────
// const TOKEN = {
//   bg:      '#F2EDE4',
//   bg2:     '#EAE4DA',
//   bg3:     '#E1D9CE',
//   white:   '#FDFAF5',
//   ink:     '#111009',
//   ink3:    '#3E3A32',
//   ink4:    '#6A6458',
//   ink5:    '#9A9488',
//   gold:    '#96701A',
//   gold2:   '#B8892A',
//   gold3:   '#D4A83C',
//   goldx:   '#FAF0D8',
//   dark:    '#141210',
//   dark2:   '#1C1A16',
//   border:  '#DDD5C8',
//   border2: '#C8BEB0',
// };

// const FONT = {
//   serif: "'Playfair Display', Georgia, serif",
//   sans:  "'DM Sans', system-ui, sans-serif",
//   mono:  "'DM Mono', 'Courier New', monospace",
//   deva:  "'Noto Sans Devanagari', sans-serif",
// };

// // ── Types ──────────────────────────────────────────────────────
// interface TickerItem {
//   cat: string;
//   title: string;
// }

// interface LiveFeedItem {
//   id: string;
//   cat: string;
//   catKey: string;
//   premium: boolean;
//   title: string;
//   desc: string;
//   phone: string;
//   loc: string;
//   time: string;
// }

// interface FeaturedItem {
//   id: string;
//   cat: string;
//   catKey: string;
//   title: string;
//   desc: string;
//   phone: string;
//   loc: string;
//   type: 'ad' | 'notice';
//   // notice-specific
//   noticeType?: string;
//   meta?: string;
//   by?: string;
//   color?: string;
//   bg?: string;
// }

// interface CategoryCount {
//   value: string;
//   label: string;
//   icon: string;
//   count: number;
//   isNP?: boolean;
// }

// // ── Category config ────────────────────────────────────────────
// const CATEGORIES = [
//   { value: 'all',          label: 'All Sections' },
//   { value: 'real-estate',  label: 'Real Estate'  },
//   { value: 'jobs',         label: 'Employment'   },
//   { value: 'services',     label: 'Services'     },
//   { value: 'matrimonial',  label: 'Matrimonial'  },
//   { value: 'automobiles',  label: 'Automobiles'  },
//   { value: 'notices',      label: 'सूचना'        },
// ];

// const SECTION_LABEL: Record<string, string> = {
//   all:           'Latest Listings',
//   'real-estate': 'Real Estate',
//   jobs:          'Employment',
//   services:      'Services',
//   matrimonial:   'Matrimonial',
//   automobiles:   'Automobiles',
//   notices:       'सूचनाहरू',
// };

// const NOTICE_TABS: { key: NoticeType | ''; label: string }[] = [
//   { key: '',              label: 'सबै'           },
//   { key: 'samvedana',     label: 'समवेदना'       },
//   { key: 'shraddhanjali', label: 'श्रद्धाञ्जली' },
//   { key: 'bibaha',        label: 'विवाह'         },
//   { key: 'graduation',    label: 'उत्तीर्ण'      },
//   { key: 'birth',         label: 'जन्म'          },
//   { key: 'business',      label: 'व्यापार'       },
// ];

// type CatKey = 'real-estate' | 'jobs' | 'services' | 'matrimonial' | 'automobiles';
// const CAT_COLORS: Record<CatKey, { bg: string; color: string; border: string }> = {
//   'real-estate': { bg: '#F0FAF4', color: '#14532D', border: '#BBF0CE' },
//   jobs:          { bg: '#EFF2FF', color: '#1E3A8A', border: '#BFCBFF' },
//   services:      { bg: '#F5F0FF', color: '#4C1D95', border: '#DDD6FE' },
//   matrimonial:   { bg: '#FFF0F5', color: '#9D174D', border: '#FBCFE8' },
//   automobiles:   { bg: '#FFF5EF', color: '#7C2D12', border: '#FDBA74' },
// };

// const CAT_SHORTCUTS = [
//   {
//     label: 'Real Estate',
//     value: 'real-estate',
//     icon: (
//       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
//         <polyline points="9 22 9 12 15 12 15 22"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'Employment',
//     value: 'jobs',
//     icon: (
//       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <rect x="2" y="7" width="20" height="14" rx="2"/>
//         <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'Automobiles',
//     value: 'automobiles',
//     icon: (
//       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <rect x="1" y="3" width="15" height="13" rx="2"/>
//         <path d="M16 8h4l3 5v3h-7V8z"/>
//         <circle cx="5.5" cy="18.5" r="2.5"/>
//         <circle cx="18.5" cy="18.5" r="2.5"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'Matrimonial',
//     value: 'matrimonial',
//     icon: (
//       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
//       </svg>
//     ),
//   },
//   {
//     label: 'Services',
//     value: 'services',
//     icon: (
//       <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//         <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
//       </svg>
//     ),
//   },
// ];

// // ── Icons ──────────────────────────────────────────────────────
// const IcMapPin = ({ size = 12 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
//     <circle cx="12" cy="10" r="3"/>
//   </svg>
// );

// const IcSearch = ({ size = 14 }: { size?: number }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//     <circle cx="11" cy="11" r="8"/>
//     <path d="m21 21-4.35-4.35"/>
//   </svg>
// );

// const IcUser = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
//     <circle cx="12" cy="7" r="4"/>
//   </svg>
// );

// const IcPen = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
//     <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
//   </svg>
// );

// // ── Skeleton loader ────────────────────────────────────────────
// const SkeletonCard = ({ width = 190, height = 120 }: { width?: number; height?: number }) => (
//   <div style={{
//     flexShrink: 0, width, height,
//     background: 'rgba(255,255,255,.04)',
//     animation: 'flyers-skeleton 1.4s ease infinite',
//   }} />
// );

// // ── Notices section ────────────────────────────────────────────
// function NoticesSection({ onPostNotice }: { onPostNotice: () => void }) {
//   const [notices,   setNotices]   = useState<Notice[]>([]);
//   const [total,     setTotal]     = useState(0);
//   const [noticeTab, setNoticeTab] = useState<NoticeType | ''>('');
//   const [loading,   setLoading]   = useState(true);
//   const [showForm,  setShowForm]  = useState(false);

//   const fetchNotices = useCallback(async (type: NoticeType | '' = noticeTab) => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({ limit: '40' });
//       if (type) params.set('type', type);
//       const res  = await fetch(`${API}/notices?${params}`);
//       const data = await res.json();
//       setNotices(data.notices ?? []);
//       setTotal(data.total ?? 0);
//     } catch {
//       setNotices([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [noticeTab]);

//   useEffect(() => { fetchNotices(noticeTab); }, [noticeTab]);

//   return (
//     <>
//       <div style={{ background: TOKEN.bg3 }}>
//         <div style={{
//           height: 4,
//           background: `repeating-linear-gradient(90deg,${TOKEN.gold2} 0,${TOKEN.gold2} 5px,${TOKEN.goldx} 5px,${TOKEN.goldx} 10px)`,
//         }} />

//         <div style={{ padding: '24px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
//           <div>
//             <div style={{ fontFamily: FONT.deva, fontWeight: 800, fontSize: 34, color: TOKEN.ink, lineHeight: 1 }}>
//               सूचनाहरू
//             </div>
//             <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold, marginTop: 5 }}>
//               Notices · Death &amp; Celebration
//             </div>
//           </div>
//           <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 2 }}>
//             <button style={{
//               fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase',
//               padding: '7px 14px', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white,
//               color: TOKEN.ink4, cursor: 'pointer',
//             }}>
//               View all
//             </button>
//             <button
//               onClick={() => setShowForm(true)}
//               style={{
//                 background: TOKEN.ink, color: TOKEN.white, border: 'none',
//                 padding: '8px 16px', fontFamily: FONT.deva, fontSize: 12, fontWeight: 600, cursor: 'pointer',
//               }}
//             >
//               + सूचना दिनुहोस्
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}`, marginTop: 14 }}>
//           <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
//             {NOTICE_TABS.map(t => (
//               <button
//                 key={t.key}
//                 onClick={() => setNoticeTab(t.key)}
//                 style={{
//                   fontFamily: FONT.deva, fontWeight: noticeTab === t.key ? 700 : 500,
//                   padding: '10px 14px', border: 'none', background: 'none',
//                   color: noticeTab === t.key ? TOKEN.ink : TOKEN.ink5,
//                   borderBottom: `2px solid ${noticeTab === t.key ? TOKEN.ink : 'transparent'}`,
//                   whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', transition: 'color 0.15s',
//                 }}
//               >
//                 {t.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div style={{ display: 'flex', gap: 12, padding: '18px 0 24px' }}>
//             {Array.from({ length: 5 }).map((_, i) => (
//               <div key={i} style={{
//                 flexShrink: 0, width: 160, height: 130,
//                 background: TOKEN.border, opacity: 0.5,
//                 animation: 'flyers-skeleton 1.4s ease infinite',
//                 animationDelay: `${i * 0.1}s`,
//               }} />
//             ))}
//           </div>
//         ) : notices.length === 0 ? (
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12 }}>
//             <div style={{ fontSize: 48 }}>📋</div>
//             <p style={{ fontFamily: FONT.deva, color: TOKEN.ink4 }}>कुनै सूचना छैन</p>
//             <p style={{ fontFamily: FONT.mono, fontSize: 11, color: TOKEN.ink5 }}>No notices in this category yet</p>
//             <button
//               onClick={() => setShowForm(true)}
//               style={{
//                 marginTop: 8, padding: '10px 24px', background: TOKEN.ink, color: TOKEN.white,
//                 border: 'none', fontFamily: FONT.sans, fontWeight: 600, fontSize: 13, cursor: 'pointer',
//               }}
//             >
//               पहिलो सूचना दिनुहोस्
//             </button>
//           </div>
//         ) : (
//           <>
//             <p style={{ fontFamily: FONT.mono, fontSize: 10, color: TOKEN.ink5, padding: '14px 0 0' }}>
//               {total} सूचना{total !== 1 ? 'हरू' : ''}
//             </p>
//             <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', padding: '18px 0 24px' }}>
//               {notices.map(n => <div key={n.id}><NoticeCard notice={n} /></div>)}
//             </div>
//           </>
//         )}
//       </div>

//       {showForm && (
//         <NoticeForm
//           onClose={() => setShowForm(false)}
//           onSuccess={() => { setShowForm(false); fetchNotices(noticeTab); }}
//         />
//       )}
//     </>
//   );
// }

// // ── Main App ───────────────────────────────────────────────────
// export default function App() {
//   const { user, isLoggedIn } = useAuth();

//   const [refreshKey,      setRefreshKey]      = useState(0);
//   const [sheetOpen,       setSheetOpen]       = useState(false);
//   const [noticeSheetOpen, setNoticeSheetOpen] = useState(false);
//   const [activeCategory,  setActiveCategory]  = useState('all');
//   const [loginOpen,       setLoginOpen]       = useState(false);
//   const [dashboardOpen,   setDashboardOpen]   = useState(false);
//   const [searchQuery,     setSearchQuery]     = useState('');

//   // ── API-driven state ─────────────────────────────────────────
//   const [tickerItems,     setTickerItems]     = useState<TickerItem[]>([]);
//   const [liveFeed,        setLiveFeed]        = useState<LiveFeedItem[]>([]);
//   const [featuredItems,   setFeaturedItems]   = useState<FeaturedItem[]>([]);
//   const [categoryCounts,  setCategoryCounts]  = useState<CategoryCount[]>([]);
//   const [recentSearches,  setRecentSearches]  = useState<string[]>([]);
//   const [trendingSearches,setTrendingSearches]= useState<string[]>([]);
//   const [feedLoading,     setFeedLoading]     = useState(true);
//   const [featuredLoading, setFeaturedLoading] = useState(true);

//   const isNotices = activeCategory === 'notices';

//   // ── Fetch ticker ─────────────────────────────────────────────
//   useEffect(() => {
//     fetch(`${API}/ads/ticker`)
//       .then(r => r.json())
//       .then((data: { items: TickerItem[] }) => setTickerItems(data.items ?? []))
//       .catch(() => setTickerItems([]));
//   }, []);

//   // ── Fetch live feed ───────────────────────────────────────────
//   useEffect(() => {
//     setFeedLoading(true);
//     fetch(`${API}/ads/live?limit=4`)
//       .then(r => r.json())
//       .then((data: { ads: LiveFeedItem[] }) => setLiveFeed(data.ads ?? []))
//       .catch(() => setLiveFeed([]))
//       .finally(() => setFeedLoading(false));
//   }, []);

//   // ── Fetch featured (ads + notices) ───────────────────────────
//   useEffect(() => {
//     setFeaturedLoading(true);
//     fetch(`${API}/featured?limit=7`)
//       .then(r => r.json())
//       .then((data: { items: FeaturedItem[] }) => setFeaturedItems(data.items ?? []))
//       .catch(() => setFeaturedItems([]))
//       .finally(() => setFeaturedLoading(false));
//   }, []);

//   // ── Fetch category counts ─────────────────────────────────────
//   useEffect(() => {
//     fetch(`${API}/categories/counts`)
//       .then(r => r.json())
//       .then((data: { categories: CategoryCount[] }) => setCategoryCounts(data.categories ?? []))
//       .catch(() => setCategoryCounts([]));
//   }, [refreshKey]);

//   // ── Fetch search hints ────────────────────────────────────────
//   useEffect(() => {
//     fetch(`${API}/search/hints`)
//       .then(r => r.json())
//       .then((data: { recent: string[]; trending: string[] }) => {
//         setRecentSearches(data.recent ?? []);
//         setTrendingSearches(data.trending ?? []);
//       })
//       .catch(() => { setRecentSearches([]); setTrendingSearches([]); });
//   }, []);

//   const handleAdPosted = () => {
//     setSheetOpen(false);
//     setTimeout(() => setRefreshKey(k => k + 1), 400);
//   };

//   const handlePostAdClick = () => {
//     if (!isLoggedIn) { setLoginOpen(true); return; }
//     setSheetOpen(true);
//   };

//   const today  = new Date();
//   const enDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

//   // ── Render ────────────────────────────────────────────────────
//   return (
//     <div style={{ minHeight: '100vh', background: TOKEN.bg, fontFamily: FONT.sans, WebkitFontSmoothing: 'antialiased' }}>

//       {/* ══════════════════════════════════════════
//           STICKY HEADER
//       ══════════════════════════════════════════ */}
//       <header style={{ position: 'sticky', top: 0, zIndex: 30, background: TOKEN.white }}>

//         {/* Dateline bar */}
//         <div style={{
//           background: TOKEN.dark, height: 34,
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           gap: 20, padding: '0 52px', overflow: 'hidden',
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
//             <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', color: '#C8B898' }}>{enDate}</span>
//             <span style={{ fontFamily: FONT.deva, fontSize: 10, color: '#B8A882' }}>फाल्गुण २५, २०८२</span>
//           </div>

//           {/* Ticker — real data */}
//           <div style={{
//             flex: 1, overflow: 'hidden',
//             maskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)',
//             WebkitMaskImage: 'linear-gradient(90deg,transparent,black 8%,black 92%,transparent)',
//           }}>
//             {tickerItems.length > 0 && (
//               <div style={{
//                 display: 'inline-flex', gap: 48, whiteSpace: 'nowrap',
//                 animation: 'flyers-ticker 30s linear infinite',
//               }}>
//                 {[...tickerItems, ...tickerItems].map((item, i) => (
//                   <span key={i} style={{ fontFamily: FONT.mono, fontSize: 10, color: '#9A8E76', letterSpacing: '0.05em' }}>
//                     <b style={{ color: TOKEN.gold3, fontWeight: 500 }}>{item.cat}</b>{' '}{item.title}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           <span style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A7E68', flexShrink: 0 }}>
//             Nepal's Digital Classifieds
//           </span>
//         </div>

//         {/* Masthead brand row */}
//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           gap: 20, padding: '22px 52px 18px',
//           borderBottom: `2.5px solid ${TOKEN.ink}`, background: TOKEN.white,
//         }}>
//           <div>
//             <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 58, letterSpacing: '-0.04em', color: TOKEN.ink, lineHeight: 0.88 }}>
//               Flyers<span style={{ color: TOKEN.gold2, fontStyle: 'italic', fontWeight: 700 }}>.</span>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8 }}>
//               <div style={{ width: 48, height: 1, background: TOKEN.gold2, opacity: 0.45 }} />
//               <span style={{ fontFamily: FONT.deva, fontSize: 11, color: TOKEN.ink5 }}>
//                 खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा
//               </span>
//             </div>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
//             {isLoggedIn ? (
//               <button
//                 onClick={() => setDashboardOpen(true)}
//                 style={{
//                   display: 'inline-flex', alignItems: 'center', gap: 7,
//                   fontFamily: FONT.mono, fontSize: 11, padding: '8px 15px',
//                   border: `1px solid ${TOKEN.border2}`, background: 'transparent',
//                   color: TOKEN.ink3, cursor: 'pointer',
//                 }}
//               >
//                 <IcUser />
//                 <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {user?.name || user?.phone}
//                 </span>
//               </button>
//             ) : (
//               <button
//                 onClick={() => setLoginOpen(true)}
//                 style={{
//                   display: 'inline-flex', alignItems: 'center', gap: 7,
//                   fontFamily: FONT.mono, fontSize: 11, padding: '8px 15px',
//                   border: `1px solid ${TOKEN.border2}`, background: 'transparent',
//                   color: TOKEN.ink3, cursor: 'pointer',
//                 }}
//               >
//                 <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
//                 Sign In
//               </button>
//             )}

//             <button
//               onClick={() => setNoticeSheetOpen(true)}
//               style={{
//                 fontFamily: FONT.deva, fontWeight: 500, fontSize: 12,
//                 padding: '8px 16px', border: `1px solid ${TOKEN.border2}`,
//                 background: 'transparent', color: TOKEN.ink, cursor: 'pointer',
//               }}
//             >
//               📋 सूचना दिनुहोस्
//             </button>

//             <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
//               <SheetTrigger asChild>
//                 <button
//                   onClick={handlePostAdClick}
//                   style={{
//                     display: 'inline-flex', alignItems: 'center', gap: 6,
//                     fontFamily: FONT.sans, fontWeight: 600, fontSize: 12, letterSpacing: '0.05em',
//                     background: TOKEN.ink, color: TOKEN.white, border: 'none',
//                     padding: '10px 24px', cursor: 'pointer',
//                   }}
//                 >
//                   <IcPen /> Post Ad
//                 </button>
//               </SheetTrigger>
//               <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white border-stone-200">
//                 <SheetHeader className="mb-6">
//                   <div className="h-0.5 bg-stone-900 mb-4 -mx-6" />
//                   <SheetTitle className="font-serif text-xl font-bold text-stone-900">
//                     New Advertisement
//                   </SheetTitle>
//                   <SheetDescription className="text-xs text-stone-500">
//                     Rs. 20 per word · Minimum Rs. 200 · Published after review
//                   </SheetDescription>
//                 </SheetHeader>
//                 <AdForm onSuccess={handleAdPosted} />
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>

//         {/* Category nav */}
//         <div style={{
//           display: 'flex', overflowX: 'auto', scrollbarWidth: 'none',
//           borderBottom: `1px solid ${TOKEN.border}`, padding: '0 52px',
//           background: TOKEN.white,
//         }}>
//           {CATEGORIES.map(cat => {
//             const active      = activeCategory === cat.value;
//             const isNoticesCat = cat.value === 'notices';
//             return (
//               <button
//                 key={cat.value}
//                 onClick={() => setActiveCategory(cat.value)}
//                 style={{
//                   fontFamily:    isNoticesCat ? FONT.deva : FONT.sans,
//                   fontWeight:    600,
//                   letterSpacing: isNoticesCat ? '0.05em' : '0.08em',
//                   textTransform: isNoticesCat ? 'none' : 'uppercase',
//                   fontSize:      isNoticesCat ? 13 : 10,
//                   padding: '10px 16px', border: 'none',
//                   borderBottom: `2px solid ${active ? TOKEN.ink : 'transparent'}`,
//                   color:         active ? TOKEN.ink : TOKEN.ink5,
//                   background:    'none', whiteSpace: 'nowrap', flexShrink: 0,
//                   cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
//                 }}
//               >
//                 {isNoticesCat && (
//                   <span style={{
//                     display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
//                     background: TOKEN.gold3, marginRight: 5, verticalAlign: 'middle',
//                     animation: 'flyers-pulse 2.2s ease infinite',
//                   }} />
//                 )}
//                 {cat.label}
//               </button>
//             );
//           })}
//         </div>
//       </header>

//       {/* ══════════════════════════════════════════
//           HERO — split layout
//       ══════════════════════════════════════════ */}
//       {!isNotices && (
//         <div style={{ position: 'relative', overflow: 'hidden', borderBottom: `3px solid ${TOKEN.ink}` }}>
//           <div style={{
//             position: 'absolute', inset: 0, zIndex: 0,
//             backgroundImage: 'linear-gradient(135deg,#2C3E50 0%,#3D2B1F 30%,#4A3728 50%,#2D3A2E 75%,#1A2840 100%)',
//             backgroundSize: 'cover', backgroundPosition: 'center',
//           }} />
//           <div style={{
//             position: 'absolute', inset: 0, zIndex: 1,
//             background: 'linear-gradient(105deg,rgba(10,9,6,.82) 0%,rgba(10,9,6,.62) 40%,rgba(10,9,6,.20) 65%,rgba(10,9,6,.03) 100%)',
//           }} />

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', position: 'relative', zIndex: 2 }}>

//             {/* LEFT */}
//             <div style={{
//               display: 'flex', flexDirection: 'column', justifyContent: 'center',
//               padding: '46px 52px', borderRight: '1px solid rgba(255,255,255,.07)',
//               position: 'relative', overflow: 'hidden',
//             }}>
//               <div style={{
//                 position: 'absolute', bottom: -8, left: -6,
//                 fontFamily: FONT.deva, fontWeight: 800, fontSize: 150,
//                 color: TOKEN.white, opacity: 0.07, lineHeight: 1,
//                 pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
//               }}>
//                 विज्ञापन
//               </div>

//               <div style={{
//                 display: 'inline-flex', alignItems: 'center', gap: 10,
//                 fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
//                 color: 'rgba(255,255,255,.42)', marginBottom: 12,
//               }}>
//                 <span style={{ width: 18, height: 1, background: TOKEN.gold3, display: 'inline-block' }} />
//                 Nepal · Nepali · <span style={{ color: TOKEN.gold3 }}>Yours</span>
//               </div>

//               <div style={{
//                 fontFamily: FONT.serif, fontWeight: 900, fontSize: 52,
//                 lineHeight: 0.93, letterSpacing: '-0.025em',
//                 color: 'rgba(255,255,255,.95)',
//                 textShadow: '0 2px 24px rgba(0,0,0,.4)',
//                 marginBottom: 6,
//               }}>
//                 Find anything<br />in <em style={{ color: TOKEN.gold3, fontStyle: 'italic' }}>Nepal.</em>
//               </div>

//               <div style={{ fontFamily: FONT.deva, fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,.42)', marginBottom: 24 }}>
//                 नेपालको सबैभन्दा विश्वसनीय डिजिटल विज्ञापन
//               </div>

//               {/* Search bar */}
//               <div style={{
//                 display: 'flex', alignItems: 'stretch', overflow: 'hidden',
//                 background: 'rgba(255,255,255,.93)', backdropFilter: 'blur(20px)',
//                 boxShadow: '0 4px 32px rgba(0,0,0,.25), 0 1px 0 rgba(255,255,255,.7) inset',
//                 maxWidth: 560, marginBottom: 12,
//               }}>
//                 <input
//                   value={searchQuery}
//                   onChange={e => setSearchQuery(e.target.value)}
//                   style={{
//                     flex: 1, border: 'none', background: 'transparent',
//                     fontFamily: FONT.sans, fontSize: 15, color: TOKEN.ink,
//                     padding: '16px 18px', outline: 'none',
//                   }}
//                   placeholder="Jobs, flats, bikes, matrimonial…"
//                 />
//                 <div style={{ width: 1, background: 'rgba(0,0,0,.08)', alignSelf: 'stretch', flexShrink: 0 }} />
//                 <div style={{
//                   fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em',
//                   color: TOKEN.ink4, background: 'rgba(0,0,0,.03)', border: 'none',
//                   padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
//                 }}>
//                   <IcMapPin size={10} /> Kathmandu
//                 </div>
//                 <div style={{ width: 1, background: 'rgba(0,0,0,.07)', alignSelf: 'stretch', flexShrink: 0 }} />
//                 <div style={{
//                   fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.06em',
//                   color: TOKEN.ink4, background: 'rgba(0,0,0,.03)', border: 'none',
//                   padding: '0 14px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
//                 }}>
//                   All Categories <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
//                 </div>
//                 <div style={{ width: 1, background: 'rgba(0,0,0,.07)', alignSelf: 'stretch', flexShrink: 0 }} />
//                 <button
//                   style={{
//                     background: TOKEN.ink, color: TOKEN.white, border: 'none',
//                     fontFamily: FONT.sans, fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
//                     display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
//                     padding: '0 24px', cursor: 'pointer',
//                   }}
//                 >
//                   <IcSearch /> Search
//                 </button>
//               </div>

//               {/* Category shortcuts */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
//                 {CAT_SHORTCUTS.map(sc => (
//                   <button
//                     key={sc.value}
//                     onClick={() => setActiveCategory(sc.value)}
//                     style={{
//                       display: 'inline-flex', alignItems: 'center', gap: 5,
//                       fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.05em',
//                       padding: '5px 11px', borderRadius: 3, cursor: 'pointer',
//                       border: '1px solid rgba(255,255,255,.16)',
//                       background: 'rgba(255,255,255,.07)',
//                       color: 'rgba(255,255,255,.6)', transition: 'all 0.15s', whiteSpace: 'nowrap',
//                     }}
//                   >
//                     {sc.icon} {sc.label}
//                   </button>
//                 ))}
//               </div>

//               <div style={{
//                 display: 'flex', alignItems: 'center',
//                 fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.06em',
//                 color: 'rgba(255,255,255,.32)',
//               }}>
//                 नेपालका <b style={{ color: TOKEN.gold3, fontWeight: 600, margin: '0 4px' }}>७७ जिल्लामा</b> विज्ञापन
//               </div>
//             </div>

//             {/* RIGHT: live feed panel */}
//             <div style={{
//               background: 'rgba(16,14,11,.88)',
//               display: 'flex', flexDirection: 'column',
//               position: 'relative', overflow: 'hidden',
//               borderLeft: '1px solid rgba(255,255,255,.04)',
//               borderTop: `2px solid ${TOKEN.gold2}`,
//             }}>
//               <div style={{
//                 position: 'absolute', inset: 0, pointerEvents: 'none',
//                 background: `
//                   radial-gradient(ellipse 70% 50% at 20% 0%,rgba(180,135,40,.1),transparent 60%),
//                   radial-gradient(ellipse 50% 40% at 100% 100%,rgba(180,135,40,.06),transparent 60%)
//                 `,
//               }} />

//               <div style={{
//                 position: 'relative', zIndex: 1,
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 borderBottom: '1px solid rgba(255,255,255,.05)', padding: '14px 22px',
//               }}>
//                 <div style={{
//                   fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase',
//                   color: TOKEN.gold3, display: 'flex', alignItems: 'center', gap: 9,
//                 }}>
//                   <span style={{
//                     width: 6, height: 6, borderRadius: '50%', background: TOKEN.gold3, flexShrink: 0,
//                     animation: 'flyers-pulse 1.8s ease infinite',
//                   }} />
//                   Live listings · updating now
//                 </div>
//                 <button
//                   onClick={() => setActiveCategory('all')}
//                   style={{
//                     fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.09em',
//                     color: 'rgba(255,255,255,.38)', background: 'none',
//                     border: '1px solid rgba(255,255,255,.1)', padding: '3px 10px', cursor: 'pointer',
//                   }}
//                 >
//                   Browse all →
//                 </button>
//               </div>

//               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
//                 {feedLoading
//                   ? Array.from({ length: 4 }).map((_, i) => (
//                       <div key={i} style={{
//                         padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,.04)',
//                       }}>
//                         <div style={{ height: 10, width: '60%', background: 'rgba(255,255,255,.06)', marginBottom: 8, animation: 'flyers-skeleton 1.4s ease infinite' }} />
//                         <div style={{ height: 14, width: '85%', background: 'rgba(255,255,255,.08)', marginBottom: 6, animation: 'flyers-skeleton 1.4s ease infinite' }} />
//                         <div style={{ height: 10, width: '70%', background: 'rgba(255,255,255,.04)', animation: 'flyers-skeleton 1.4s ease infinite' }} />
//                       </div>
//                     ))
//                   : liveFeed.map((item, i) => {
//                       const catColor = CAT_COLORS[item.catKey as CatKey];
//                       return (
//                         <div
//                           key={item.id}
//                           style={{
//                             padding: '14px 22px',
//                             borderBottom: '1px solid rgba(255,255,255,.04)',
//                             animation: `flyers-feed-in 0.35s ease ${0.08 + i * 0.1}s both`,
//                           }}
//                         >
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                               <span style={{
//                                 fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
//                                 padding: '2px 8px', fontWeight: 500,
//                                 background: catColor?.bg ?? 'rgba(255,255,255,.1)',
//                                 color: catColor?.color ?? TOKEN.white,
//                               }}>
//                                 {item.cat}
//                               </span>
//                               {item.premium && (
//                                 <span style={{ fontFamily: FONT.mono, fontSize: 8, color: TOKEN.gold3, letterSpacing: '0.06em' }}>
//                                   ★ Premium
//                                 </span>
//                               )}
//                             </div>
//                             <span style={{ fontFamily: FONT.mono, fontSize: 9, color: 'rgba(255,255,255,.22)' }}>{item.time}</span>
//                           </div>
//                           <div style={{
//                             fontFamily: FONT.serif, fontSize: 14, fontWeight: 700,
//                             color: 'rgba(255,255,255,.78)', lineHeight: 1.3, marginBottom: 4,
//                           }}>
//                             {item.title}
//                           </div>
//                           <div style={{
//                             fontSize: 11, color: 'rgba(255,255,255,.44)', lineHeight: 1.6, marginBottom: 8,
//                             display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
//                           } as React.CSSProperties}>
//                             {item.desc}
//                           </div>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                             <span style={{ fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,.38)', fontWeight: 500 }}>
//                               📞 {item.phone}
//                             </span>
//                             <span style={{ fontSize: 10, color: 'rgba(255,255,255,.28)' }}>📍 {item.loc}</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                 }
//               </div>

//               <div style={{
//                 position: 'relative', zIndex: 1,
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
//                 padding: '16px 22px',
//                 borderTop: '1px solid rgba(255,255,255,.05)',
//                 background: 'rgba(0,0,0,.2)',
//               }}>
//                 <span style={{ fontFamily: FONT.deva, fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.4 }}>
//                   तपाईंको विज्ञापन यहाँ राख्नुहोस्
//                 </span>
//                 <button
//                   onClick={handlePostAdClick}
//                   style={{
//                     background: TOKEN.gold2, color: TOKEN.dark, border: 'none',
//                     fontFamily: FONT.sans, fontWeight: 700, letterSpacing: '0.05em',
//                     fontSize: 11, padding: '9px 18px', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
//                   }}
//                 >
//                   + Post Your Ad Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════
//           FEATURED BELT — real data
//       ══════════════════════════════════════════ */}
//       {!isNotices && (
//         <div style={{ background: TOKEN.dark2, position: 'relative', overflow: 'hidden' }}>
//           <div style={{
//             position: 'absolute', inset: 0, pointerEvents: 'none',
//             background: 'radial-gradient(ellipse 40% 100% at 0% 50%,rgba(180,135,40,.09),transparent 65%)',
//           }} />
//           <div style={{
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             borderBottom: '1px solid rgba(255,255,255,.04)', padding: '10px 52px',
//             position: 'relative', zIndex: 1,
//           }}>
//             <div style={{
//               fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
//               color: TOKEN.gold3, display: 'flex', alignItems: 'center', gap: 10,
//             }}>
//               ★ <span style={{ width: 14, height: 1, background: TOKEN.gold2, opacity: 0.4, display: 'inline-block' }} />
//               Featured — Premium Ads &amp; Notices
//             </div>
//             <button style={{
//               fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.1em',
//               color: 'rgba(255,255,255,.35)', background: 'none',
//               border: '1px solid rgba(255,255,255,.08)', padding: '4px 12px', cursor: 'pointer',
//             }}>
//               See all →
//             </button>
//           </div>

//           <div style={{
//             display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none',
//             padding: '14px 52px 16px', position: 'relative', zIndex: 1,
//           }}>
//             {featuredLoading
//               ? Array.from({ length: 5 }).map((_, i) => (
//                   <SkeletonCard key={i} width={i < 3 ? 190 : 150} height={130} />
//                 ))
//               : featuredItems.map((item) => {
//                   if (item.type === 'ad') {
//                     const cc = CAT_COLORS[item.catKey as CatKey];
//                     return (
//                       <div key={item.id} style={{
//                         flexShrink: 0, width: 190, background: TOKEN.white,
//                         borderTop: `2.5px solid ${TOKEN.gold3}`, padding: '13px 13px 12px', position: 'relative',
//                       }}>
//                         <div style={{
//                           position: 'absolute', top: 0, right: 0,
//                           background: TOKEN.gold3, color: TOKEN.ink,
//                           fontFamily: FONT.mono, fontSize: 7, letterSpacing: '0.1em', padding: '2px 7px',
//                         }}>★ PREMIUM</div>
//                         <div style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 5 }}>{item.cat}</div>
//                         <div style={{ fontFamily: FONT.serif, fontSize: 13, fontWeight: 700, lineHeight: 1.25, color: TOKEN.ink, marginBottom: 4 }}>{item.title}</div>
//                         <div style={{ fontSize: 11, color: TOKEN.ink3, lineHeight: 1.55, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{item.desc}</div>
//                         <div style={{ borderTop: `1px solid ${TOKEN.border}`, paddingTop: 6 }}>
//                           <div style={{ fontFamily: FONT.mono, fontSize: 10, fontWeight: 500, color: TOKEN.ink }}>📞 {item.phone}</div>
//                           <div style={{ fontSize: 9, color: TOKEN.ink5, marginTop: 2 }}>📍 {item.loc}</div>
//                         </div>
//                       </div>
//                     );
//                   }
//                   // notice card
//                   return (
//                     <div key={item.id} style={{
//                       flexShrink: 0, width: 150, background: item.bg ?? TOKEN.white,
//                       borderTop: `2.5px solid ${item.color ?? TOKEN.gold3}`, padding: '14px 12px 13px',
//                       textAlign: 'center', position: 'relative',
//                     }}>
//                       <div style={{
//                         position: 'absolute', top: 0, right: 0,
//                         background: item.color ?? TOKEN.gold3, color: item.color === TOKEN.gold3 ? TOKEN.ink : '#fff',
//                         fontFamily: FONT.mono, fontSize: 7, letterSpacing: '0.1em', padding: '2px 7px',
//                       }}>★ NOTICE</div>
//                       <div style={{ fontFamily: FONT.deva, fontSize: 11, fontWeight: 700, color: item.color ?? TOKEN.gold3, marginBottom: 5 }}>{item.noticeType}</div>
//                       <div style={{ width: 16, height: 1, background: item.color ?? TOKEN.gold3, margin: '0 auto 7px', opacity: 0.3 }} />
//                       <div style={{ fontFamily: FONT.deva, fontSize: 13, fontWeight: 700, color: TOKEN.ink, lineHeight: 1.3, marginBottom: 3 }}>{item.title}</div>
//                       <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.04em', marginBottom: 3 }}>{item.meta}</div>
//                       <div style={{ fontFamily: FONT.deva, fontSize: 10, color: TOKEN.ink4 }}>{item.by}</div>
//                     </div>
//                   );
//                 })
//             }
//           </div>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════
//           MAIN CONTENT
//       ══════════════════════════════════════════ */}
//       <main>
//         {isNotices ? (
//           <div style={{ padding: '0 52px' }}>
//             <NoticesSection onPostNotice={() => setNoticeSheetOpen(true)} />
//           </div>
//         ) : (
//           <>
//             {/* Secondary search */}
//             <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}` }}>
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 52px' }}>
//                 <div style={{
//                   flex: 2, display: 'flex', alignItems: 'center', gap: 9,
//                   border: `1.5px solid ${TOKEN.border2}`, padding: '10px 14px',
//                   background: TOKEN.bg, minHeight: 44,
//                 }}>
//                   <IcSearch size={14} />
//                   <input
//                     style={{ border: 'none', background: 'none', fontFamily: FONT.sans, fontSize: 13, color: TOKEN.ink, outline: 'none', width: '100%' }}
//                     placeholder="Keyword — flat, engineer, Pulsar…"
//                   />
//                 </div>
//                 <div style={{
//                   flex: 1, display: 'flex', alignItems: 'center', gap: 9,
//                   border: `1.5px solid ${TOKEN.border2}`, padding: '10px 14px',
//                   background: TOKEN.bg, minHeight: 44,
//                 }}>
//                   <IcMapPin size={13} />
//                   <input
//                     style={{ border: 'none', background: 'none', fontFamily: FONT.sans, fontSize: 13, color: TOKEN.ink, outline: 'none', width: '100%' }}
//                     placeholder="District…"
//                   />
//                   <span style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.gold, letterSpacing: '0.04em', flexShrink: 0 }}>▾</span>
//                 </div>
//                 <button style={{
//                   fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
//                   padding: '0 22px', background: TOKEN.ink, color: TOKEN.white, border: 'none',
//                   minHeight: 44, cursor: 'pointer', flexShrink: 0,
//                 }}>
//                   Search
//                 </button>
//               </div>
//             </div>

//             {/* Search hints — real data */}
//             {(recentSearches.length > 0 || trendingSearches.length > 0) && (
//               <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}`, overflow: 'hidden' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', padding: '7px 52px' }}>
//                   {recentSearches.length > 0 && (
//                     <>
//                       <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOKEN.ink5, flexShrink: 0 }}>Recent</span>
//                       {recentSearches.map(h => (
//                         <div
//                           key={h}
//                           onClick={() => setSearchQuery(h)}
//                           style={{
//                             display: 'inline-flex', alignItems: 'center',
//                             fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.04em',
//                             color: TOKEN.ink4, background: TOKEN.white, border: `1px solid ${TOKEN.border2}`,
//                             padding: '3px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer',
//                           }}
//                         >{h}</div>
//                       ))}
//                     </>
//                   )}
//                   {recentSearches.length > 0 && trendingSearches.length > 0 && (
//                     <span style={{ width: 1, height: 12, background: TOKEN.border2, flexShrink: 0 }} />
//                   )}
//                   {trendingSearches.length > 0 && (
//                     <>
//                       <span style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: TOKEN.ink5, flexShrink: 0 }}>Trending</span>
//                       {trendingSearches.map(h => (
//                         <div
//                           key={h}
//                           onClick={() => setSearchQuery(h)}
//                           style={{
//                             display: 'inline-flex', alignItems: 'center',
//                             fontFamily: FONT.mono, fontSize: 9,
//                             color: TOKEN.gold, border: `1px solid rgba(150,112,26,.3)`, background: TOKEN.goldx,
//                             padding: '3px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer',
//                           }}
//                         >{h}</div>
//                       ))}
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Filter pills */}
//             <div style={{ background: TOKEN.bg2, borderBottom: `1px solid ${TOKEN.border}` }}>
//               <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 52px' }}>
//                 {['All', 'Real Estate', 'Employment', 'Services', 'Matrimonial', 'Automobiles'].map(p => {
//                   const isActive =
//                     (p === 'All' && activeCategory === 'all') ||
//                     p.toLowerCase().replace(' ', '-') === activeCategory ||
//                     (p === 'Employment' && activeCategory === 'jobs');
//                   return (
//                     <div
//                       key={p}
//                       onClick={() => {
//                         const val = p === 'All' ? 'all' : p === 'Employment' ? 'jobs' : p.toLowerCase().replace(' ', '-');
//                         setActiveCategory(val);
//                       }}
//                       style={{
//                         fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
//                         padding: '6px 14px', border: `1px solid ${isActive ? TOKEN.ink : TOKEN.border2}`,
//                         borderRadius: 20, background: isActive ? TOKEN.ink : TOKEN.white,
//                         color: isActive ? TOKEN.white : TOKEN.ink4,
//                         flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer', minHeight: 32,
//                         display: 'inline-flex', alignItems: 'center',
//                       }}
//                     >{p}</div>
//                   );
//                 })}
//                 <div style={{ flex: 1 }} />
//                 <div style={{
//                   fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
//                   padding: '6px 14px', border: `1px solid ${TOKEN.gold2}`, borderRadius: 20,
//                   background: TOKEN.goldx, color: TOKEN.gold,
//                   flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer', minHeight: 32,
//                   display: 'inline-flex', alignItems: 'center',
//                 }}>★ Premium first</div>
//                 <div style={{
//                   fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase',
//                   padding: '6px 14px', border: `1px solid ${TOKEN.border2}`, borderRadius: 20,
//                   background: TOKEN.white, color: TOKEN.ink4,
//                   flexShrink: 0, whiteSpace: 'nowrap', cursor: 'pointer', minHeight: 32,
//                   display: 'inline-flex', alignItems: 'center',
//                 }}>Newest</div>
//               </div>
//             </div>

//             {/* Section header */}
//             <div style={{ borderBottom: `1px solid ${TOKEN.border}` }}>
//               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '22px 52px 15px' }}>
//                 <div>
//                   <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 26, color: TOKEN.ink, lineHeight: 1 }}>
//                     {SECTION_LABEL[activeCategory]}
//                   </div>
//                   <div style={{ fontSize: 11, color: TOKEN.ink4, marginTop: 4, fontStyle: 'italic' }}>
//                     {activeCategory === 'all'
//                       ? 'Verified advertisements from across Nepal'
//                       : `Verified ${SECTION_LABEL[activeCategory].toLowerCase()} listings`}
//                   </div>
//                 </div>
//                 {activeCategory !== 'all' && (
//                   <button
//                     onClick={() => setActiveCategory('all')}
//                     style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.08em', color: TOKEN.ink5, background: 'none', border: 'none', cursor: 'pointer' }}
//                   >
//                     ✕ Clear filter
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Ad list */}
//             <div style={{ padding: '24px 52px 32px', background: TOKEN.bg }}>
//               <AdList
//                 key={`${activeCategory}-${refreshKey}`}
//                 refresh={refreshKey}
//                 initialCategory={activeCategory}
//               />
//             </div>

//             {/* Browse by section — real counts from API */}
//             <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}` }}>
//               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '24px 52px 16px' }}>
//                 <div>
//                   <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.ink5, marginBottom: 4 }}>Explore</div>
//                   <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 20, color: TOKEN.ink }}>Browse by Section</div>
//                 </div>
//                 <button style={{
//                   fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
//                   color: TOKEN.gold, border: `1px solid ${TOKEN.gold2}`, background: 'none', padding: '6px 14px', cursor: 'pointer',
//                 }}>View all →</button>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, padding: '0 52px 24px' }}>
//                 {categoryCounts.map(bc => (
//                   <button
//                     key={bc.value}
//                     onClick={() => setActiveCategory(bc.value)}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 12,
//                       padding: '15px 16px',
//                       border: `1px solid ${bc.isNP ? 'rgba(150,112,26,.3)' : TOKEN.border}`,
//                       borderRadius: 10,
//                       background: bc.isNP ? TOKEN.goldx : TOKEN.bg,
//                       cursor: 'pointer', textAlign: 'left',
//                       transition: 'transform 0.15s, box-shadow 0.15s',
//                     }}
//                   >
//                     <span style={{ fontSize: 22 }}>{bc.icon}</span>
//                     <div>
//                       <div style={{
//                         fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: TOKEN.ink,
//                         fontFamily: bc.isNP ? FONT.deva : FONT.sans,
//                         ...(bc.isNP ? { color: '#92400E' } : {}),
//                       }}>{bc.label}</div>
//                       <div style={{ fontFamily: FONT.mono, fontSize: 10, color: TOKEN.ink5, marginTop: 2 }}>
//                         {bc.count} listings
//                       </div>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Advertise block */}
//             <div style={{ background: TOKEN.dark, position: 'relative', overflow: 'hidden' }}>
//               <div style={{
//                 position: 'absolute', inset: 0, pointerEvents: 'none',
//                 background: `
//                   radial-gradient(ellipse 55% 70% at 110% -10%,rgba(180,135,40,.12),transparent 60%),
//                   radial-gradient(ellipse 40% 60% at -10% 110%,rgba(180,135,40,.07),transparent 60%)
//                 `,
//               }} />
//               <div style={{
//                 position: 'relative', zIndex: 1,
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40,
//                 padding: '40px 52px',
//               }}>
//                 <div>
//                   <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 10 }}>
//                     Advertise with Flyers
//                   </div>
//                   <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 34, color: TOKEN.white, lineHeight: 1.18, marginBottom: 8 }}>
//                     Your ad,<br />their <em style={{ color: TOKEN.gold3, fontStyle: 'italic' }}>attention.</em>
//                   </div>
//                   <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.7, marginBottom: 22, maxWidth: 440 }}>
//                     Post a classified in minutes. Buyers, job seekers, and families across all 77 districts of Nepal see your listing the moment it goes live.
//                   </div>
//                   <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//                     <button
//                       onClick={handlePostAdClick}
//                       style={{
//                         padding: '12px 30px', background: TOKEN.gold2, color: TOKEN.dark,
//                         border: 'none', fontFamily: FONT.sans, fontSize: 13, fontWeight: 700,
//                         letterSpacing: '0.04em', cursor: 'pointer',
//                       }}
//                     >
//                       Post an Ad →
//                     </button>
//                     <button style={{
//                       padding: '12px 24px', background: 'transparent', color: 'rgba(255,255,255,.35)',
//                       border: '1px solid rgba(255,255,255,.1)', fontFamily: FONT.sans, fontSize: 13, cursor: 'pointer',
//                     }}>
//                       Learn more
//                     </button>
//                   </div>
//                 </div>
//                 <div style={{
//                   display: 'flex', flexShrink: 0,
//                   background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
//                   overflow: 'hidden',
//                 }}>
//                   {[
//                     { label: 'Per Word', value: 'Rs. 20',  gold: false },
//                     { label: 'Minimum',  value: 'Rs. 200', gold: false },
//                     { label: 'Premium',  value: 'Rs. 400+',gold: true  },
//                   ].map((p, i) => (
//                     <div key={i} style={{
//                       padding: '20px 30px', textAlign: 'center',
//                       borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none',
//                     }}>
//                       <div style={{ fontFamily: FONT.mono, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 7 }}>
//                         {p.label}
//                       </div>
//                       <div style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 500, color: p.gold ? TOKEN.gold3 : 'rgba(255,255,255,.5)' }}>
//                         {p.value}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Notices preview */}
//             <div style={{ background: TOKEN.bg3 }}>
//               <div style={{ height: 4, background: `repeating-linear-gradient(90deg,${TOKEN.gold2} 0,${TOKEN.gold2} 5px,${TOKEN.goldx} 5px,${TOKEN.goldx} 10px)` }} />
//               <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '24px 52px 0' }}>
//                 <div>
//                   <div style={{ fontFamily: FONT.deva, fontWeight: 800, fontSize: 34, color: TOKEN.ink, lineHeight: 1 }}>सूचनाहरू</div>
//                   <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKEN.gold, marginTop: 5 }}>
//                     Notices · Death &amp; Celebration
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
//                   <button
//                     onClick={() => setActiveCategory('notices')}
//                     style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '7px 14px', border: `1px solid ${TOKEN.border2}`, background: TOKEN.white, color: TOKEN.ink4, cursor: 'pointer' }}
//                   >
//                     View all
//                   </button>
//                   <button
//                     onClick={() => setNoticeSheetOpen(true)}
//                     style={{ background: TOKEN.ink, color: TOKEN.white, border: 'none', padding: '8px 16px', fontFamily: FONT.deva, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
//                   >
//                     + सूचना दिनुहोस्
//                   </button>
//                 </div>
//               </div>
//               {/* Notice tabs */}
//               <div style={{ background: TOKEN.white, borderBottom: `1px solid ${TOKEN.border}`, marginTop: 14 }}>
//                 <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 52px' }}>
//                   {NOTICE_TABS.slice(0, 5).map(t => (
//                     <button
//                       key={t.key}
//                       onClick={() => { setActiveCategory('notices'); }}
//                       style={{
//                         fontFamily: FONT.deva, fontWeight: t.key === '' ? 700 : 500,
//                         padding: '10px 14px', border: 'none', background: 'none',
//                         color: t.key === '' ? TOKEN.ink : TOKEN.ink5,
//                         borderBottom: `2px solid ${t.key === '' ? TOKEN.ink : 'transparent'}`,
//                         whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
//                       }}
//                     >{t.label}</button>
//                   ))}
//                 </div>
//               </div>
//               {/* Notice cards from featured — notices only */}
//               <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', padding: '18px 52px 24px' }}>
//                 {featuredLoading
//                   ? Array.from({ length: 4 }).map((_, i) => (
//                       <div key={i} style={{ flexShrink: 0, width: 160, height: 130, background: TOKEN.border, opacity: 0.4, animation: 'flyers-skeleton 1.4s ease infinite' }} />
//                     ))
//                   : featuredItems
//                       .filter(item => item.type === 'notice')
//                       .map((nc) => (
//                         <div key={nc.id} style={{
//                           flexShrink: 0, width: 180,
//                           textAlign: 'center', background: nc.bg ?? TOKEN.white,
//                           border: `1px solid ${TOKEN.border}`, borderTop: `2.5px solid ${nc.color ?? TOKEN.gold3}`,
//                           borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden',
//                           position: 'relative',
//                         }}>
//                           <div style={{ padding: '14px 14px 16px' }}>
//                             <div style={{ fontFamily: FONT.deva, fontSize: 11, fontWeight: 700, color: nc.color ?? TOKEN.gold3, marginBottom: 7 }}>{nc.noticeType}</div>
//                             <div style={{ width: 20, height: 1, background: TOKEN.border, margin: '0 auto 8px' }} />
//                             <div style={{ fontFamily: FONT.deva, fontSize: 14, fontWeight: 700, color: TOKEN.ink, lineHeight: 1.3, marginBottom: 3 }}>{nc.title}</div>
//                             {nc.meta && <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, letterSpacing: '0.04em', marginBottom: 6 }}>{nc.meta}</div>}
//                             <div style={{ fontFamily: FONT.deva, fontSize: 11, color: TOKEN.ink3 }}>{nc.by}</div>
//                           </div>
//                         </div>
//                       ))
//                 }
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* ══════════════════════════════════════════
//           FOOTER
//       ══════════════════════════════════════════ */}
//       <footer style={{ background: TOKEN.dark }}>
//         <div style={{ height: 3, background: `linear-gradient(90deg,${TOKEN.gold},${TOKEN.gold3} 45%,${TOKEN.gold2})` }} />
//         <div style={{
//           display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 52,
//           padding: '48px 52px', borderBottom: '1px solid rgba(255,255,255,.05)',
//         }}>
//           <div>
//             <div style={{ fontFamily: FONT.serif, fontWeight: 900, fontSize: 46, color: TOKEN.white, lineHeight: 0.88, letterSpacing: '-0.04em', marginBottom: 14 }}>
//               Flyers<span style={{ color: TOKEN.gold2, fontStyle: 'italic', fontWeight: 700 }}>.</span>
//             </div>
//             <div style={{ fontFamily: FONT.deva, fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.6, marginBottom: 18 }}>
//               खल्तीबाटै विज्ञापन · मात्र एक क्लिकमा<br />नेपाल · नेपाली · तपाईंको
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//               {['acharyankit3@gmail.com', '9807345551', 'Kathmandu, Nepal'].map(c => (
//                 <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.mono, fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '0.04em' }}>
//                   <span style={{ width: 4, height: 4, borderRadius: '50%', background: TOKEN.gold2, flexShrink: 0 }} />
//                   {c}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Categories</div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
//               {['Real Estate', 'Employment', 'Services', 'Matrimonial', 'Automobiles'].map(l => (
//                 <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>
//                   <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
//                 </div>
//               ))}
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.deva, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>
//                 <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> सूचनाहरू
//               </div>
//             </div>
//           </div>

//           <div>
//             <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Advertise</div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
//               {['Post an Ad', 'Premium Listings', 'Post a Notice', 'Pricing'].map(l => (
//                 <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}>
//                   <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <div style={{ fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 15 }}>Company</div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
//               {[
//                 'About Flyers',
//                 isLoggedIn ? 'My Ads Dashboard' : 'Sign In',
//                 'Terms & Conditions',
//                 'Privacy Policy',
//                 'Contact Us',
//               ].map(l => (
//                 <div
//                   key={l}
//                   onClick={l === 'My Ads Dashboard' ? () => setDashboardOpen(true) : undefined}
//                   style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}
//                 >
//                   <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.15)', flexShrink: 0 }} /> {l}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
//           padding: '16px 52px',
//         }}>
//           <div style={{ fontSize: 10, color: 'rgba(255,255,255,.18)', lineHeight: 1.6 }}>
//             © {today.getFullYear()} Flyers. All advertisements independently placed. Subject to Nepal Advertisement (Regulation) Act 2076.
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             {['Adv. Act 2076', 'Dept. of Information'].map(b => (
//               <div key={b} style={{
//                 fontFamily: FONT.mono, fontSize: 9, color: 'rgba(255,255,255,.2)',
//                 background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
//                 padding: '4px 12px', whiteSpace: 'nowrap',
//               }}>{b}</div>
//             ))}
//           </div>
//         </div>
//       </footer>

//       {/* ══════════════════════════════════════════
//           CSS KEYFRAMES
//       ══════════════════════════════════════════ */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

//         @keyframes flyers-ticker {
//           to { transform: translateX(-50%); }
//         }
//         @keyframes flyers-pulse {
//           0%,100% { opacity:1; transform:scale(1); }
//           50%      { opacity:.3; transform:scale(.55); }
//         }
//         @keyframes flyers-feed-in {
//           from { opacity:0; transform:translateX(10px); }
//           to   { opacity:1; transform:translateX(0); }
//         }
//         @keyframes flyers-skeleton {
//           0%,100% { opacity:.5; }
//           50%     { opacity:.2; }
//         }
//         *::-webkit-scrollbar { display: none; }
//         * { scrollbar-width: none; }
//       `}</style>

//       {/* ══════════════════════════════════════════
//           MODALS & SHEETS
//       ══════════════════════════════════════════ */}
//       <LoginModal
//         open={loginOpen}
//         onClose={() => setLoginOpen(false)}
//         onSuccess={() => { setLoginOpen(false); setSheetOpen(true); }}
//       />

//       {dashboardOpen && <MyAdsDashboard onClose={() => setDashboardOpen(false)} />}

//       {noticeSheetOpen && (
//         <NoticeForm
//           onClose={() => setNoticeSheetOpen(false)}
//           onSuccess={() => { setNoticeSheetOpen(false); setActiveCategory('notices'); }}
//         />
//       )}
//     </div>
//   );
// } 


// ================================================================
// FILE: src/App.tsx
// Root — sets up React Router, wraps everything in SiteLayout.
// All page logic lives in src/pages/*.
// ================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiteLayout   from '@/components/SiteLayout';
import HomePage     from '@/pages/HomePage';
import CategoryPage from '@/pages/CategoryPage';
import NoticesPage  from '@/pages/NoticesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <SiteLayout>
              <HomePage />
            </SiteLayout>
          }
        />

        {/* ── Category pages
            Each gets its own URL, custom banner, category-scoped featured belt
        ── */}
        <Route
          path="/real-estate"
          element={
            <SiteLayout>
              <CategoryPage category="real-estate" />
            </SiteLayout>
          }
        />
        <Route
          path="/jobs"
          element={
            <SiteLayout>
              <CategoryPage category="jobs" />
            </SiteLayout>
          }
        />
        <Route
          path="/services"
          element={
            <SiteLayout>
              <CategoryPage category="services" />
            </SiteLayout>
          }
        />
        <Route
          path="/matrimonial"
          element={
            <SiteLayout>
              <CategoryPage category="matrimonial" />
            </SiteLayout>
          }
        />
        <Route
          path="/automobiles"
          element={
            <SiteLayout>
              <CategoryPage category="automobiles" />
            </SiteLayout>
          }
        />

        {/* Notices */}
        <Route
          path="/notices"
          element={
            <SiteLayout>
              <NoticesPage />
            </SiteLayout>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <SiteLayout>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '40vh', gap: 12, padding: '60px 52px',
              }}>
                <div style={{ fontSize: 64 }}>🗞️</div>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 900, fontSize: 32, color: '#111009' }}>
                  Page not found
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#9A9488' }}>
                  The page you're looking for doesn't exist.
                </div>
                <a
                  href="/"
                  style={{ marginTop: 12, padding: '10px 28px', background: '#111009', color: '#FDFAF5', textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13 }}
                >
                  ← Back to Home
                </a>
              </div>
            </SiteLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
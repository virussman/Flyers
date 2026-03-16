// ================================================================
// FILE: src/lib/constants.ts
// Shared design tokens, types, category config
// ================================================================

export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Design tokens ─────────────────────────────────────────────
export const TOKEN = {
  bg:      '#F2EDE4',
  bg2:     '#EAE4DA',
  bg3:     '#E1D9CE',
  white:   '#FDFAF5',
  ink:     '#111009',
  ink3:    '#3E3A32',
  ink4:    '#6A6458',
  ink5:    '#9A9488',
  gold:    '#96701A',
  gold2:   '#B8892A',
  gold3:   '#D4A83C',
  goldx:   '#FAF0D8',
  dark:    '#141210',
  dark2:   '#1C1A16',
  border:  '#DDD5C8',
  border2: '#C8BEB0',
} as const;

export const FONT = {
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
  mono:  "'DM Mono', 'Courier New', monospace",
  deva:  "'Noto Sans Devanagari', sans-serif",
} as const;

// ── Nepali date conversion (BS ← AD) ──────────────────────────
// Reference data: AD year → [start_bs_year, [days_in_each_bs_month x12]]
const BS_CALENDAR: Record<number, number[]> = {
  2079: [2079, 31,32,31,32,31,30,30,30,29,29,30,30],
  2080: [2080, 31,32,31,32,31,30,30,30,29,29,30,30],
  2081: [2081, 31,31,32,31,31,31,30,29,30,29,30,30],
  2082: [2082, 31,31,32,32,31,30,30,29,30,29,30,30],
  2083: [2083, 31,32,31,32,31,30,30,30,29,29,30,30],
};

// BS months in Devanagari
export const BS_MONTHS_NP = [
  'बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन',
  'कार्तिक','मंसिर','पौष','माघ','फाल्गुण','चैत्र',
];

// Devanagari digits
const NP_DIGITS = ['०','१','२','३','४','५','६','७','८','९'];
export const toNepaliDigits = (n: number): string =>
  String(n).split('').map(d => NP_DIGITS[parseInt(d)] ?? d).join('');

// English weekdays in Nepali
const EN_WEEKDAYS_NP = ['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'];

export interface NepaliDate {
  year: number;
  month: number;   // 1-based
  day: number;
  monthName: string;
  weekday: string;
  formatted: string; // e.g. "फाल्गुण २७, २०८२"
}

/**
 * Converts a JS Date (AD) to Nepali BS date.
 * Covers 2079–2083 BS (2022–2027 AD approx).
 */
export function adToBs(date: Date): NepaliDate {
  // BS starts ~April 14 each year
  // We use a simplified lookup: count days from known epoch
  const refAD   = new Date(2025, 0, 1); // Jan 1 2025 = Poush 17, 2081
  const refBS   = { year: 2081, month: 9, day: 17 }; // Poush=9 (0-based months)

  const diffDays = Math.floor((date.getTime() - refAD.getTime()) / 86400000);

  let { year, month, day } = refBS;
  let remaining = diffDays;

  const monthDays = (y: number, m: number): number => {
    const row = BS_CALENDAR[y];
    return row ? (row[m] ?? 30) : 30; // m is 1-based index into row
  };

  if (remaining >= 0) {
    // Move forward
    let daysInMonth = monthDays(year, month);
    while (remaining > 0) {
      const left = daysInMonth - day;
      if (remaining <= left) {
        day += remaining;
        remaining = 0;
      } else {
        remaining -= (left + 1);
        day = 1;
        month++;
        if (month > 12) { month = 1; year++; }
        daysInMonth = monthDays(year, month);
      }
    }
  } else {
    // Move backward
    remaining = Math.abs(remaining);
    while (remaining > 0) {
      if (remaining < day) {
        day -= remaining;
        remaining = 0;
      } else {
        remaining -= day;
        month--;
        if (month < 1) { month = 12; year--; }
        day = monthDays(year, month);
      }
    }
  }

  const monthName = BS_MONTHS_NP[month - 1] ?? '';
  const weekday   = EN_WEEKDAYS_NP[date.getDay()] ?? '';
  const formatted = `${monthName} ${toNepaliDigits(day)}, ${toNepaliDigits(year)}`;

  return { year, month, day, monthName, weekday, formatted };
}

// ── Category config ────────────────────────────────────────────
export const CATEGORIES = [
  { value: 'all',         label: 'All Sections', path: '/'             },
  { value: 'real-estate', label: 'Real Estate',  path: '/real-estate'  },
  { value: 'jobs',        label: 'Employment',   path: '/jobs'         },
  { value: 'services',    label: 'Services',     path: '/services'     },
  { value: 'matrimonial', label: 'Matrimonial',  path: '/matrimonial'  },
  { value: 'automobiles', label: 'Automobiles',  path: '/automobiles'  },
  { value: 'notices',     label: 'सूचना',        path: '/notices'      },
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];

export const SECTION_LABEL: Record<string, string> = {
  all:           'Latest Listings',
  'real-estate': 'Real Estate',
  jobs:          'Employment',
  services:      'Services',
  matrimonial:   'Matrimonial',
  automobiles:   'Automobiles',
  notices:       'सूचनाहरू',
};

export const SECTION_DESC: Record<string, string> = {
  all:           'Verified advertisements from across Nepal',
  'real-estate': 'Verified real estate listings across Nepal',
  jobs:          'Verified employment listings',
  services:      'Verified service listings',
  matrimonial:   'Verified matrimonial listings',
  automobiles:   'Verified automobile listings',
  notices:       'Death, celebration & community notices',
};

export type CatKey = 'real-estate' | 'jobs' | 'services' | 'matrimonial' | 'automobiles';

export const CAT_COLORS: Record<CatKey, { bg: string; color: string; border: string }> = {
  'real-estate': { bg: '#F0FAF4', color: '#14532D', border: '#BBF0CE' },
  jobs:          { bg: '#EFF2FF', color: '#1E3A8A', border: '#BFCBFF' },
  services:      { bg: '#F5F0FF', color: '#4C1D95', border: '#DDD6FE' },
  matrimonial:   { bg: '#FFF0F5', color: '#9D174D', border: '#FBCFE8' },
  automobiles:   { bg: '#FFF5EF', color: '#7C2D12', border: '#FDBA74' },
};

export const NOTICE_TABS: { key: string; label: string }[] = [
  { key: '',              label: 'सबै'           },
  { key: 'samvedana',     label: 'समवेदना'       },
  { key: 'shraddhanjali', label: 'श्रद्धाञ्जली' },
  { key: 'bibaha',        label: 'विवाह'         },
  { key: 'graduation',    label: 'उत्तीर्ण'      },
  { key: 'birth',         label: 'जन्म'          },
  { key: 'business',      label: 'व्यापार'       },
];
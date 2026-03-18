// FILE: frontend/src/components/NoticeForm.tsx

import { useState, useEffect } from 'react';
import type { NoticeType, CreateNoticeRequest, Notice } from '../types/index';
import {
  LargeObituaryCard, SmallObituaryCard,
  WeddingCard, GraduationCard, BirthCard, BusinessCard, BratabandhaCard,
} from './NoticeCards';
import PhotoUpload from './PhotoUpload';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const TYPE_META: Record<NoticeType, { label: string; sub: string; price: {  large: number } }> = {
  samvedana:     { label: 'हार्दिक समवेदना',       sub: 'Condolence',   price: {  large: 1000 } },
  shraddhanjali: { label: 'हार्दिक श्रद्धाञ्जली', sub: 'Tribute',      price: { large: 1000  } },
  bibaha:        { label: 'विवाह शुभकामना',         sub: 'Wedding',            price: { large: 1000 } },
  bratabandha:   { label: 'व्रतबन्ध शुभकामना',     sub: 'Bratabandha',        price: { large: 1000 } },
  graduation:    { label: 'उत्तीर्ण शुभकामना',     sub: 'Graduation',         price: { large: 1000 } },
  birth:         { label: 'शिशु जन्म शुभकामना',    sub: 'Birth announcement', price: { large: 1000 } },
  business:      { label: 'व्यापार शुभारम्भ',      sub: 'Business opening',   price: { large: 1000 } },
};

// ── Nepali title suggestions per notice type ──────────────────────────────
const TITLE_SUGGESTIONS: Record<NoticeType, string[]> = {
  samvedana:     ['हार्दिक समवेदना सूचना', 'श्रद्धासुमन अर्पण', 'दुःखद निधन सूचना', 'विनम्र श्रद्धाञ्जली', 'अन्तिम विदाई'],
  shraddhanjali: ['हार्दिक श्रद्धाञ्जली', 'स्मरणाञ्जली सूचना', 'पुण्य स्मरण', 'श्रद्धापूर्वक नमन', 'विनम्र स्मरण'],
  bibaha:        ['विवाह शुभकामना सूचना', 'शुभ विवाह सूचना', 'विवाह समारोह निमन्त्रणा', 'पवित्र विवाह बन्धन', 'शुभ मङ्गल सूचना'],
  bratabandha:   ['व्रतबन्ध शुभकामना', 'शुभ व्रतबन्ध समारोह', 'पवित्र व्रतबन्ध सूचना', 'व्रतबन्ध निमन्त्रणा', 'धार्मिक संस्कार सूचना'],
  graduation:    ['उत्तीर्ण शुभकामना', 'शैक्षिक सफलता सूचना', 'स्नातक उत्तीर्ण सूचना', 'परीक्षा सफलता शुभकामना', 'शैक्षिक उपलब्धि सूचना'],
  birth:         ['शिशु जन्म शुभकामना', 'नवजात शिशु सूचना', 'आनन्दको सूचना', 'नयाँ सदस्यको स्वागत', 'शुभ जन्मोत्सव सूचना'],
  business:      ['व्यापार शुभारम्भ सूचना', 'नयाँ व्यवसाय उद्घाटन', 'व्यापारिक शुभारम्भ', 'व्यवसाय प्रारम्भ सूचना', 'उद्घाटन समारोह सूचना'],
};

// ── BS Calendar data ──────────────────────────────────────────────────────
const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मङ्सिर','पुस','माघ','फाल्गुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];

// BS year range
const BS_YEARS: number[] = [];
for (let y = 1900; y <= 2085; y++) BS_YEARS.push(y);

// Days in each BS month per year (simplified - most months 29-32 days)
// Using standard BS calendar month lengths
const BS_MONTH_DAYS: Record<number, number[]> = {};
// Default: approximate days. Real BS calendar varies yearly but this covers most cases.
for (const y of BS_YEARS) {
  BS_MONTH_DAYS[y] = [31,31,32,32,31,30,30,29,30,29,30,30];
}
// A few known accurate years
BS_MONTH_DAYS[2081] = [31,32,31,32,31,30,30,30,29,30,29,31];
BS_MONTH_DAYS[2082] = [31,31,32,32,31,30,30,30,29,30,29,31];

// Nepali digits
const toNepaliNum = (n: number): string =>
  String(n).split('').map(d => '०१२३४५६७८९'[parseInt(d)]).join('');

// BS to AD conversion (approximate - accurate within ±1 day for most dates)
function bsToAd(year: number, month: number, day: number): string {
  if (!year || !month || !day) return '';
  // Reference: BS 2000/01/01 = AD 1943/04/14
  const bsRef = { year: 2000, month: 1, day: 1 };
  const adRef = new Date(1943, 3, 14); // April 14, 1943

  let totalDays = 0;
  // Count days from BS 2000/1/1 to given BS date
  for (let y = bsRef.year; y < year; y++) {
    const days = BS_MONTH_DAYS[y] ?? [31,31,32,32,31,30,30,29,30,29,30,30];
    totalDays += days.reduce((a, b) => a + b, 0);
  }
  const mDays = BS_MONTH_DAYS[year] ?? [31,31,32,32,31,30,30,29,30,29,30,30];
  for (let m = 1; m < month; m++) totalDays += mDays[m - 1];
  totalDays += day - 1;

  const adDate = new Date(adRef);
  adDate.setDate(adDate.getDate() + totalDays);

  return adDate.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });
}

// AD to BS conversion
function adToBs(adDate: Date): { year: number; month: number; day: number } {
  const adRef = new Date(1943, 3, 14); // BS 2000/01/01
  let totalDays = Math.round((adDate.getTime() - adRef.getTime()) / 86400000);
  let year = 2000;
  while (true) {
    const days = BS_MONTH_DAYS[year] ?? [31,31,32,32,31,30,30,29,30,29,30,30];
    const yearDays = days.reduce((a, b) => a + b, 0);
    if (totalDays < yearDays) break;
    totalDays -= yearDays;
    year++;
  }
  const mDays = BS_MONTH_DAYS[year] ?? [31,31,32,32,31,30,30,29,30,29,30,30];
  let month = 1;
  for (let m = 0; m < 12; m++) {
    if (totalDays < mDays[m]) { month = m + 1; break; }
    totalDays -= mDays[m];
  }
  return { year, month, day: totalDays + 1 };
}

// ── BS Date Picker Component ──────────────────────────────────────────────
interface BSDatePickerProps {
  label: string;
  req?: boolean;
  value: string; // stored as "YYYY/MM/DD" in Nepali digits e.g. "२०५६/०३/१५"
  onChange: (val: string) => void;
  accent: string;
}

function BSDatePicker({ label, req, value, onChange }: BSDatePickerProps) {
  // Parse existing value
  const parseVal = (v: string) => {
    const parts = v.split('/');
    if (parts.length === 3) {
      const toEng = (s: string) => parseInt(s.split('').map(c => '०१२३४५६७८९'.indexOf(c) >= 0 ? '०१२३४५६७८९'.indexOf(c) : parseInt(c)).join(''));
      return { y: toEng(parts[0]), m: toEng(parts[1]), d: toEng(parts[2]) };
    }
    return { y: 0, m: 0, d: 0 };
  };

  const { y: initY, m: initM, d: initD } = parseVal(value);
  const [selYear,  setSelYear]  = useState(initY || 0);
  const [selMonth, setSelMonth] = useState(initM || 0);
  const [selDay,   setSelDay]   = useState(initD || 0);

  const maxDays = selYear && selMonth
    ? (BS_MONTH_DAYS[selYear] ?? [31,31,32,32,31,30,30,29,30,29,30,30])[selMonth - 1]
    : 32;

  useEffect(() => {
    if (selYear && selMonth && selDay) {
      const padNp = (n: number) => String(n).padStart(2,'0').split('').map(d=>'०१२३४५६७८९'[+d]).join('');
      const fmt = `${toNepaliNum(selYear)}/${padNp(selMonth)}/${padNp(selDay)}`;
      onChange(fmt);
    }
  }, [selYear, selMonth, selDay]);

  const adStr = bsToAd(selYear, selMonth, selDay);

  const SEL: React.CSSProperties = {
    border: '1px solid #d1d5db', padding: '7px 6px', fontSize: 12,
    fontFamily: "'Noto Sans Devanagari',sans-serif", outline: 'none',
    background: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#6b7280', marginBottom: 4 }}>
        {label}{req && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 6 }}>
        {/* Year */}
        <select style={SEL} value={selYear || ''} onChange={e => { setSelYear(+e.target.value); setSelDay(0); }}>
          <option value="">वर्ष</option>
          {[...BS_YEARS].reverse().map(y => (
            <option key={y} value={y}>{toNepaliNum(y)} ({y})</option>
          ))}
        </select>
        {/* Month */}
        <select style={SEL} value={selMonth || ''} onChange={e => { setSelMonth(+e.target.value); setSelDay(0); }}>
          <option value="">महिना</option>
          {BS_MONTHS_NP.map((m, i) => (
            <option key={i} value={i + 1}>{m} ({BS_MONTHS_EN[i]})</option>
          ))}
        </select>
        {/* Day */}
        <select style={SEL} value={selDay || ''} onChange={e => setSelDay(+e.target.value)}>
          <option value="">गते</option>
          {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{toNepaliNum(d)}</option>
          ))}
        </select>
      </div>
      {adStr && (
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontStyle: 'italic' }}>
          🗓 AD: {adStr}
        </div>
      )}
    </div>
  );
}

// ── Title Dropdown Component ──────────────────────────────────────────────
function TitleDropdown({ noticeType, value, onChange }: {
  noticeType: NoticeType; value: string; onChange: (v: string) => void;
}) {
  const suggestions = TITLE_SUGGESTIONS[noticeType] ?? [];
  const isCustom = value !== '' && !suggestions.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  const INP2: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box' as const,
    border: '1px solid #d1d5db', padding: '8px 10px', fontSize: 13,
    fontFamily: "'Noto Sans Devanagari',Mukta,sans-serif", outline: 'none',
    borderRadius: 0, background: '#fff',
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#6b7280', marginBottom: 4 }}>
        सूचनाको शीर्षक<span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
      </div>
      <select
        style={{ ...INP2, marginBottom: showCustom ? 6 : 0 }}
        value={showCustom ? '__custom__' : (value || '')}
        onChange={e => {
          if (e.target.value === '__custom__') {
            setShowCustom(true);
            onChange('');
          } else {
            setShowCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">-- शीर्षक छान्नुहोस् --</option>
        {suggestions.map(s => <option key={s} value={s}>{s}</option>)}
        <option value="__custom__">✏ आफैं लेख्नुहोस् (Custom)</option>
      </select>
      {showCustom && (
        <input
          style={INP2}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="नेपालीमा शीर्षक लेख्नुहोस्..."
          autoFocus
        />
      )}
    </div>
  );
}

// ── Event Date Picker (BS↔AD both ways) ──────────────────────────────────
function EventDatePicker({ onChangeBs, onChangeAd }: {
  onChangeBs: (v: string) => void;
  onChangeAd: (v: string) => void;
}) {
  const [mode, setMode] = useState<'bs' | 'ad'>('bs');

  // BS state
  const [bsYear,  setBsYear]  = useState(0);
  const [bsMonth, setBsMonth] = useState(0);
  const [bsDay,   setBsDay]   = useState(0);

  // AD state
  const [adYear,  setAdYear]  = useState('');
  const [adMonth, setAdMonth] = useState('');
  const [adDay,   setAdDay]   = useState('');

  const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const AD_MONTHS_NP = ['जनवरी','फेब्रुअरी','मार्च','अप्रिल','मे','जुन','जुलाई','अगस्ट','सेप्टेम्बर','अक्टोबर','नोभेम्बर','डिसेम्बर'];

  const padNp = (n: number) => String(n).padStart(2,'0').split('').map(d=>'०१२३४५६७८९'[+d]).join('');

  const maxBsDays = bsYear && bsMonth
    ? (BS_MONTH_DAYS[bsYear] ?? [31,31,32,32,31,30,30,29,30,29,30,30])[bsMonth - 1]
    : 32;

  // When BS selected → compute AD
  useEffect(() => {
    if (mode !== 'bs' || !bsYear || !bsMonth || !bsDay) return;
    const bsStr = `${toNepaliNum(bsYear)}/${padNp(bsMonth)}/${padNp(bsDay)}`;
    onChangeBs(bsStr);
    const adStr = bsToAd(bsYear, bsMonth, bsDay);
    onChangeAd(adStr);
  }, [bsYear, bsMonth, bsDay, mode]);

  // When AD selected → compute BS
  useEffect(() => {
    if (mode !== 'ad' || !adYear || !adMonth || !adDay) return;
    const ad = new Date(+adYear, +adMonth - 1, +adDay);
    const adStr = ad.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });
    onChangeAd(adStr);
    const bs = adToBs(ad);
    const bsStr = `${toNepaliNum(bs.year)}/${padNp(bs.month)}/${padNp(bs.day)}`;
    onChangeBs(bsStr);
  }, [adYear, adMonth, adDay, mode]);

  const SEL: React.CSSProperties = {
    border: '1px solid #d1d5db', padding: '7px 6px', fontSize: 12,
    fontFamily: "'Noto Sans Devanagari',sans-serif", outline: 'none',
    background: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' as const,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '6px', border: '1px solid #d1d5db', fontSize: 11,
    fontWeight: 700, cursor: 'pointer', background: active ? '#1a1a1a' : '#f9fafb',
    color: active ? '#fff' : '#6b7280', letterSpacing: '0.05em',
  });

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#6b7280', marginBottom: 6 }}>
        मिति (Date)
      </div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button type="button" style={tabStyle(mode === 'bs')} onClick={() => setMode('bs')}>वि.सं. (BS)</button>
        <button type="button" style={tabStyle(mode === 'ad')} onClick={() => setMode('ad')}>A.D.</button>
      </div>

      {mode === 'bs' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 6 }}>
            <select style={SEL} value={bsYear || ''} onChange={e => { setBsYear(+e.target.value); setBsDay(0); }}>
              <option value="">वर्ष</option>
              {[...BS_YEARS].reverse().map(y => <option key={y} value={y}>{toNepaliNum(y)} ({y})</option>)}
            </select>
            <select style={SEL} value={bsMonth || ''} onChange={e => { setBsMonth(+e.target.value); setBsDay(0); }}>
              <option value="">महिना</option>
              {BS_MONTHS_NP.map((m, i) => <option key={i} value={i+1}>{m} ({BS_MONTHS_EN[i]})</option>)}
            </select>
            <select style={SEL} value={bsDay || ''} onChange={e => setBsDay(+e.target.value)}>
              <option value="">गते</option>
              {Array.from({ length: maxBsDays }, (_, i) => i+1).map(d => <option key={d} value={d}>{toNepaliNum(d)}</option>)}
            </select>
          </div>
          {bsYear && bsMonth && bsDay ? (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontStyle: 'italic' }}>
              🗓 AD: {bsToAd(bsYear, bsMonth, bsDay)}
            </div>
          ) : null}
        </>
      )}

      {mode === 'ad' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 6 }}>
            <select style={SEL} value={adYear} onChange={e => setAdYear(e.target.value)}>
              <option value="">Year</option>
              {Array.from({ length: 130 }, (_, i) => 2086 - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select style={SEL} value={adMonth} onChange={e => { setAdMonth(e.target.value); setAdDay(''); }}>
              <option value="">Month</option>
              {AD_MONTHS.map((m, i) => <option key={i} value={i+1}>{m} ({AD_MONTHS_NP[i]})</option>)}
            </select>
            <select style={SEL} value={adDay} onChange={e => setAdDay(e.target.value)}>
              <option value="">Day</option>
              {Array.from({ length: adYear && adMonth ? new Date(+adYear, +adMonth, 0).getDate() : 31 }, (_, i) => i+1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {adYear && adMonth && adDay ? (() => {
            const bs = adToBs(new Date(+adYear, +adMonth-1, +adDay));
            return (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontStyle: 'italic' }}>
                🗓 वि.सं.: {toNepaliNum(bs.year)}/{String(bs.month).padStart(2,'0').split('').map(d=>'०१२३४५६७८९'[+d]).join('')}/{String(bs.day).padStart(2,'0').split('').map(d=>'०१२३४५६७८९'[+d]).join('')}
              </div>
            );
          })() : null}
        </>
      )}
    </div>
  );
}


const OBITUARY: NoticeType[]    = ['samvedana', 'shraddhanjali'];
const CELEBRATION: NoticeType[] = ['bibaha', 'bratabandha', 'graduation', 'birth', 'business'];
const RELATIONSHIPS = ['छोरा','छोरी','पत्नी','पति','दाजु','भाइ','दिदी','बहिनी','नाती','नातिनी','मित्र','अन्य'];

type Step = 'category' | 'details' | 'legal' | 'preview' | 'done';

type FormState = CreateNoticeRequest & {
  photo_url: string;
  person1_photo_url: string;
  person2_photo_url: string;
};

const EMPTY: FormState = {
  notice_type: 'samvedana', display_size: 'large',
  title: '', body_text: '', published_by: '', contact_phone: '',
  deceased_name: '', deceased_name_en: '', deceased_title: '',
  birth_date_bs: '', death_date_bs: '',
  kriya_text: '', funeral_location: '', funeral_datetime: '',
  photo_url: '',
  person1_name: '', person2_name: '',
  person1_photo_url: '', person2_photo_url: '',
  event_date_bs: '', event_date_ad: '', event_time: '', event_venue: '',
  blessings_from: '',
  advertiser_name: '', advertiser_citizenship: '', advertiser_relationship: '',
  family_consent_agreed: false, terms_agreed: false, is_premium: false,
};

const INP: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid #d1d5db', padding: '8px 10px', fontSize: 13,
  fontFamily: "'Noto Sans Devanagari',Mukta,sans-serif", outline: 'none',
  borderRadius: 0, background: '#fff',
};

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 4 }}>
        {label}{req && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </div>
      {children}
    </div>
  );
}

function BackBtn({ toStep, onBack }: { toStep: Step; onBack: (s: Step) => void }) {
  return (
    <button type="button" onClick={() => onBack(toStep)} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
      ← Back
    </button>
  );
}

function NextBtn({ onClick, disabled, label, accent }: { onClick: () => void; disabled?: boolean; label: string; accent: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      flex: 2, padding: '11px', color: '#fff', fontWeight: 700, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13,
      background: accent, opacity: disabled ? 0.4 : 1,
    }}>
      {label}
    </button>
  );
}

function TypeBtn({ t, selected, accent, isObit, onSelect }: {
  t: NoticeType; selected: boolean; accent: string; isObit: boolean;
  onSelect: (t: NoticeType) => void;
}) {
  return (
    <button type="button" onClick={() => onSelect(t)} style={{
      padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
      border: `2px solid ${selected ? accent : '#e5e7eb'}`,
      background: selected ? (isObit ? '#f5f5f0' : '#fffdf5') : '#fff',
      transition: 'all 0.15s',
    }}>
      <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontWeight: 700, fontSize: 13 }}>{TYPE_META[t].label}</div>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{TYPE_META[t].sub} · Rs {TYPE_META[t].price.large}</div>
    </button>
  );
}

function buildPreview(form: FormState): Notice {
  return {
    id: '0',
    user_id: 0,
    notice_type: form.notice_type as NoticeType,
    notice_status: 'pending',
    display_size: 'large',
    title: form.title ?? '',
    body_text: form.body_text ?? '',
    published_by: form.published_by ?? '',
    contact_phone: form.contact_phone ?? '',
    deceased_name: form.deceased_name ?? '',
    deceased_name_en: form.deceased_name_en ?? '',
    deceased_title: form.deceased_title ?? '',
    birth_date_bs: form.birth_date_bs ?? '',
    death_date_bs: form.death_date_bs ?? '',
    kriya_text: form.kriya_text ?? '',
    funeral_location: form.funeral_location ?? '',
    funeral_datetime: form.funeral_datetime ?? '',
    photo_url: form.photo_url ?? '',
    person1_name: form.person1_name ?? '',
    person2_name: form.person2_name ?? '',
    person1_photo_url: form.person1_photo_url ?? '',
    person2_photo_url: form.person2_photo_url ?? '',
    event_date_bs: form.event_date_bs ?? '',
    event_date_ad: form.event_date_ad ?? '',
    event_time: form.event_time ?? '',
    event_venue: form.event_venue ?? '',
    blessings_from: form.blessings_from ?? '',
    is_premium: form.is_premium ?? false,
    total_cost: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date().toISOString(),
    advertiser_name: '', advertiser_citizenship: '',
    advertiser_id_doc_url: '', death_cert_url: '',
    advertiser_relationship: '', family_consent_agreed: false,
    terms_agreed: false, admin_note: '',
  };
}

function CardPreview({ form }: { form: FormState }) {
  const n = buildPreview(form);
  const t = n.notice_type;
  if (t === 'samvedana' || (t === 'shraddhanjali' && n.display_size === 'large')) return <LargeObituaryCard notice={n} />;
  if (t === 'shraddhanjali') return <SmallObituaryCard notice={n} />;
  if (t === 'bibaha')        return <WeddingCard notice={n} />;
  if (t === 'graduation')    return <GraduationCard notice={n} />;
  if (t === 'birth')         return <BirthCard notice={n} />;
  if (t === 'business')      return <BusinessCard notice={n} />;
  if (t === 'bratabandha')   return <BratabandhaCard notice={n} />;
  return <LargeObituaryCard notice={n} />;
}

interface Props { onClose: () => void; onSuccess?: () => void }

export default function NoticeForm({ onClose, onSuccess }: Props) {
  const [step,        setStep]        = useState<Step>('category');
  const [form,        setForm]        = useState<FormState>({ ...EMPTY });
  const [error,       setError]       = useState('');
  const [busy,        setBusy]        = useState(false);
  const [createdID,   setCreatedID]   = useState<number | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const photosUploading = uploadCount > 0;

  const isObit = OBITUARY.includes(form.notice_type);
  const meta   = TYPE_META[form.notice_type];
  const size   = 'large' as const;
  const cost   = meta.price[size] * (form.is_premium ? 2 : 1);
  const accent = isObit ? '#1a1a1a' : '#b8860b';

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const onUploadStart = () => setUploadCount(c => c + 1);
  const onUploadEnd   = () => setUploadCount(c => c - 1);

  const submit = async () => {
    if (photosUploading) {
      setError('Please wait for the photo upload to finish before submitting.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        notice_type: form.notice_type, display_size: form.display_size,
        title: form.title, body_text: form.body_text,
        published_by: form.published_by, contact_phone: form.contact_phone,
        deceased_name: form.deceased_name, deceased_name_en: form.deceased_name_en,
        deceased_title: form.deceased_title, birth_date_bs: form.birth_date_bs,
        death_date_bs: form.death_date_bs, kriya_text: form.kriya_text,
        funeral_location: form.funeral_location, funeral_datetime: form.funeral_datetime,
        photo_url: form.photo_url,
        person1_name: form.person1_name, person2_name: form.person2_name,
        person1_photo_url: form.person1_photo_url,
        person2_photo_url: form.person2_photo_url,
        event_date_bs: form.event_date_bs, event_date_ad: form.event_date_ad,
        event_time: form.event_time, event_venue: form.event_venue,
        blessings_from: form.blessings_from,
        advertiser_name: form.advertiser_name,
        advertiser_citizenship: form.advertiser_citizenship,
        advertiser_relationship: form.advertiser_relationship,
        family_consent_agreed: form.family_consent_agreed,
        terms_agreed: form.terms_agreed, is_premium: form.is_premium,
      };

      const res = await fetch(`${API}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setCreatedID(data.id ?? null);
      setStep('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => { onSuccess?.(); onClose(); };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#fff', width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', fontFamily: "'Mukta',sans-serif", boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
          <div style={{ background: accent, color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', opacity: 0.7, textTransform: 'uppercase' }}>Flyers · सूचना</div>
              <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, fontWeight: 700, marginTop: 2 }}>{meta.label}</div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 26, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {step !== 'done' && (
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              {(['category','details','legal','preview'] as Step[]).map((s, i) => (
                <div key={s} style={{ flex: 1, padding: '7px 4px', textAlign: 'center', fontSize: 11, fontWeight: 600, background: step === s ? accent : '#f9fafb', color: step === s ? '#fff' : '#9ca3af', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
                  {i+1}. {['Category','Details','Legal','Preview'][i]}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: 22 }}>
            {step === 'category' && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginBottom: 8 }}>🕯 मृत्यु सूचना — Death Notices</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {OBITUARY.map(t => <TypeBtn key={t} t={t} selected={form.notice_type === t} accent={accent} isObit={isObit} onSelect={(t: NoticeType) => set('notice_type', t)} />)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b8860b', marginBottom: 8 }}>🎉 शुभकामना — Celebrations</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {CELEBRATION.map(t => <TypeBtn key={t} t={t} selected={form.notice_type === t} accent={accent} isObit={isObit} onSelect={t => set('notice_type', t)} />)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 8 }}>Display Size</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 20 }}>
                  <button type="button" style={{ padding: '10px 12px', textAlign: 'left', cursor: 'default', border: `2px solid ${accent}`, background: isObit ? '#f5f5f0' : '#fffdf5' }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: 13 }}>Large</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Rs {meta.price['large']} · Full width · Maximum visibility</div>
                  </button>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                  <input type="checkbox" checked={form.is_premium} onChange={e => set('is_premium', e.target.checked)} style={{ accentColor: accent }} />
                  Premium placement (2× cost, shown first) — Rs {cost}
                </label>
                <button type="button" onClick={() => setStep('details')} style={{ width: '100%', padding: '11px', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', background: accent, fontSize: 14 }}>Continue →</button>
              </div>
            )}

            {step === 'details' && (
              <div>
                {isObit && (
                  <>
                    <PhotoUpload label="स्व. को फोटो (Photo)" value={form.photo_url} onChange={url => set('photo_url', url)} onUploadStart={onUploadStart} onUploadEnd={onUploadEnd} folder="flyers/obituary" />
                    <Field label="स्व. नाम (नेपालीमा)" req><input style={INP} value={form.deceased_name} onChange={e => set('deceased_name', e.target.value)} placeholder="वोल कुमारी लामिछाने" /></Field>
                    <Field label="Name in English"><input style={INP} value={form.deceased_name_en} onChange={e => set('deceased_name_en', e.target.value)} placeholder="Bol Kumari Lamichhane" /></Field>
                    <Field label="पद / उपाधि (optional)"><input style={INP} value={form.deceased_title} onChange={e => set('deceased_title', e.target.value)} placeholder="अ.प्रा., सुवेदार, डा. ..." /></Field>
                    {/* ✅ BS Date Pickers with AD auto-convert */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <BSDatePicker label="जन्म मिति वि.सं." req value={form.birth_date_bs ?? ''} onChange={v => set('birth_date_bs', v)} accent={accent} />
                      <BSDatePicker label="स्वर्गारोहण मिति वि.सं." req value={form.death_date_bs ?? ''} onChange={v => set('death_date_bs', v)} accent={accent} />
                    </div>
                    <Field label="अन्तिम संस्कार स्थान"><input style={INP} value={form.funeral_location} onChange={e => set('funeral_location', e.target.value)} placeholder="पशुपति आर्यघाट, काठमाडौं" /></Field>
                    <Field label="अन्तिम संस्कार समय"><input style={INP} value={form.funeral_datetime} onChange={e => set('funeral_datetime', e.target.value)} placeholder="चैत्र १, बिहान ९:०० बजे" /></Field>
                    <Field label="क्रिया विवरण"><textarea style={{ ...INP, height: 60, resize: 'vertical' }} value={form.kriya_text} onChange={e => set('kriya_text', e.target.value)} placeholder="क्रिया स्थान, मिति र अन्य..." /></Field>
                  </>
                )}
                {!isObit && (
                  <>
                    {form.notice_type === 'bibaha' ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <PhotoUpload label="वरको फोटो" value={form.person1_photo_url} onChange={url => set('person1_photo_url', url)} onUploadStart={onUploadStart} onUploadEnd={onUploadEnd} folder="flyers/wedding" />
                          <PhotoUpload label="वधुको फोटो" value={form.person2_photo_url} onChange={url => set('person2_photo_url', url)} onUploadStart={onUploadStart} onUploadEnd={onUploadEnd} folder="flyers/wedding" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <Field label="वरको नाम" req><input style={INP} value={form.person1_name} onChange={e => set('person1_name', e.target.value)} placeholder="अनिल शर्मा" /></Field>
                          <Field label="वधुको नाम" req><input style={INP} value={form.person2_name} onChange={e => set('person2_name', e.target.value)} placeholder="प्रिया थापा" /></Field>
                        </div>
                      </>
                    ) : (
                      <>
                        <PhotoUpload label="फोटो" value={form.person1_photo_url} onChange={url => set('person1_photo_url', url)} onUploadStart={onUploadStart} onUploadEnd={onUploadEnd} folder="flyers/celebration" />
                        <Field label="व्यक्तिको नाम" req><input style={INP} value={form.person1_name} onChange={e => set('person1_name', e.target.value)} placeholder="नाम लेख्नुहोस्" /></Field>
                      </>
                    )}
                    {/* ✅ BS↔AD date picker for celebration events */}
                    <EventDatePicker
                      onChangeBs={v => set('event_date_bs', v)}
                      onChangeAd={v => set('event_date_ad', v)}
                    />
                    <Field label="समय"><input style={INP} value={form.event_time} onChange={e => set('event_time', e.target.value)} placeholder="साँझ ५:०० बजे" /></Field>
                    <Field label="स्थान / Venue"><input style={INP} value={form.event_venue} onChange={e => set('event_venue', e.target.value)} placeholder="होटल याक एण्ड यती, काठमाडौं" /></Field>
                    <Field label="आशीर्वाद दिनुहुनेछ (एक प्रति लाइन)">
                      <textarea style={{ ...INP, height: 72, resize: 'vertical' }} value={form.blessings_from} onChange={e => set('blessings_from', e.target.value)} placeholder={"हरि थापा (बाबु) / लक्ष्मी थापा (आमा)\nरमेश शर्मा (बाबु) / सीता शर्मा (आमा)"} />
                    </Field>
                  </>
                )}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginTop: 4 }}>
                  {/* ✅ Title dropdown with Nepali suggestions */}
                  <TitleDropdown noticeType={form.notice_type} value={form.title} onChange={v => set('title', v)} />
                  <Field label="मुख्य सन्देश" req><textarea style={{ ...INP, height: 110, resize: 'vertical' }} value={form.body_text} onChange={e => set('body_text', e.target.value)} placeholder="नेपालीमा सन्देश लेख्नुहोस्..." /></Field>
                  <Field label="प्रकाशक" req><input style={INP} value={form.published_by} onChange={e => set('published_by', e.target.value)} placeholder="शर्मा परिवार / Sharma Family" /></Field>
                  <Field label="सम्पर्क नम्बर"><input style={INP} value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="98XXXXXXXX" /></Field>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <BackBtn toStep="category" onBack={setStep} />
                  <NextBtn onClick={() => setStep('legal')} disabled={!form.title || !form.body_text || !form.published_by || (isObit && !form.deceased_name)} label="Continue →" accent={accent} />
                </div>
              </div>
            )}

            {step === 'legal' && (
              <div>
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  <strong>Nepal Advertisement Act 2076</strong> — All notices require identity verification.{isObit && ' Death notices additionally require proof of death.'}
                </div>
                <Field label="प्रकाशकको पूरा नाम" req><input style={INP} value={form.advertiser_name} onChange={e => set('advertiser_name', e.target.value)} placeholder="नागरिकतामा भए अनुसार" /></Field>
                <Field label="नागरिकता नम्बर" req><input style={INP} value={form.advertiser_citizenship} onChange={e => set('advertiser_citizenship', e.target.value)} placeholder="XX-XX-XXXXXXXX" /></Field>
                {isObit && (
                  <Field label="मृतकसँग सम्बन्ध" req>
                    <select style={INP} value={form.advertiser_relationship} onChange={e => set('advertiser_relationship', e.target.value)}>
                      <option value="">-- छान्नुहोस् --</option>
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                )}
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '10px 14px', marginBottom: 14, fontSize: 11, color: '#6b7280', lineHeight: 1.7 }}>
                  📎 After submitting, admin will call you at <strong>{form.contact_phone || 'your number'}</strong> to collect: नागरिकता फोटो{isObit ? ' + मृत्यु प्रमाणपत्र' : ''}
                </div>
                {isObit && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.family_consent_agreed} onChange={e => set('family_consent_agreed', e.target.checked)} style={{ marginTop: 2, accentColor: accent }} />
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                      म पुष्टि गर्दछु कि सबै परिवारका सदस्यहरूको सहमति लिइएको छ।
                      <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>I confirm I have consent of all family members.</span>
                    </span>
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.terms_agreed} onChange={e => set('terms_agreed', e.target.checked)} style={{ marginTop: 2, accentColor: accent }} />
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                    म Nepal Advertisement Act 2076 र Flyers Terms & Conditions मान्दछु।
                    <span style={{ display: 'block', fontSize: 11, color: '#9ca3af' }}>I am legally responsible for accuracy.</span>
                  </span>
                </label>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>⚠ {error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <BackBtn toStep="details" onBack={setStep} />
                  <NextBtn onClick={() => { setError(''); setStep('preview'); }} disabled={!form.advertiser_name || !form.advertiser_citizenship || !form.terms_agreed || (isObit && (!form.family_consent_agreed || !form.advertiser_relationship))} label="Preview →" accent={accent} />
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>यही रूपमा प्रकाशित हुनेछ</p>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 20 }}>This is exactly how your notice will appear after admin approval.</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, overflowX: 'auto', padding: '4px 0' }}>
                  <CardPreview form={form} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isObit ? '#f5f5f0' : '#fffdf5', border: `1px solid ${accent}`, padding: '12px 16px', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{meta.label} · Large{form.is_premium ? ' · ★ Premium' : ''}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Payment collected after admin review</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>Rs. {cost.toLocaleString()}</div>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6, marginBottom: 16 }}>⏳ Admin reviews within 2–4 hours. Contacted at <strong>{form.contact_phone || '—'}</strong> for payment + documents.</p>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>⚠ {error}<div style={{ fontSize: 11, marginTop: 4, color: '#6b7280' }}>Backend: <code>{API}</code></div></div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <BackBtn toStep="legal" onBack={setStep} />
                  <button type="button" onClick={submit} disabled={busy || photosUploading} style={{ flex: 2, padding: '12px', color: '#fff', fontWeight: 700, border: 'none', cursor: (busy || photosUploading) ? 'not-allowed' : 'pointer', fontSize: 14, background: accent, opacity: (busy || photosUploading) ? 0.6 : 1 }}>
                    {busy ? 'Submitting...' : photosUploading ? '⏳ Waiting for photo upload...' : '✓ Submit Notice'}
                  </button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{isObit ? '🕯' : '🎉'}</div>
                <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>सूचना पठाइयो!</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Notice submitted — pending admin review.</div>
                {createdID && <div style={{ display: 'inline-block', padding: '8px 20px', background: isObit ? '#f5f5f0' : '#fffdf5', border: `1px solid ${accent}`, fontFamily: 'monospace', fontSize: 13, marginBottom: 16 }}>Notice #{createdID}</div>}
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 22px' }}>
                  You'll be contacted at <strong>{form.contact_phone || '—'}</strong> for payment of <strong>Rs. {cost}</strong> and document collection.
                </p>
                <button type="button" onClick={handleClose} style={{ width: '100%', padding: '12px', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14, background: accent }}>Close</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
// FILE: src/components/LostFoundForm.tsx

import { useState, useRef, useCallback } from 'react';
import { TOKEN, FONT, API } from '@/lib/constants';
import { Label }    from '@/components/ui/label';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge }    from '@/components/ui/badge';

// ── Types ─────────────────────────────────────────────────────────
interface FormState {
  type:        'lost' | 'found';
  title:       string;
  description: string;
  location:    string;
  date_lost:   string;
  phone:       string;
  reward:      string;
  photo_url:   string;
}

const EMPTY: FormState = {
  type: 'lost', title: '', description: '',
  location: '', date_lost: '', phone: '', reward: '', photo_url: '',
};

type Errors = Partial<Record<keyof FormState, string>>;

// ── Static styles ─────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  col:   { display: 'flex', flexDirection: 'column', gap: 0 },
  label: {
    fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: TOKEN.ink4,
    marginBottom: 6, display: 'block',
  },
  hint: { fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, marginTop: 4, display: 'block' },
  err:  { fontFamily: FONT.mono, fontSize: 9, color: '#C0392B', marginTop: 4, display: 'block' },
  req:  { color: '#C0392B', marginLeft: 2 },
};

function errBorder(has: boolean): React.CSSProperties {
  return has ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' } : {};
}

// ── Component ─────────────────────────────────────────────────────
export default function LostFoundForm({
  onSuccess,
}: {
  onClose?:  () => void;
  onSuccess: () => void;
}) {
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [step,       setStep]       = useState<1 | 2>(1);
  const [errors,     setErrors]     = useState<Errors>({});
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');
  const [preview,    setPreview]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback((key: keyof FormState, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => {
      if (!e[key]) return e;
      const n = { ...e }; delete n[key]; return n;
    });
  }, []);

  // ── Validation ────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Errors = {};
    if (!form.title.trim())                  e.title       = 'Please give the item a name';
    if (form.description.trim().length < 20) e.description = 'At least 20 characters required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    const ph = form.phone.trim().replace(/\s/g, '');
    if (!ph) e.phone = 'Contact number is required';
    else if (!/^[9][6-9]\d{8}$/.test(ph) && !/^\+977[6-9]\d{9}$/.test(ph))
      e.phone = 'Enter a valid Nepali mobile (98XXXXXXXX)';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Photo upload ──────────────────────────────────────────────
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadErr('Photo must be under 10 MB'); return; }
    setPreview(URL.createObjectURL(file));
    setUploadErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'flyers/lost-found');
      const res  = await fetch(`${API}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || data.error) { setUploadErr(data.error ?? 'Upload failed'); setPreview(null); }
      else set('photo_url', data.url);
    } catch {
      setUploadErr('Upload failed — check connection'); setPreview(null);
    } finally { setUploading(false); }
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true); setSubmitErr('');
    try {
      const res = await fetch(`${API}/lost-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:        form.type,
          title:       form.title.trim(),
          description: form.description.trim(),
          location:    form.location.trim() || undefined,
          date_lost:   form.date_lost  || undefined,
          phone:       form.phone.trim(),
          reward:      form.reward.trim() || undefined,
          photo_url:   form.photo_url  || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitErr(data.error ?? 'Submission failed'); return; }
      onSuccess();
    } catch { setSubmitErr('Network error — check your connection'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 20px' }}>
        {([1, 2] as const).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT.mono, fontSize: 10, fontWeight: 700,
              background: step >= s ? TOKEN.ink : TOKEN.bg3,
              color: step >= s ? TOKEN.white : TOKEN.ink5,
            }}>{s}</div>
            <span style={{
              fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: step === s ? TOKEN.ink : TOKEN.ink5,
              fontWeight: step === s ? 700 : 400,
            }}>
              {s === 1 ? 'Item Details' : 'Photo & Contact'}
            </span>
            {s < 2 && <div style={{ width: 24, height: 1, background: TOKEN.border2, margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Lost / Found toggle */}
          <div style={S.col}>
            <span style={S.label}>Report type <span style={S.req}>*</span></span>
            <div style={{
              display: 'flex', border: `1px solid ${TOKEN.border2}`,
              borderRadius: 6, overflow: 'hidden',
            }}>
              {(['lost', 'found'] as const).map(t => (
                <button key={t} type="button" onClick={() => set('type', t)} style={{
                  flex: 1, padding: '10px 0',
                  fontFamily: FONT.mono, fontSize: 10,
                  letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
                  border: 'none',
                  borderRight: t === 'lost' ? `1px solid ${TOKEN.border2}` : 'none',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  background: form.type === t ? (t === 'lost' ? '#FEF2F2' : '#F0FDF4') : TOKEN.bg,
                  color:      form.type === t ? (t === 'lost' ? '#991B1B' : '#14532D') : TOKEN.ink4,
                }}>
                  {t === 'lost' ? '🔍  I Lost Something' : '📦  I Found Something'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={S.col}>
            <Label htmlFor="lf-title" style={S.label}>Item name <span style={S.req}>*</span></Label>
            <Input
              id="lf-title" value={form.title} maxLength={120}
              onChange={e => set('title', e.target.value)}
              placeholder={form.type === 'lost'
                ? 'e.g. Black leather wallet, Samsung A54, NID card…'
                : 'e.g. Samsung phone found near New Bus Park…'}
              style={{ height: 40, ...errBorder(!!errors.title) }}
            />
            {errors.title
              ? <span style={S.err}>{errors.title}</span>
              : <span style={S.hint}>{form.title.length}/120 — include brand, colour, model</span>}
          </div>

          {/* Description */}
          <div style={S.col}>
            <Label htmlFor="lf-desc" style={S.label}>Description <span style={S.req}>*</span></Label>
            <Textarea
              id="lf-desc" value={form.description} maxLength={600} rows={4}
              onChange={e => set('description', e.target.value)}
              placeholder={form.type === 'lost'
                ? 'Colour, brand, model, contents, identifying marks. Where and when did you last have it?'
                : 'Where exactly did you find it? When? Condition? Any identifying details?'}
              style={{ resize: 'vertical', fontSize: 13, lineHeight: 1.6, minHeight: 96, ...errBorder(!!errors.description) }}
            />
            {errors.description
              ? <span style={S.err}>{errors.description}</span>
              : <span style={S.hint}>{form.description.length}/600 — minimum 20 characters</span>}
          </div>

          {/* Location */}
          <div style={S.col}>
            <Label htmlFor="lf-location" style={S.label}>
              Location
              <span style={{ ...S.hint, display: 'inline', margin: '0 0 0 6px' }}>(optional)</span>
            </Label>
            <Input
              id="lf-location" value={form.location} maxLength={120}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. New Road Kathmandu, Pokhara Lakeside…"
              style={{ height: 40 }}
            />
            <span style={S.hint}>Area, landmark or city</span>
          </div>

          {/* Date */}
          <div style={S.col}>
            <Label htmlFor="lf-date" style={S.label}>
              Date {form.type === 'lost' ? 'lost' : 'found'}
              <span style={{ ...S.hint, display: 'inline', margin: '0 0 0 6px' }}>(optional)</span>
            </Label>
            <Input
              id="lf-date" type="date" value={form.date_lost}
              onChange={e => set('date_lost', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ height: 40, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button type="button" onClick={() => { if (validateStep1()) setStep(2); }}
              className="rounded-none"
              style={{
                background: TOKEN.ink, color: TOKEN.white,
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '10px 24px', height: 'auto',
              }}>
              Next: Photo & Contact →
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Photo */}
          <div style={S.col}>
            <span style={S.label}>
              Photo
              <span style={{ ...S.hint, display: 'inline', margin: '0 0 0 6px' }}>(optional — strongly recommended)</span>
            </span>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `1px dashed ${uploadErr ? '#ef4444' : TOKEN.border2}`,
                borderRadius: 6, background: TOKEN.bg, cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: preview ? 0 : '32px 16px',
                position: 'relative', overflow: 'hidden',
                minHeight: preview ? 160 : 'auto',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = TOKEN.bg2}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = TOKEN.bg}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview"
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '6px 10px', background: 'rgba(0,0,0,0.55)',
                    fontFamily: FONT.mono, fontSize: 8, color: '#fff',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    {uploading ? '⟳ Uploading…' : '✓ Uploaded — click to change'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, opacity: 0.25 }}>📷</div>
                  <div style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 700, color: TOKEN.ink }}>
                    {uploading ? 'Uploading…' : 'Tap to add a photo'}
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5 }}>
                    JPG · PNG · WebP · max 10 MB
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }} onChange={handlePhoto} />
            {uploadErr
              ? <span style={S.err}>{uploadErr}</span>
              : !preview && <span style={S.hint}>A clear photo dramatically increases chances of recovery</span>}
          </div>

          {/* Phone */}
          <div style={S.col}>
            <Label htmlFor="lf-phone" style={S.label}>Contact number <span style={S.req}>*</span></Label>
            <Input
              id="lf-phone" type="tel" value={form.phone} maxLength={14}
              onChange={e => set('phone', e.target.value)}
              placeholder="98XXXXXXXX"
              style={{ height: 40, letterSpacing: '0.04em', ...errBorder(!!errors.phone) }}
            />
            {errors.phone
              ? <span style={S.err}>{errors.phone}</span>
              : <span style={S.hint}>Nepali mobile — shown publicly on your post</span>}
          </div>

          {/* Reward (lost only) */}
          {form.type === 'lost' && (
            <div style={S.col}>
              <Label htmlFor="lf-reward" style={S.label}>
                Reward offered
                <span style={{ ...S.hint, display: 'inline', margin: '0 0 0 6px' }}>(optional)</span>
              </Label>
              <Input
                id="lf-reward" value={form.reward} maxLength={80}
                onChange={e => set('reward', e.target.value)}
                placeholder="e.g. Rs. 1,000 cash reward"
                style={{ height: 40 }}
              />
              <span style={S.hint}>Leave blank if no reward</span>
            </div>
          )}

          {/* Summary */}
          <div style={{
            padding: '12px 14px', background: TOKEN.bg,
            border: `1px solid ${TOKEN.border}`, borderRadius: 6,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Badge style={{
              background: form.type === 'lost' ? '#FEF2F2' : '#F0FDF4',
              color:      form.type === 'lost' ? '#991B1B' : '#14532D',
              border:     `1px solid ${form.type === 'lost' ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: 3, fontFamily: FONT.mono, fontSize: 8,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              fontWeight: 700, padding: '2px 8px', flexShrink: 0,
            }}>
              {form.type}
            </Badge>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: FONT.serif, fontSize: 13, fontWeight: 700, color: TOKEN.ink,
                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {form.title || '—'}
              </div>
              {(form.location || form.date_lost) && (
                <div style={{ fontFamily: FONT.mono, fontSize: 9, color: TOKEN.ink5, marginTop: 3 }}>
                  {form.location || ''}{form.location && form.date_lost ? ' · ' : ''}
                  {form.date_lost ? new Date(form.date_lost).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </div>
              )}
            </div>
          </div>

          {submitErr && (
            <div style={{
              padding: '10px 14px', background: '#FEF2F2',
              border: '1px solid #FECACA', borderRadius: 4,
              fontFamily: FONT.mono, fontSize: 10, color: '#991B1B',
            }}>
              {submitErr}
            </div>
          )}

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
            <button type="button"
              onClick={() => { setStep(1); setSubmitErr(''); }}
              style={{
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: TOKEN.ink4,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
              ← Back
            </button>
            <Button type="button" onClick={handleSubmit}
              disabled={submitting || uploading} className="rounded-none"
              style={{
                background: TOKEN.ink, color: TOKEN.white,
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '10px 28px', height: 'auto',
                opacity: submitting || uploading ? 0.6 : 1,
              }}>
              {submitting ? 'Submitting…' : `Submit ${form.type === 'lost' ? 'Lost' : 'Found'} Report`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
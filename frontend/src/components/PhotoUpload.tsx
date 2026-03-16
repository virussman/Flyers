// FILE: frontend/src/components/PhotoUpload.tsx
// Standalone reusable photo upload component
// Uploads to /upload endpoint → stores Cloudinary URL in form state

import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface Props {
  label: string;
  value: string;        // current URL (empty = no photo)
  onChange: (url: string) => void;
  onUploadStart?: () => void;  // ✅ NEW: called when upload begins
  onUploadEnd?: () => void;    // ✅ NEW: called when upload finishes (success or fail)
  folder?: string;      // Cloudinary folder e.g. "flyers/obituary"
  shape?: 'circle' | 'square';
}

export default function PhotoUpload({ label, value, onChange, onUploadStart, onUploadEnd, folder = 'flyers/notices', shape = 'circle' }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  const handleFile = async (file: File) => {
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    onUploadStart?.();  // ✅ notify parent upload has started

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      onChange(data.url);        // store Cloudinary URL in form
      setPreview(data.url);      // switch preview to Cloudinary URL
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      onChange('');              // clear on failure
    } finally {
      setUploading(false);
      onUploadEnd?.();           // ✅ notify parent upload is done (always)
    }
  };

  const isCircle = shape === 'circle';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Preview */}
        <div
          onClick={() => !uploading && ref.current?.click()}
          style={{
            width: 72, height: 72,
            borderRadius: isCircle ? '50%' : 4,
            border: `2px dashed ${error ? '#ef4444' : '#8b6914'}`,
            cursor: uploading ? 'wait' : 'pointer',
            background: '#f5f0e0',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative',
          }}
        >
          {preview ? (
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          ) : (
            <span style={{ fontSize: 28, opacity: 0.4 }}>👤</span>
          )}

          {/* Uploading overlay */}
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* Uploaded checkmark */}
          {!uploading && preview && !error && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              background: '#059669', borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{
              padding: '6px 14px', border: '1px solid #8b6914', background: '#fffef9',
              color: '#8b6914', fontSize: 12, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading...' : preview ? '🔄 Change Photo' : '📷 फोटो छान्नुहोस्'}
          </button>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
            JPG / PNG · max 10MB
          </div>
          {error && (
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>⚠ {error}</div>
          )}
        </div>
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
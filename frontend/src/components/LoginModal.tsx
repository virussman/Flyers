import { useState, useRef, useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'phone' | 'otp' | 'name';

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [step, setStep]       = useState<Step>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [devOtp, setDevOtp]   = useState(''); // shown in dev mode
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Focus first OTP box when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  if (!open) return null;

  const handleSendOTP = async () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/send-otp', { phone });
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp);
      setStep('otp');
      setResendTimer(60);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) {
      // Auto-submit when all 6 digits entered
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code?: string) => {
    const finalCode = code || otp.join('');
    if (finalCode.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, code: finalCode, name });
      login(res.data.token, res.data.user);
      if (!res.data.user.name) {
        setStep('name');
      } else {
        onSuccess?.();
        handleClose();
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) { onSuccess?.(); handleClose(); return; }
    try {
      await api.patch('/auth/me/name', { name });
    } catch {}
    onSuccess?.();
    handleClose();
  };

  const handleClose = () => {
    setStep('phone'); setPhone(''); setOtp(['','','','','','']);
    setName(''); setError(''); setDevOtp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-sm mx-4 shadow-2xl">
        {/* Top rule */}
        <div className="h-[3px] bg-stone-900" />

        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-3xl font-black text-stone-900 leading-none">
              Flyers<span className="text-stone-300 font-light">.</span>
            </h1>
            <p className="text-[11px] text-stone-400 font-mono tracking-widest uppercase mt-1">
              {step === 'phone' ? 'Sign in or create account' :
               step === 'otp'   ? `OTP sent to +977 ${phone}` :
               'One last thing'}
            </p>
          </div>

          {/* ── Step 1: Phone ── */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase text-stone-400 block mb-1.5">
                  Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-stone-50 border border-r-0 border-stone-200 text-sm font-mono text-stone-500 shrink-0">
                    +977
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    className="flex-1 border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 font-mono"
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-700 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Sending…' : 'Send OTP →'}
              </button>
              <p className="text-[11px] text-stone-400 text-center">
                New users are registered automatically
              </p>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <div className="space-y-5">
              {/* Dev OTP hint */}
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-center">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-amber-700 mb-0.5">Dev Mode — Your OTP</p>
                  <p className="font-mono text-2xl font-black text-amber-800 tracking-[0.3em]">{devOtp}</p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase text-stone-400 block mb-3 text-center">
                  Enter 6-digit code
                </label>
                {/* OTP boxes */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      className={`w-11 h-12 text-center text-xl font-mono font-bold border-2 focus:outline-none transition-colors ${
                        digit ? 'border-stone-900 bg-stone-50' : 'border-stone-200 focus:border-stone-500'
                      }`}
                    />
                  ))}
                </div>
                {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
              </div>

              <button
                onClick={() => handleVerifyOTP()}
                disabled={loading || otp.some(d => !d)}
                className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-700 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}
                  className="text-stone-400 hover:text-stone-700 transition-colors"
                >
                  ← Change number
                </button>
                {resendTimer > 0 ? (
                  <span className="text-stone-400 font-mono">Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={handleSendOTP} className="text-stone-700 font-semibold hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Name (new users) ── */}
          {step === 'name' && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600 text-center">
                Welcome! What should we call you?
              </p>
              <div>
                <label className="text-[11px] font-bold tracking-widest uppercase text-stone-400 block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveName}
                className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-700 transition-colors"
              >
                Continue →
              </button>
              <button
                onClick={() => { onSuccess?.(); handleClose(); }}
                className="w-full text-xs text-stone-400 hover:text-stone-700 transition-colors py-1"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { login, user, isLoggedIn } = useAuth();
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (open) {
      setStatus('');
      setIsProcessing(false);
      initialized.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (isLoggedIn && open && !isProcessing) {
      setStatus(`Welcome ${user?.name}!`);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    }
  }, [isLoggedIn, open, isProcessing, user, onClose, onSuccess]);

  if (!open) return null;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (initialized.current || isProcessing) return;
    initialized.current = true;
    setIsProcessing(true);
    
    try {
      const res = await api.post('/auth/google', {
        id_token: credentialResponse.credential,
      });
      
      const { token, user: userData } = res.data;
      login(token, userData);
      setStatus(`Welcome ${userData.name}!`);
      
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1200);
      
    } catch (e: any) {
      setStatus(`Error: ${e?.response?.data?.error || 'Login failed'}`);
      setIsProcessing(false);
      initialized.current = false;
    }
  };

  const handleManualLogin = () => {
    if (isProcessing) return;
    const testToken = prompt("Type 'test' to simulate login:");
    if (testToken === 'test') {
      setIsProcessing(true);
      login('mock-jwt-token', { 
        id: 999, 
        name: "Test User", 
        email: "test@example.com",
        role: "user",
        phone: "",
        is_verified: true
      });
    }
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(17,16,9,0.6)', backdropFilter: 'blur(4px)' }} 
        onClick={!isProcessing ? onClose : undefined} 
      />
      
      <div style={{ 
        position: 'relative', background: '#fff', 
        width: '100%', maxWidth: 400, margin: '0 16px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
      }}>
        <div style={{ height: 4, background: '#C8A464' }} />
        
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 900, fontSize: 42, color: '#111009',
            lineHeight: 1, marginBottom: 8
          }}>
            Flyers<span style={{ color: '#C8A464', fontWeight: 400 }}>.</span>
          </div>
          
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#9A9488',
            marginBottom: 32
          }}>
            Sign in to continue
          </div>

          {!isLoggedIn && (
            <button
              onClick={handleManualLogin}
              disabled={isProcessing}
              style={{ 
                marginBottom: 16, 
                padding: '10px 20px',
                background: isProcessing ? '#F3F4F6' : '#FEF3C7',
                border: '1px solid #F59E0B',
                borderRadius: 4,
                color: '#92400E',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              🧪 [DEV] Test Login (Bypass Google)
            </button>
          )}

          {!isLoggedIn && (
            <div style={{ 
              display: 'flex', justifyContent: 'center', 
              marginBottom: 20, minHeight: 40,
              opacity: isProcessing ? 0.5 : 1,
            }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setStatus('Google sign-in failed');
                  setIsProcessing(false);
                }}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
              />
            </div>
          )}

          {status && (
            <div style={{
              padding: '12px 16px', borderRadius: 4,
              background: status.includes('Error') ? '#FEF2F2' : '#F0FDF4',
              color: status.includes('Error') ? '#991B1B' : '#166534',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              marginBottom: 16
            }}>
              {status}
            </div>
          )}

          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, color: '#9A9488', margin: 0
          }}>
            New users are registered automatically
          </p>
        </div>
      </div>
    </div>
  );
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminPanel from './pages/AdminPanel.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      {isAdmin ? <AdminPanel /> : <App />}
    </AuthProvider>
  </StrictMode>,
)
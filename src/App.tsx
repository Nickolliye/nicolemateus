import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only" style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 99999, background: 'var(--color-wine)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', transform: 'translateY(-100%)' }}
        onFocus={(e) => (e.currentTarget.style.transform = 'translateY(0)') }
        onBlur={(e) => (e.currentTarget.style.transform = 'translateY(-100%)')}
      >
        Ir para o conteudo principal
      </a>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const base = import.meta.env.BASE_URL || '/';

  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Preencha o e-mail e a senha.'); return; }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? 'E-mail ou senha incorretos.' : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-wine)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 20%, rgba(112,47,59,0.5) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          background: 'var(--color-ivory)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-2xl)',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.35s ease both',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.2em',
              color: 'var(--color-marsala)',
              lineHeight: 1,
            }}
          >
            N & M
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.6875rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--color-gray-text)',
              marginTop: '0.375rem',
            }}
          >
            Area dos noivos
          </div>
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'var(--color-beige)',
              margin: '1.25rem auto 0',
            }}
            aria-hidden="true"
          />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.375rem',
            color: 'var(--color-wine)',
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)',
            fontWeight: 400,
          }}
        >
          Bem-vindos, noivos
        </h1>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }} role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="form-label" htmlFor="admin-email">
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-gray-text)',
                }}
                aria-hidden="true"
              />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <label className="form-label" htmlFor="admin-password">
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-gray-text)',
                }}
                aria-hidden="true"
              />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha segura"
                autoComplete="current-password"
                required
                aria-required="true"
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-gray-text)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.75rem', color: 'var(--color-gray-text)' }}>
          Acesso restrito aos noivos.{' '}
          <a href="/" style={{ color: 'var(--color-marsala)' }}>Voltar ao site</a>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </main>
  );
}

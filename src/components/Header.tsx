import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`} role="banner">
      <div className="header__inner">
        <Link to="/" className="header__brand" aria-label="Nicole e Mateus - Página inicial">
          <div className="header__monogram">N & M</div>
          <div className="header__names">Nicole & Mateus</div>
        </Link>

        <nav className="header__nav" aria-label="Navegação principal">
          <a href="#como-funciona" onClick={(e) => { e.preventDefault(); scrollTo('como-funciona'); }}>
            Como funciona
          </a>
          <a href="#presentes" onClick={(e) => { e.preventDefault(); scrollTo('presentes'); }}>
            Presentes
          </a>
        </nav>

        <button
          className="header__admin-btn"
          onClick={() => navigate('/admin')}
          aria-label="Acessar área dos noivos"
        >
          <Lock size={13} strokeWidth={1.5} />
          Área dos noivos
        </button>
      </div>
    </header>
  );
}

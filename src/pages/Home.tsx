import { Heart, Gift, ArrowDown, Package, CheckCircle } from 'lucide-react';
import { GiftCatalog } from '../components/GiftCatalog';

export function Home() {
  const scrollToCatalog = () => {
    document.getElementById('presentes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main id="main-content">
      {/* ── HERO ── */}
      <section className="hero" aria-label="Bem-vindo a lista de presentes de Nicole e Mateus">
        <div className="hero__bg" aria-hidden="true" />

        <div className="hero__content animate-slide-up">
          <div className="hero__eyebrow" aria-hidden="true">
            Nicole & Mateus &middot; 13.12.2026
          </div>
          <h1 className="hero__title">
            Um novo lar, muitos sonhos e presentes cheios de carinho.
          </h1>
          <p className="hero__text">
            Estamos preparando nosso cantinho com muito amor. Nesta lista, voce encontra
            alguns dos itens que farao parte da nossa casa e pode nos contar qual deles gostaria
            de nos presentear. Cada gesto sera recebido com imensa gratidao.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={scrollToCatalog}
            aria-label="Ir para a lista de presentes"
          >
            <Gift size={18} strokeWidth={2} />
            Ver lista de presentes
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              color: 'var(--color-gray-text)',
              fontSize: '0.8125rem',
              letterSpacing: '0.05em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={scrollToCatalog}
            aria-hidden="true"
          >
            <ArrowDown size={14} strokeWidth={2} />
            Como funciona
          </button>
        </div>

        <div className="hero__image" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&auto=format&fit=crop"
            alt="Cozinha elegante com louças e decoração sofisticada"
            loading="eager"
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="section section-alt" aria-label="Como funciona a lista de presentes">
        <div className="container">
          <div className="section-header">
            <h2>Como funciona?</h2>
            <p>
              Simples e sem complicacao. Em tres passos, voce ja nos avisa qual presente
              esta preparando com tanto carinho.
            </p>
          </div>

          <div className="steps-grid" role="list">
            <div className="step-card" role="listitem">
              <div className="step-icon" aria-hidden="true">
                <Gift size={28} strokeWidth={1.5} />
              </div>
              <div className="step-number" aria-hidden="true">Passo 1</div>
              <h3 className="step-title">Escolha um presente</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Navegue pela lista e escolha o que mais combina com o seu carinho por nos.
              </p>
            </div>

            <div className="step-card" role="listitem">
              <div className="step-icon" aria-hidden="true">
                <Heart size={28} strokeWidth={1.5} />
              </div>
              <div className="step-number" aria-hidden="true">Passo 2</div>
              <h3 className="step-title">Informe seu nome</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Nos conte quem esta preparando esse presente especial. Assim ja ficamos de olho!
              </p>
            </div>

            <div className="step-card" role="listitem">
              <div className="step-icon" aria-hidden="true">
                <Package size={28} strokeWidth={1.5} />
              </div>
              <div className="step-number" aria-hidden="true">Passo 3</div>
              <h3 className="step-title">Entregue o presente</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Traga o presente pessoalmente quando nos encontrarmos ou na recepcao do casamento.
              </p>
            </div>
          </div>

          <div
            className="alert alert-info"
            style={{ maxWidth: '640px', margin: 'var(--spacing-2xl) auto 0', borderRadius: 'var(--radius-lg)' }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0, color: 'var(--color-marsala)' }} />
            <span>
              <strong>Importante:</strong> Ao informar seu nome, voce esta registrando a <em>intencao</em> de nos presentear
              com este item. O presente e entregue pessoalmente &mdash; nao ha compra pelo site.
            </span>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <GiftCatalog />
    </main>
  );
}

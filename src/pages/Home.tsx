import { Heart, Gift, Package, CheckCircle } from 'lucide-react';
import { GiftCatalog } from '../components/GiftCatalog';

export function Home() {
  return (
    <main id="main-content">
      {/* ── HOW IT WORKS (ABERTURA DIRETA) ── */}
      <section id="como-funciona" className="section section-alt" aria-label="Como funciona a lista de presentes">
        <div className="container">
          <div className="section-header">
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-marsala)',
                marginBottom: '0.75rem',
              }}
            >
              Nicole &amp; Mateus &middot; 13.12.2026
            </div>
            <h2>Como funciona?</h2>
            <p>
              Estamos preparando nosso cantinho com muito amor. Em três passos simples,
              você nos avisa qual presente escolheu para nos abençoar:
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
                Navegue pelo catálogo abaixo e selecione o item com o qual gostaria de nos presentear.
              </p>
            </div>

            <div className="step-card" role="listitem">
              <div className="step-icon" aria-hidden="true">
                <Heart size={28} strokeWidth={1.5} />
              </div>
              <div className="step-number" aria-hidden="true">Passo 2</div>
              <h3 className="step-title">Informe seu nome</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Clique em &quot;Quero presentear&quot; e informe seu nome e a quantidade para garantir o item na lista.
              </p>
            </div>

            <div className="step-card" role="listitem">
              <div className="step-icon" aria-hidden="true">
                <Package size={28} strokeWidth={1.5} />
              </div>
              <div className="step-number" aria-hidden="true">Passo 3</div>
              <h3 className="step-title">Entregue com carinho</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Compre o item onde preferir e nos entregue pessoalmente ou no dia da celebração.
              </p>
            </div>
          </div>

          <div
            className="alert alert-info"
            style={{ maxWidth: '640px', margin: 'var(--spacing-2xl) auto 0', borderRadius: 'var(--radius-lg)' }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0, color: 'var(--color-marsala)' }} />
            <span>
              <strong>Importante:</strong> Este site serve para organizar e reservar as intenções de presentes físicos.
              Não realizamos vendas ou cobranças por aqui &mdash; a compra e entrega são feitas diretamente por você.
            </span>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <GiftCatalog />
    </main>
  );
}

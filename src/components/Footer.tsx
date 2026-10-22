export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div>
          <div className="footer__monogram">N & M</div>
          <div className="footer__names">Nicole & Mateus</div>
        </div>

        <div className="footer__divider" role="separator" />

        <p className="footer__quote" aria-label="Mensagem dos noivos">
          "Mais do que presentes, guardaremos o carinho de cada pessoa que faz parte da nossa historia."
        </p>

        <div className="footer__leaves" aria-hidden="true">
          <span>&#10022;</span>
          <span>&#10022;</span>
          <span>&#10022;</span>
        </div>

        <div className="footer__details">
          <span>13 de dezembro de 2026</span>
          <span aria-hidden="true">&#183;</span>
          <span>Espaco Belluno, Aparecida de Goiania</span>
        </div>

        <p style={{ fontSize: '0.6875rem', color: 'rgba(232,221,205,0.4)', marginTop: '0.5rem' }}>
          Lista de presentes fisicos &mdash; Nicole & Mateus &copy; 2026
        </p>
      </div>
    </footer>
  );
}

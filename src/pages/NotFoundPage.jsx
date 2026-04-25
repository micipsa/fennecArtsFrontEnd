import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h2 style={{ fontSize: '4rem', color: 'var(--couleur-primaire)' }}>404</h2>
      <p style={{ fontSize: '1.2rem', margin: '1rem 0', color: 'var(--couleur-texte-clair)' }}>
        Cette page n'existe pas.
      </p>
      <Link to="/" className="btn btn-primaire">
        Retour à l'accueil
      </Link>
    </div>
  );
}
export default NotFoundPage;
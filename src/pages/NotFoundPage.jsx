import { Link } from "react-router-dom";

// Cette page s'affichera quand aucune route ne correspond à l'URL.
function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", paddingTop: "4rem" }}>
      <h2>404 — Page introuvable</h2>
      <p>La page que tu cherches n'existe pas.</p>
      <Link to="/" style={{ color: "#e94560", fontWeight: "bold" }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFoundPage;

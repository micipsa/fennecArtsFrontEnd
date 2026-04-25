import { Outlet } from "react-router-dom";

// MainLayout est la structure visuelle partagée par toutes les pages.
// <Outlet /> est l'emplacement réservé où React Router affichera
// le composant de la page correspondant à l'URL actuelle.
function MainLayout() {
  return (
    <div>
      <header
        style={{ background: "#1a1a2e", color: "white", padding: "1rem 2rem" }}>
        <h1>Fennec Arts</h1>
      </header>

      <main style={{ minHeight: "80vh", padding: "2rem" }}>
        <Outlet />
      </main>

      <footer
        style={{
          background: "#1a1a2e",
          color: "white",
          padding: "1rem 2rem",
          textAlign: "center",
        }}>
        <p>© 2024 Fennec Arts Platform</p>
      </footer>
    </div>
  );
}

export default MainLayout;

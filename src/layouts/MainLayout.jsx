/**
 * MainLayout — layout principal de la partie publique du site.
 *
 * Ce composant structure la mise en page visible par tous les visiteurs :
 * - En haut : la barre de navigation (Navbar)
 * - Au milieu : le contenu de la page courante (<Outlet /> de React Router)
 * - En bas : le pied de page (Footer)
 *
 * <Outlet /> est un composant spécial de React Router qui rend
 * automatiquement le composant enfant correspondant à la route active.
 * Par exemple, si l'URL est "/articles", <Outlet /> affichera <ArticlesPage />.
 */
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import styles from "./MainLayout.module.css";

function MainLayout() {
  return (
    <div className={styles.wrapper}>
      {/* Barre de navigation persistante en haut de chaque page */}
      <Navbar />

      {/* Zone de contenu principal — rendu dynamique selon la route */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Pied de page persistant en bas */}
      <Footer />
    </div>
  );
}

export default MainLayout;

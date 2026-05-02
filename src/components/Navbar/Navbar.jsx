import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useWebTV from "../../hooks/useWebTV";
import CommandPalette from "../UI/CommandPalette";
import AvatarMenu from "../UI/AvatarMenu";
import NotifCloche from "../UI/NotifCloche";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const { utilisateur, deconnecter } = useAuth();
  const { estEnLive } = useWebTV();
  const [paletteOuverte, setPaletteOuverte] = useState(false);
  const [menuMobile, setMenuMobile] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOuverte(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDeconnexion = () => {
    deconnecter();
    setMenuMobile(false);
    navigate("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.inner}>

          <Link to="/" className={styles.logo} onClick={() => setMenuMobile(false)}>
            <img src="/fennekagelogo.png" alt="Fennec's Clan" className={styles.logoImg} />
          </Link>

          <ul className={styles.nav}>
            <li><NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>Accueil</NavLink></li>
            <li><NavLink to="/articles" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>Articles</NavLink></li>
            <li><NavLink to="/events" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>Événements</NavLink></li>
            <li><NavLink to="/tournaments" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>Tournois</NavLink></li>
            <li>
              <NavLink to="/webtv" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}>
                WebTV {estEnLive && <span className={styles.badgeLive} />}
              </NavLink>
            </li>
          </ul>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setPaletteOuverte(true)} aria-label="Recherche / Commandes">
              <span className={styles.iconLoupe}>🔍</span>
              <span className={styles.kbdHint}>⌘K</span>
            </button>

            {utilisateur ? (
              <>
                <NotifCloche />
                <AvatarMenu utilisateur={utilisateur} onDeconnexion={handleDeconnexion} />
              </>
            ) : (
              <Link to="/login" className={styles.btnConnexion}>Connexion</Link>
            )}

            <button className={styles.burger} onClick={() => setMenuMobile(!menuMobile)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {menuMobile && (
          <div className={styles.menuMobile}>
            <NavLink to="/" end onClick={() => setMenuMobile(false)}>🏠 Accueil</NavLink>
            <NavLink to="/articles" onClick={() => setMenuMobile(false)}>📰 Articles</NavLink>
            <NavLink to="/tournaments" onClick={() => setMenuMobile(false)}>🏆 Tournois</NavLink>
            <NavLink to="/events" onClick={() => setMenuMobile(false)}>📅 Événements</NavLink>
            <NavLink to="/webtv" onClick={() => setMenuMobile(false)}>📺 WebTV</NavLink>
            <NavLink to="/missions" onClick={() => setMenuMobile(false)}>🎯 Missions</NavLink>
            <NavLink to="/classement" onClick={() => setMenuMobile(false)}>🏅 Classement</NavLink>
            <NavLink to="/communaute" onClick={() => setMenuMobile(false)}>👥 Communauté</NavLink>
            <NavLink to="/store" onClick={() => setMenuMobile(false)}>🛒 Store</NavLink>
            {!utilisateur && <Link to="/login" onClick={() => setMenuMobile(false)}>🔑 Connexion</Link>}
          </div>
        )}
      </nav>

      <CommandPalette ouvert={paletteOuverte} onFermer={() => setPaletteOuverte(false)} />
    </>
  );
}

export default Navbar;

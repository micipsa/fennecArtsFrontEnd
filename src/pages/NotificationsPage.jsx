import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import styles from "./NotificationsPage.module.css";

const TYPE_CONFIG = {
  tournoi: { icon: "⚔️", color: "#3182ce" },
  mission: { icon: "📋", color: "#38b2ac" },
  rang: { icon: "🏅", color: "#d69e2e" },
  badge: { icon: "🏆", color: "#f6ad55" },
  commentaire: { icon: "💬", color: "#805ad5" },
  evenement: { icon: "📅", color: "#e53e3e" },
  info: { icon: "ℹ️", color: "#4299e1" },
  boutique: { icon: "🛒", color: "#48bb78" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState("toutes"); // toutes | non_lues

  const charger = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setChargement(false); }
  }, []);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        charger();
      }
    };
    run();
    return () => {
      actif = false;
    };
  }, [charger]);

  const marquerLu = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/lire`);
      setNotifs(notifs.map(n => n._id === id ? { ...n, lu: true } : n));
    } catch (err) { console.error(err); }
  };

  const toutMarquerLu = async () => {
    try {
      await api.patch("/api/notifications/lire-tout");
      setNotifs(notifs.map(n => ({ ...n, lu: true })));
    } catch (err) { console.error(err); }
  };

  const nonLues = notifs.filter(n => !n.lu).length;
  const liste = filtre === "non_lues" ? notifs.filter(n => !n.lu) : notifs;

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  if (chargement) return <Spinner />;

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.entete}>
          <div>
            <h1 className={styles.titre}>Notifications</h1>
            <p className={styles.sousTitre}>
              {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}` : "Tout est lu ✓"}
            </p>
          </div>
          {nonLues > 0 && (
            <button className={styles.btnToutLire} onClick={toutMarquerLu}>
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className={styles.filtres}>
          <button
            className={`${styles.filtre} ${filtre === "toutes" ? styles.filtreActif : ""}`}
            onClick={() => setFiltre("toutes")}
          >
            Toutes ({notifs.length})
          </button>
          <button
            className={`${styles.filtre} ${filtre === "non_lues" ? styles.filtreActif : ""}`}
            onClick={() => setFiltre("non_lues")}
          >
            Non lues ({nonLues})
          </button>
        </div>

        {/* Liste */}
        {liste.length === 0 ? (
          <div className={styles.vide}>
            <span className={styles.videIcone}>🔔</span>
            <p>{filtre === "non_lues" ? "Aucune notification non lue." : "Aucune notification pour le moment."}</p>
          </div>
        ) : (
          <div className={styles.liste}>
            {liste.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: "📢", color: "#666" };
              return (
                <div
                  key={n._id}
                  className={`${styles.notif} ${!n.lu ? styles.nonLue : ""} ${!n.lu && n.type === "mission" ? styles.missionNonLue : ""}`}
                  onClick={() => !n.lu && marquerLu(n._id)}
                >
                  <div className={styles.notifIcone} style={{ background: `${cfg.color}22`, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <div className={styles.notifCorps}>
                    <div className={styles.notifEntete}>
                      <h3 className={styles.notifTitre}>{n.titre}</h3>
                      <span className={styles.notifDate}>{formatDate(n.createdAt)}</span>
                    </div>
                    <p className={styles.notifMessage}>{n.message}</p>
                    {n.lien && (
                      <Link to={n.lien} className={styles.notifLien}>
                        Voir →
                      </Link>
                    )}
                  </div>
                  {!n.lu && <div className={styles.notifDot} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

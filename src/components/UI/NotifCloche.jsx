import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./NotifCloche.module.css";

function NotifCloche() {
  const [notifs, setNotifs] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [vibrerCloche, setVibrerCloche] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const nonLues = notifs.filter((n) => !n.lu).length;

  const charger = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications");
      const nouvelles = res.data.data;
      setNotifs((prev) => {
        const ancMissions = prev.filter((n) => n.type === "mission" && !n.lu).map((n) => n._id);
        const nouvelleMission = nouvelles.some((n) => n.type === "mission" && !n.lu && !ancMissions.includes(n._id));
        if (nouvelleMission) {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          setVibrerCloche(true);
          setTimeout(() => setVibrerCloche(false), 1500);
        }
        return nouvelles;
      });
    } catch (e) {
      console.error("Erreur lors de la récupération des notifications", e);
    }
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
    const interval = setInterval(() => {
      if (actif) {
        charger();
      }
    }, 60000);
    return () => {
      actif = false;
      clearInterval(interval);
    };
  }, [charger]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOuvert(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marquerToutLu = async () => {
    await api.patch("/api/notifications/lire-tout");
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const clicNotif = async (notif) => {
    if (!notif.lu) {
      await api.patch(`/api/notifications/${notif._id}/lire`);
      setNotifs((prev) => prev.map((n) => n._id === notif._id ? { ...n, lu: true } : n));
    }
    setOuvert(false);
    if (notif.lien) navigate(notif.lien);
  };

  const ICONES = { tournoi: "⚔️", mission: "🎯", rang: "📈", badge: "🏅", commentaire: "💬", evenement: "📅" };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={`${styles.cloche} ${vibrerCloche ? styles.clocheVibrer : ""}`} onClick={() => setOuvert((v) => !v)} aria-label="Notifications">
        🔔
        {nonLues > 0 && <span className={styles.badge}>{nonLues}</span>}
      </button>
      {ouvert && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.headerTitre}>Notifications</span>
            {nonLues > 0 && (
              <button className={styles.toutLu} onClick={marquerToutLu}>Tout lire</button>
            )}
          </div>
          <div className={styles.liste}>
            {notifs.length === 0 ? (
              <p className={styles.vide}>Aucune notification</p>
            ) : (
              notifs.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className={`${styles.item} ${!n.lu ? styles.nonLu : ""} ${!n.lu && n.type === "mission" ? styles.missionNonLu : ""}`}
                  onClick={() => clicNotif(n)}>
                  <span className={styles.icone}>{ICONES[n.type] || "📌"}</span>
                  <div className={styles.contenu}>
                    <span className={styles.titre}>{n.titre}</span>
                    <span className={styles.message}>{n.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            className={styles.voirTout}
            onClick={() => { setOuvert(false); navigate("/notifications"); }}
          >
            Voir toutes les notifications →
          </button>
        </div>
      )}
    </div>
  );
}

export default NotifCloche;

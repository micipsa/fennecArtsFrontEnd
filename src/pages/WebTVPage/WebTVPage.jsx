import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../../services/api";
import styles from "./WebTVPage.module.css";

function WebTVPage() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [videoSelectionnee, setVideoSelectionnee] = useState(null);
  const [chaineSelectionnee, setChaineSelectionnee] = useState("toutes");

  const charger = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/webtv`);
      setData(res.data);
    } catch (e) {
      setErreur("Impossible de charger la WebTV.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
    const intervalle = setInterval(charger, 5 * 60 * 1000);
    return () => clearInterval(intervalle);
  }, []);

  // Extrait les noms de chaînes uniques depuis les vidéos
  const chaines = useMemo(() => {
    if (!data?.videos) return [];
    const noms = [...new Set(data.videos.map((v) => v.snippet.channelTitle))];
    return noms;
  }, [data]);

  // Filtre les vidéos selon la chaîne sélectionnée
  const videosFiltrees = useMemo(() => {
    if (!data?.videos) return [];
    if (chaineSelectionnee === "toutes") return data.videos;
    return data.videos.filter(
      (v) => v.snippet.channelTitle === chaineSelectionnee,
    );
  }, [data, chaineSelectionnee]);

  if (chargement) {
    return (
      <div className={styles.centrer}>
        <p>Chargement de la WebTV...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className={styles.centrer}>
        <p>{erreur}</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.noiseOverlay} />

      <div className={styles.pageEntete}>
        <span className={styles.liveBadge}>BROADCAST</span>
        <h1 className={styles.pageTitre}>WEBTV</h1>
        <p className={styles.pageSousTitre}>&gt;&gt;&gt; ON AIR &lt;&lt;&lt;</p>
      </div>

      <div className={styles.contenu}>
        {data.estEnLive ? (
          <div className={styles.zoneLive}>
            <div className={styles.badgeLive}>
              <span className={styles.pulsation} />
              EN DIRECT
            </div>
            <div className={styles.iframeWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${data.liveId}?autoplay=1`}
                title="Live Fennec Arts"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </div>
        ) : (
          <div className={styles.pasDeLive}>
            <span>📡</span>
            <p>Aucun live en cours — retrouvez nos replays ci-dessous</p>
          </div>
        )}

        {videoSelectionnee && (
          <div className={styles.zonePlayer}>
            <div className={styles.playerEntete}>
              <h2 className={styles.titreSection}>▶ En lecture</h2>
              <button
                className={styles.btnFermer}
                onClick={() => setVideoSelectionnee(null)}>
                ✕ Fermer
              </button>
            </div>
            <div className={styles.iframeWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${videoSelectionnee}?autoplay=1`}
                title="Lecture vidéo"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </div>
        )}

        <div className={styles.filtresEntete}>
          <h2 className={styles.titreSection}>Dernières vidéos</h2>
          <div className={styles.filtres}>
            <button
              className={`${styles.filtreBouton} ${chaineSelectionnee === "toutes" ? styles.filtreActif : ""}`}
              onClick={() => setChaineSelectionnee("toutes")}>
              Toutes
            </button>
            {chaines.map((nom) => (
              <button
                key={nom}
                className={`${styles.filtreBouton} ${chaineSelectionnee === nom ? styles.filtreActif : ""}`}
                onClick={() => setChaineSelectionnee(nom)}>
                {nom}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grille}>
          {videosFiltrees.map((video) => (
            <button
              key={video.id.videoId}
              className={styles.carte}
              onClick={() => {
                try { api.post("/api/quetes/action", { action: "video_vue" }); } catch (e) {}
                setVideoSelectionnee(video.id.videoId);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}>
              <div className={styles.thumbWrapper}>
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className={styles.thumb}
                />
                <div className={styles.overlay}>▶</div>
              </div>
              <div className={styles.info}>
                <p className={styles.titreVideo}>
                  {video.snippet.title.replace(/&#39;/g, "'")}
                </p>
                <span className={styles.chaine}>
                  {video.snippet.channelTitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WebTVPage;

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./WebTVPage.module.css";

function WebTVPage() {
  const [data, setData] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

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
    <div className={styles.page}>
      <div className="container">
        <div className={styles.entete}>
          <h1 className={styles.titre}>
            📺 Web<span className={styles.accent}>TV</span>
          </h1>
          <p className={styles.sousTitre}>
            Lives, replays et contenus gaming des chaînes Fennec Arts
          </p>
        </div>

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

        <h2 className={styles.titreSection}>Dernières vidéos</h2>
        <div className={styles.grille}>
          {data.videos.map((video) => (
            <a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.carte}>
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
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WebTVPage;

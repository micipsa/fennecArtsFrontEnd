import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import styles from "./ProfilPublicPage.module.css";

function ProfilPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [membre, setMembre] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`/api/users/profil-public/${id}`)
      .then((r) => setMembre(r.data.data))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <Spinner />;
  if (!membre) return <div className="container"><p>Membre introuvable.</p><Link to="/classement">← Classement</Link></div>;

  const rang = calculerRang(membre.points || 0);
  const initiale = (membre.nom || "?")[0].toUpperCase();
  const dateInscription = new Date(membre.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="container">
      <div className={styles.page}>
        <button onClick={() => navigate(-1)} className={styles.retourBtn}>← Retour</button>
        <div className={styles.carte}>
          <div className={styles.avatar} style={{ background: rang.couleur }}>{initiale}</div>
          <h1 className={styles.nom}>{membre.nom}</h1>
          <div className={styles.rangNom} style={{ color: rang.couleur }}>{rang.affichage}</div>
          <p className={styles.meta}>Membre depuis {dateInscription}</p>

          {membre.tags?.length > 0 && (
            <div className={styles.tagsListe}>
              {membre.tags.map((t) => (
                <span key={t._id} className={styles.tag} style={{ backgroundColor: t.couleur }}>{t.nom}</span>
              ))}
            </div>
          )}

          {membre.badges?.length > 0 && (
            <div className={styles.badgesListe}>
              {membre.badges.map((b) => (
                <div key={b._id} className={styles.badgeItem} title={b.description}>
                  <span className={styles.badgeIcone}>{b.icone}</span>
                  <span className={styles.badgeNom}>{b.nom}</span>
                </div>
              ))}
            </div>
          )}

          {membre.participationsTournois?.length > 0 && (
            <div className={styles.tournois}>
              <h3 className={styles.sousTitre}>Tournois joués ({membre.participationsTournois.length})</h3>
              {membre.participationsTournois.map((p, i) => (
                <div key={i} className={styles.tournoiItem}>
                  <span>{p.titreTournoi}</span>
                  {p.position && <span className={styles.position}>{p.position}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilPublicPage;

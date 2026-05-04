import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import styles from "./SaisonsPage.module.css";

const STATUT_CONFIG = {
  en_cours: { label: "En cours", color: "#2ecc71", icon: "🔥" },
  a_venir: { label: "À venir", color: "#3498db", icon: "📅" },
  terminee: { label: "Terminée", color: "#7f8c8d", icon: "🏁" },
};

export default function SaisonsPage() {
  const [saisons, setSaisons] = useState([]);
  const [classementActuel, setClassementActuel] = useState(null);
  const [saisonActive, setSaisonActive] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [onglet, setOnglet] = useState("classement"); // classement | historique

  useEffect(() => {
    const charger = async () => {
      try {
        const [resSaisons, resClassement] = await Promise.all([
          api.get("/api/saisons"),
          api.get("/api/saisons/classement-actuel"),
        ]);
        setSaisons(resSaisons.data.data);
        setClassementActuel(resClassement.data.data.classement);
        setSaisonActive(resClassement.data.data.saison);
      } catch (err) { console.error(err); }
      finally { setChargement(false); }
    };
    charger();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const joursRestants = (dateFin) => {
    const diff = Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (chargement) return <Spinner />;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>SAISONS</h1>
        <p className={styles.pageSousTitre}>Compétitions saisonnières</p>
      </div>

      <div className={styles.contenu}>
        {/* ── Saison active ── */}
        {saisonActive ? (
          <div className={styles.saisonActive}>
            <div className={styles.saisonActiveBanner}>
              <div className={styles.saisonActiveInfo}>
                <span className={styles.saisonBadge}>🔥 SAISON EN COURS</span>
                <h2 className={styles.saisonActiveNom}>{saisonActive.nom}</h2>
                {saisonActive.description && <p className={styles.saisonActiveDesc}>{saisonActive.description}</p>}
                <div className={styles.saisonDates}>
                  <span>{formatDate(saisonActive.dateDebut)} → {formatDate(saisonActive.dateFin)}</span>
                  <span className={styles.joursRestants}>{joursRestants(saisonActive.dateFin)} jours restants</span>
                </div>
              </div>
              <div className={styles.saisonRecompenses}>
                <h4>🏆 Récompenses</h4>
                <div className={styles.recompGrille}>
                  <div className={styles.recompItem}><span>🥇 Top 1</span><strong>{saisonActive.recompenses?.top1?.fm || 500} FM</strong></div>
                  <div className={styles.recompItem}><span>🥈 Top 3</span><strong>{saisonActive.recompenses?.top3?.fm || 250} FM</strong></div>
                  <div className={styles.recompItem}><span>🏅 Top 10</span><strong>{saisonActive.recompenses?.top10?.fm || 100} FM</strong></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.pasDeSaison}>
            <span className={styles.pasDeSaisonIcone}>📅</span>
            <h2>Aucune saison en cours</h2>
            <p>La prochaine saison sera annoncée bientôt. Reste à l'affût !</p>
          </div>
        )}

        {/* ── Onglets ── */}
        <div className={styles.onglets}>
          <button className={`${styles.onglet} ${onglet === "classement" ? styles.ongletActif : ""}`} onClick={() => setOnglet("classement")}>
            🏅 Classement saisonnier
          </button>
          <button className={`${styles.onglet} ${onglet === "historique" ? styles.ongletActif : ""}`} onClick={() => setOnglet("historique")}>
            📜 Historique des saisons
          </button>
        </div>

        {/* ── Classement live ── */}
        {onglet === "classement" && (
          <div className={styles.section}>
            {!classementActuel || classementActuel.length === 0 ? (
              <div className={styles.vide}>
                <p>Aucun classement disponible pour le moment.</p>
                <p className={styles.videHint}>Gagne des XP en participant aux activités !</p>
              </div>
            ) : (
              <div className={styles.classement}>
                {classementActuel.map((entry, i) => {
                  const rang = calculerRang(entry.utilisateur.points || 0);
                  const medaille = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${entry.position}`;
                  const initiale = (entry.utilisateur.nom || "?")[0].toUpperCase();
                  return (
                    <Link to={`/membres/${entry.utilisateur._id}`} key={entry.utilisateur._id} className={`${styles.classementItem} ${i < 3 ? styles.classementTop : ""}`}>
                      <span className={`${styles.classementPos} ${i < 3 ? styles.posTop : ""}`}>{medaille}</span>
                      <div className={styles.classementAvatar} style={{ background: rang.couleur }}>{initiale}</div>
                      <div className={styles.classementInfo}>
                        <span className={styles.classementNom}>{entry.utilisateur.nom}</span>
                        <span className={styles.classementRang} style={{ color: rang.couleur }}>{rang.nom}</span>
                      </div>
                      <div className={styles.classementStats}>
                        <span className={styles.classementXP}>{entry.pointsSaison} XP</span>
                        <span className={styles.classementActions}>{entry.actions} actions</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Historique des saisons ── */}
        {onglet === "historique" && (
          <div className={styles.section}>
            {saisons.length === 0 ? (
              <div className={styles.vide}><p>Aucune saison enregistrée.</p></div>
            ) : (
              <div className={styles.historiqueGrille}>
                {saisons.map(s => {
                  const cfg = STATUT_CONFIG[s.statut] || STATUT_CONFIG.a_venir;
                  return (
                    <div key={s._id} className={`${styles.saisonCard} ${s.statut === "en_cours" ? styles.saisonCardActive : ""}`}>
                      <div className={styles.saisonCardEntete}>
                        <span className={styles.saisonNumero}>S{s.numero}</span>
                        <span className={styles.saisonStatut} style={{ color: cfg.color, borderColor: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <h3 className={styles.saisonCardNom}>{s.nom}</h3>
                      <p className={styles.saisonCardDates}>
                        {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                      </p>
                      {s.classementFinal?.length > 0 && (
                        <div className={styles.saisonCardPodium}>
                          {s.classementFinal.slice(0, 3).map((e, i) => (
                            <span key={i} className={styles.podiumItem}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {e.utilisateur?.nom || "?"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

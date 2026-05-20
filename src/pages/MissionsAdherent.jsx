// ============================================================================
// MissionsAdherent.jsx — Vue adhérent : voir les missions et s'inscrire
// ============================================================================
import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import styles from "./MissionsAdherent.module.css";

const STATUT_LABELS = {
  ouverte: "Inscriptions ouvertes",
  fermee: "Inscriptions fermées",
  terminee: "Terminée",
};

const CRENEAU_LABELS = {
  matin: "Matin",
  soir: "Soir",
  journee: "Journée complète",
};

export default function MissionsAdherent() {
  const { utilisateur } = useContext(AuthContext);

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Mission sélectionnée pour voir les postes
  const [missionActive, setMissionActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Inscription en cours
  const [inscLoading, setInscLoading] = useState({}); // { posteId: bool }

  // ── Chargement de la liste ──────────────────────────────────────────────────
  const chargerMissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/missions");
      setMissions(res.data.data);
    } catch {
      setErreur("Impossible de charger les missions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      chargerMissions();
    }, 0);
  }, []);

  // ── Chargement du détail d'une mission ─────────────────────────────────────
  const ouvrirMission = async (id) => {
    try {
      setDetailLoading(true);
      setMissionActive(null);
      const res = await api.get(`/api/missions/${id}`);
      setMissionActive(res.data.data);
    } catch {
      alert("Impossible de charger cette mission.");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Vérifier si l'adhérent est déjà inscrit sur un poste ───────────────────
  const estInscrit = (poste) => {
    const userId = utilisateur?.id || utilisateur?._id;
    if (!userId) return false;
    return poste.inscriptions.some(
      (i) =>
        (i.utilisateur?._id || i.utilisateur) === userId
    );
  };

  // ── S'inscrire sur un poste ─────────────────────────────────────────────────
  const sInscrire = async (posteId, creneau) => {
    try {
      setInscLoading((s) => ({ ...s, [posteId]: true }));
      await api.post(
        `/api/missions/${missionActive._id}/postes/${posteId}/inscrire`,
        { creneau },
      );
      // Recharger le détail pour avoir les résumés à jour
      await ouvrirMission(missionActive._id);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setInscLoading((s) => ({ ...s, [posteId]: false }));
    }
  };

  // ── Se désinscrire d'un poste ───────────────────────────────────────────────
  const seDesinscrire = async (posteId) => {
    if (!confirm("Se désinscrire de ce poste ?")) return;
    try {
      setInscLoading((s) => ({ ...s, [posteId]: true }));
      await api.delete(
        `/api/missions/${missionActive._id}/postes/${posteId}/inscrire`,
      );
      await ouvrirMission(missionActive._id);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la désinscription.");
    } finally {
      setInscLoading((s) => ({ ...s, [posteId]: false }));
    }
  };

  // ── Créneaux disponibles pour un poste ─────────────────────────────────────
  // Retourne les créneaux qui ont encore au moins une place libre
  const creneauxDisponibles = (poste) => {
    const disponibles = [];

    for (let numero = 1; numero <= poste.nombrePlaces; numero++) {
      const inscrits = poste.inscriptions.filter(
        (i) => i.numeroPlace === numero,
      );
      const aJournee = inscrits.some((i) => i.creneau === "journee");
      const aMatin = inscrits.some((i) => i.creneau === "matin");
      const aSoir = inscrits.some((i) => i.creneau === "soir");

      if (!aJournee && !aMatin && !aSoir) {
        // Place totalement libre → journee possible
        if (!disponibles.includes("journee")) disponibles.push("journee");
        if (!disponibles.includes("matin")) disponibles.push("matin");
        if (!disponibles.includes("soir")) disponibles.push("soir");
        break; // une place libre suffit
      }
      if (!aJournee && !aMatin && !disponibles.includes("matin"))
        disponibles.push("matin");
      if (!aJournee && !aSoir && !disponibles.includes("soir"))
        disponibles.push("soir");
    }

    return disponibles;
  };

  // ── Rendu ───────────────────────────────────────────────────────────────────
  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (erreur) return <div className={styles.erreur}>{erreur}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>Missions bénévoles</h1>
      <p className={styles.sousTitre}>
        Participe aux événements de l'association en t'inscrivant sur un poste.
      </p>

      {missions.length === 0 ? (
        <p className={styles.vide}>Aucune mission disponible pour le moment.</p>
      ) : (
        <div className={styles.grille}>
          {missions.map((mission) => (
            <div
              key={mission._id}
              className={`${styles.carte} ${missionActive?._id === mission._id ? styles.carteActive : ""}`}
              onClick={() => ouvrirMission(mission._id)}>
              {mission.imageUrl && (
                <img
                  src={mission.imageUrl}
                  alt={mission.titre}
                  className={styles.carteImage}
                />
              )}
              <div className={styles.carteBody}>
                <span
                  className={`${styles.badge} ${styles[`badge_${mission.statut}`]}`}>
                  {STATUT_LABELS[mission.statut] ?? mission.statut}
                </span>
                <h2 className={styles.carteTitre}>{mission.titre}</h2>
                <div className={styles.carteMeta}>
                  <span>
                    📅 {new Date(mission.dateDebut).toLocaleDateString("fr-FR")}
                  </span>
                  {mission.lieu && <span>📍 {mission.lieu}</span>}
                  <span>🧩 {mission.postes?.length ?? 0} poste(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Détail mission ── */}
      {detailLoading && (
        <p className={styles.loading}>Chargement de la mission...</p>
      )}

      {missionActive && !detailLoading && (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <div>
              <h2 className={styles.detailTitre}>{missionActive.titre}</h2>
              <div className={styles.detailMeta}>
                <span>
                  📅{" "}
                  {new Date(missionActive.dateDebut).toLocaleDateString(
                    "fr-FR",
                  )}{" "}
                  →{" "}
                  {new Date(missionActive.dateFin).toLocaleDateString("fr-FR")}
                </span>
                {missionActive.lieu && <span>📍 {missionActive.lieu}</span>}
              </div>
            </div>
            <button
              className={styles.btnFermer}
              onClick={() => setMissionActive(null)}>
              ✕
            </button>
          </div>

          <div className={styles.description}>{missionActive.description}</div>

          {missionActive.statut !== "ouverte" && (
            <div className={styles.alerteFermee}>
              {missionActive.statut === "fermee"
                ? "Les inscriptions sont fermées pour cette mission."
                : "Cette mission est terminée."}
            </div>
          )}

          <h3 className={styles.postestitre}>Postes disponibles</h3>

          <div className={styles.postesGrille}>
            {(missionActive.postes || []).map((poste) => {
              const dejaInscrit = estInscrit(poste);
              const disponibles = creneauxDisponibles(poste);
              const complet = disponibles.length === 0;
              const peutInscrire =
                missionActive.statut === "ouverte" && !dejaInscrit && !complet;

              return (
                <div
                  key={poste._id}
                  className={`${styles.posteCard} ${dejaInscrit ? styles.posteInscrit : ""} ${complet && !dejaInscrit ? styles.posteComplet : ""}`}>
                  <div className={styles.posteNom}>{poste.nom}</div>

                  {/* Jauge de remplissage */}
                  <div className={styles.jauge}>
                    <div
                      className={styles.jaugeBar}
                      style={{
                        width: `${(poste.resume.pris / poste.resume.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className={styles.jaugeLabel}>
                    {poste.resume.libres} slot(s) libre(s) sur{" "}
                    {poste.resume.total}
                  </p>

                  {/* Inscrit → bouton désinscription */}
                  {dejaInscrit && (
                    <div className={styles.inscritSection}>
                      <span className={styles.tagInscrit}>✓ Inscrit</span>
                      {missionActive.statut !== "terminee" && (
                        <button
                          className={styles.btnDesinscrire}
                          disabled={inscLoading[poste._id]}
                          onClick={() => seDesinscrire(poste._id)}>
                          {inscLoading[poste._id] ? "..." : "Se désinscrire"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Complet → message */}
                  {complet && !dejaInscrit && (
                    <p className={styles.tagComplet}>Complet</p>
                  )}

                  {/* Peut s'inscrire → boutons créneaux */}
                  {peutInscrire && (
                    <div className={styles.creneauxBtns}>
                      {["matin", "soir", "journee"].map((c) =>
                        disponibles.includes(c) ? (
                          <button
                            key={c}
                            className={`${styles.btnCreneau} ${styles[`btnCreneau_${c}`]}`}
                            disabled={inscLoading[poste._id]}
                            onClick={() => sInscrire(poste._id, c)}>
                            {inscLoading[poste._id] ? "..." : CRENEAU_LABELS[c]}
                          </button>
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

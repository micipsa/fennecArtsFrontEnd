// ============================================================================
// DashboardMissions.jsx — Gestion des missions internes (admin)
// ============================================================================
import { useState, useEffect } from "react";
import api from "../services/api";
import styles from "./DashboardMissions.module.css";

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUTS = ["brouillon", "ouverte", "fermee", "terminee"];
const STATUT_LABELS = {
  brouillon: "Brouillon",
  ouverte: "Ouverte",
  fermee: "Fermée",
  terminee: "Terminée",
};

const FORM_INITIAL = {
  titre: "",
  description: "",
  dateDebut: "",
  dateFin: "",
  lieu: "",
  statut: "brouillon",
  imageUrl: "",
  pointsRecompense: 0,
  fmRecompense: 0,
  postes: [],
};

const POSTE_INITIAL = { nom: "", nombrePlaces: 1 };

// ── Composant principal ───────────────────────────────────────────────────────
export default function DashboardMissions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Formulaire création / édition
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_INITIAL);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Détail mission (liste des inscriptions)
  const [detailMission, setDetailMission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal affectation manuelle
  const [modalAffect, setModalAffect] = useState(null); // { missionId, posteId, posteNom }
  const [affectForm, setAffectForm] = useState({
    creneau: "matin",
    nomExterne: "",
    utilisateurId: "",
  });
  const [affectLoading, setAffectLoading] = useState(false);

  // ── Chargement des missions ─────────────────────────────────────────────────
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
    // Utiliser un timeout pour éviter le "setState synchronously" d'ESLint
    setTimeout(() => {
      chargerMissions();
    }, 0);
  }, []);

  // ── Chargement du détail ────────────────────────────────────────────────────
  const ouvrirDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/api/missions/${id}`);
      setDetailMission(res.data.data);
    } catch {
      alert("Impossible de charger le détail.");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Formulaire ──────────────────────────────────────────────────────────────
  const ouvrirCreation = () => {
    setForm(FORM_INITIAL);
    setEditId(null);
    setShowForm(true);
  };

  const ouvrirEdition = (mission) => {
    setForm({
      titre: mission.titre,
      description: mission.description,
      dateDebut: mission.dateDebut?.slice(0, 16),
      dateFin: mission.dateFin?.slice(0, 16),
      lieu: mission.lieu || "",
      statut: mission.statut,
      imageUrl: mission.imageUrl || "",
      pointsRecompense: mission.pointsRecompense || 0,
      fmRecompense: mission.fmRecompense || 0,
      postes: (mission.postes || []).map((p) => ({
        _id: p._id,
        nom: p.nom,
        nombrePlaces: p.nombrePlaces,
      })),
    });
    setEditId(mission._id);
    setShowForm(true);
  };

  const fermerForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleChamp = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Gestion des postes dans le formulaire
  const ajouterPoste = () =>
    setForm((f) => ({ ...f, postes: [...f.postes, { ...POSTE_INITIAL }] }));

  const modifierPoste = (index, champ, valeur) =>
    setForm((f) => {
      const postes = [...f.postes];
      postes[index] = { ...postes[index], [champ]: valeur };
      return { ...f, postes };
    });

  const supprimerPoste = (index) =>
    setForm((f) => ({
      ...f,
      postes: f.postes.filter((_, i) => i !== index),
    }));

  const soumettre = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload = {
        ...form,
        imageUrl: form.imageUrl || null,
        lieu: form.lieu || null,
      };
      if (editId) {
        await api.put(`/api/missions/${editId}`, payload);
      } else {
        await api.post("/api/missions", payload);
      }
      fermerForm();
      chargerMissions();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Suppression ─────────────────────────────────────────────────────────────
  const supprimerMission = async (id) => {
    if (!confirm("Supprimer cette mission ?")) return;
    try {
      await api.delete(`/api/missions/${id}`);
      chargerMissions();
      if (detailMission?._id === id) setDetailMission(null);
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  // ── Affectation manuelle ────────────────────────────────────────────────────
  const ouvrirAffectation = (missionId, posteId, posteNom) => {
    setModalAffect({ missionId, posteId, posteNom });
    setAffectForm({ creneau: "matin", nomExterne: "", utilisateurId: "" });
  };

  const soumettreAffectation = async (e) => {
    e.preventDefault();
    try {
      setAffectLoading(true);
      const payload = { creneau: affectForm.creneau };
      if (affectForm.utilisateurId)
        payload.utilisateurId = affectForm.utilisateurId;
      else payload.nomExterne = affectForm.nomExterne;

      await api.post(
        `/api/missions/${modalAffect.missionId}/postes/${modalAffect.posteId}/affecter`,
        payload,
      );
      setModalAffect(null);
      ouvrirDetail(modalAffect.missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'affectation.");
    } finally {
      setAffectLoading(false);
    }
  };

  // ── Suppression d'une inscription ───────────────────────────────────────────
  const supprimerInscription = async (missionId, posteId, inscriptionId) => {
    if (!confirm("Retirer cette inscription ?")) return;
    try {
      await api.delete(
        `/api/missions/${missionId}/postes/${posteId}/inscriptions/${inscriptionId}`,
      );
      ouvrirDetail(missionId);
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  // ── Rendu ───────────────────────────────────────────────────────────────────
  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (erreur) return <div className={styles.erreur}>{erreur}</div>;

  return (
    <div className={styles.container}>
      {/* ── En-tête ── */}
      <div className={styles.header}>
        <h1 className={styles.titre}>Missions</h1>
        <button className={styles.btnCreer} onClick={ouvrirCreation}>
          + Nouvelle mission
        </button>
      </div>

      {/* ── Tableau des missions ── */}
      {missions.length === 0 ? (
        <p className={styles.vide}>Aucune mission pour l'instant.</p>
      ) : (
        <div className={styles.tableau}>
          <div className={styles.tableauHeader}>
            <span>Titre</span>
            <span>Date</span>
            <span>Statut</span>
            <span>Récompenses</span>
            <span>Postes</span>
            <span>Actions</span>
          </div>
          {missions.map((m) => (
            <div key={m._id} className={styles.tableauLigne}>
              <span className={styles.cellTitre}>{m.titre}</span>
              <span className={styles.cellDate}>
                {new Date(m.dateDebut).toLocaleDateString("fr-FR")}
              </span>
              <span>
                <span
                  className={`${styles.badge} ${styles[`badge_${m.statut}`]}`}>
                  {STATUT_LABELS[m.statut]}
                </span>
              </span>
              <span className={styles.cellRecompense}>
                {m.pointsRecompense || 0} XP | {m.fmRecompense || 0} FM
              </span>
              <span className={styles.cellPostes}>
                {m.postes?.length ?? 0} poste(s)
              </span>
              <span className={styles.cellActions}>
                <button
                  className={styles.btnDetail}
                  onClick={() => ouvrirDetail(m._id)}>
                  Détail
                </button>
                <button
                  className={styles.btnEdit}
                  onClick={() => ouvrirEdition(m)}>
                  Modifier
                </button>
                <button
                  className={styles.btnSuppr}
                  onClick={() => supprimerMission(m._id)}>
                  Supprimer
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Panel détail mission ── */}
      {detailMission && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h2>{detailMission.titre}</h2>
            <button
              className={styles.btnFermer}
              onClick={() => setDetailMission(null)}>
              ✕
            </button>
          </div>

          <p className={styles.detailDescription}>
            {detailMission.description}
          </p>

          <div className={styles.detailMeta}>
            <span>
              📅 {new Date(detailMission.dateDebut).toLocaleDateString("fr-FR")}{" "}
              → {new Date(detailMission.dateFin).toLocaleDateString("fr-FR")}
            </span>
            {detailMission.lieu && <span>📍 {detailMission.lieu}</span>}
            <span
              className={`${styles.badge} ${styles[`badge_${detailMission.statut}`]}`}>
              {STATUT_LABELS[detailMission.statut]}
            </span>
          </div>

          {detailLoading ? (
            <p>Chargement...</p>
          ) : (
            detailMission.postes.map((poste) => (
              <div key={poste._id} className={styles.posteCard}>
                <div className={styles.posteCardHeader}>
                  <div>
                    <strong>{poste.nom}</strong>
                    <span className={styles.posteResume}>
                      {poste.resume.pris}/{poste.resume.total} slots pris
                    </span>
                  </div>
                  <button
                    className={styles.btnAffecter}
                    onClick={() =>
                      ouvrirAffectation(detailMission._id, poste._id, poste.nom)
                    }>
                    + Affecter
                  </button>
                </div>

                {poste.inscriptions.length === 0 ? (
                  <p className={styles.aucuneInscription}>Aucune inscription</p>
                ) : (
                  <table className={styles.inscriptionsTable}>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Créneau</th>
                        <th>Place</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {poste.inscriptions.map((ins) => (
                        <tr key={ins._id}>
                          <td>
                            {ins.utilisateur
                              ? `${ins.utilisateur.nom}`
                              : ins.nomExterne || "—"}
                            {!ins.utilisateur && (
                              <span className={styles.tagExterne}>
                                {" "}
                                externe
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`${styles.tagCreneau} ${styles[`creneau_${ins.creneau}`]}`}>
                              {ins.creneau}
                            </span>
                          </td>
                          <td>#{ins.numeroPlace}</td>
                          <td>
                            {new Date(ins.dateInscription).toLocaleDateString(
                              "fr-FR",
                            )}
                          </td>
                          <td>
                            <button
                              className={styles.btnRetirer}
                              onClick={() =>
                                supprimerInscription(
                                  detailMission._id,
                                  poste._id,
                                  ins._id,
                                )
                              }>
                              Retirer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Formulaire création / édition ── */}
      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editId ? "Modifier la mission" : "Nouvelle mission"}</h2>
              <button className={styles.btnFermer} onClick={fermerForm}>
                ✕
              </button>
            </div>

            <form onSubmit={soumettre} className={styles.form}>
              <label>
                Titre *
                <input
                  name="titre"
                  value={form.titre}
                  onChange={handleChamp}
                  required
                />
              </label>

              <label>
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChamp}
                  rows={5}
                  required
                />
              </label>

              <div className={styles.formRow}>
                <label>
                  Date début *
                  <input
                    type="datetime-local"
                    name="dateDebut"
                    value={form.dateDebut}
                    onChange={handleChamp}
                    required
                  />
                </label>
                <label>
                  Date fin *
                  <input
                    type="datetime-local"
                    name="dateFin"
                    value={form.dateFin}
                    onChange={handleChamp}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label>
                  Lieu
                  <input name="lieu" value={form.lieu} onChange={handleChamp} />
                </label>
                <label>
                  Statut
                  <select
                    name="statut"
                    value={form.statut}
                    onChange={handleChamp}>
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>
                        {STATUT_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.formRow}>
                <label>
                  XP Récompense
                  <input type="number" name="pointsRecompense" value={form.pointsRecompense} onChange={handleChamp} min="0" />
                </label>
                <label>
                  FM Récompense
                  <input type="number" name="fmRecompense" value={form.fmRecompense} onChange={handleChamp} min="0" />
                </label>
              </div>

              <label>
                Image URL
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChamp}
                  placeholder="https://..."
                />
              </label>

              {/* ── Postes ── */}
              <div className={styles.postesSection}>
                <div className={styles.postesSectionHeader}>
                  <span>Postes</span>
                  <button
                    type="button"
                    className={styles.btnAjouterPoste}
                    onClick={ajouterPoste}>
                    + Ajouter un poste
                  </button>
                </div>

                {form.postes.length === 0 && (
                  <p className={styles.aucunPoste}>Aucun poste défini.</p>
                )}

                {form.postes.map((poste, index) => (
                  <div key={index} className={styles.posteFormLigne}>
                    <input
                      placeholder="Nom du poste"
                      value={poste.nom}
                      onChange={(e) =>
                        modifierPoste(index, "nom", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Nb places"
                      value={poste.nombrePlaces}
                      onChange={(e) =>
                        modifierPoste(
                          index,
                          "nombrePlaces",
                          parseInt(e.target.value),
                        )
                      }
                      required
                    />
                    <button
                      type="button"
                      className={styles.btnSupprimerPoste}
                      onClick={() => supprimerPoste(index)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={fermerForm}
                  className={styles.btnAnnuler}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSauvegarder}
                  disabled={formLoading}>
                  {formLoading
                    ? "Sauvegarde..."
                    : editId
                      ? "Mettre à jour"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal affectation manuelle ── */}
      {modalAffect && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.modalSmall}`}>
            <div className={styles.modalHeader}>
              <h2>Affecter — {modalAffect.posteNom}</h2>
              <button
                className={styles.btnFermer}
                onClick={() => setModalAffect(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={soumettreAffectation} className={styles.form}>
              <label>
                Créneau
                <select
                  value={affectForm.creneau}
                  onChange={(e) =>
                    setAffectForm((f) => ({ ...f, creneau: e.target.value }))
                  }>
                  <option value="matin">Matin</option>
                  <option value="soir">Soir</option>
                  <option value="journee">Journée complète</option>
                </select>
              </label>

              <label>
                Nom (sans compte)
                <input
                  placeholder="ex: Ahmed Benkhalifa"
                  value={affectForm.nomExterne}
                  onChange={(e) =>
                    setAffectForm((f) => ({
                      ...f,
                      nomExterne: e.target.value,
                      utilisateurId: "",
                    }))
                  }
                />
              </label>

              <p className={styles.ouSeparateur}>— ou —</p>

              <label>
                ID utilisateur (avec compte)
                <input
                  placeholder="ObjectId MongoDB"
                  value={affectForm.utilisateurId}
                  onChange={(e) =>
                    setAffectForm((f) => ({
                      ...f,
                      utilisateurId: e.target.value,
                      nomExterne: "",
                    }))
                  }
                />
              </label>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setModalAffect(null)}
                  className={styles.btnAnnuler}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSauvegarder}
                  disabled={affectLoading}>
                  {affectLoading ? "..." : "Affecter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

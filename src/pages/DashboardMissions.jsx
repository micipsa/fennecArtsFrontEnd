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

  // Checklist
  const [nouvelleTache, setNouvelleTache] = useState("");
  const [tachePriorite, setTachePriorite] = useState("normale");
  const [tacheResponsable, setTacheResponsable] = useState("");

  // Matériel
  const [nouveauMateriel, setNouveauMateriel] = useState({ nom: "", quantite: 1, categorie: "autre", responsableNom: "" });

  // Onglet actif du détail
  const [detailTab, setDetailTab] = useState("postes"); // postes | checklist | materiel

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

  // ── Checklist : ajouter ──────────────────────────────────────────────────────
  const ajouterTache = async (missionId) => {
    if (!nouvelleTache.trim()) return;
    try {
      await api.post(`/api/missions/${missionId}/taches`, {
        texte: nouvelleTache,
        priorite: tachePriorite,
        responsableNom: tacheResponsable || null,
      });
      setNouvelleTache("");
      setTacheResponsable("");
      setTachePriorite("normale");
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Checklist : toggle ──────────────────────────────────────────────────────
  const toggleTache = async (missionId, tacheId, fait) => {
    try {
      await api.patch(`/api/missions/${missionId}/taches/${tacheId}`, { fait: !fait });
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Checklist : supprimer ───────────────────────────────────────────────────
  const supprimerTache = async (missionId, tacheId) => {
    try {
      await api.delete(`/api/missions/${missionId}/taches/${tacheId}`);
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Matériel : ajouter ──────────────────────────────────────────────────────
  const ajouterMateriel = async (missionId) => {
    if (!nouveauMateriel.nom.trim()) return;
    try {
      await api.post(`/api/missions/${missionId}/materiel`, nouveauMateriel);
      setNouveauMateriel({ nom: "", quantite: 1, categorie: "autre", responsableNom: "" });
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Matériel : changer statut ───────────────────────────────────────────────
  const changerStatutMateriel = async (missionId, materielId, statut) => {
    try {
      await api.patch(`/api/missions/${missionId}/materiel/${materielId}`, { statut });
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Matériel : supprimer ────────────────────────────────────────────────────
  const supprimerMateriel = async (missionId, materielId) => {
    try {
      await api.delete(`/api/missions/${missionId}/materiel/${materielId}`);
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // ── Pointage : toggle présence ──────────────────────────────────────────────
  const togglePresence = async (missionId, posteId, inscriptionId) => {
    try {
      await api.patch(`/api/missions/${missionId}/postes/${posteId}/inscriptions/${inscriptionId}/pointer`);
      ouvrirDetail(missionId);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
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

          {/* Onglets du détail */}
          <div className={styles.detailTabs}>
            {[
              { id: "postes", label: "🧩 Postes" },
              { id: "checklist", label: `📋 Checklist (${detailMission.taches?.length || 0})` },
              { id: "materiel", label: `🎒 Matériel (${detailMission.materiel?.length || 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.detailTabBtn} ${detailTab === tab.id ? styles.detailTabActif : ""}`}
                onClick={() => setDetailTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {detailLoading ? (
            <p>Chargement...</p>
          ) : detailTab === "postes" ? (
            /* ── Onglet Postes ── */
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
                        <th>Présent</th>
                        <th>Actions</th>
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
                            <button
                              className={`${styles.btnPresence} ${ins.present ? styles.btnPresent : styles.btnAbsent}`}
                              onClick={() => togglePresence(detailMission._id, poste._id, ins._id)}
                            >
                              {ins.present ? "✓ Présent" : "✗ Absent"}
                            </button>
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
          ) : detailTab === "checklist" ? (
            /* ── Onglet Checklist ── */
            <div className={styles.checklistSection}>
              {/* Barre de progression */}
              {(detailMission.taches?.length > 0) && (
                <div className={styles.checklistProgress}>
                  <div className={styles.checklistProgressBar}>
                    <div
                      className={styles.checklistProgressFill}
                      style={{ width: `${Math.round((detailMission.taches.filter(t => t.fait).length / detailMission.taches.length) * 100)}%` }}
                    />
                  </div>
                  <span className={styles.checklistProgressLabel}>
                    {detailMission.taches.filter(t => t.fait).length}/{detailMission.taches.length} terminées
                  </span>
                </div>
              )}

              {/* Formulaire ajout */}
              <div className={styles.checklistAdd}>
                <input
                  placeholder="Nouvelle tâche..."
                  value={nouvelleTache}
                  onChange={e => setNouvelleTache(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && ajouterTache(detailMission._id)}
                  className={styles.checklistInput}
                />
                <input
                  placeholder="Responsable"
                  value={tacheResponsable}
                  onChange={e => setTacheResponsable(e.target.value)}
                  className={styles.checklistInputSmall}
                />
                <select value={tachePriorite} onChange={e => setTachePriorite(e.target.value)} className={styles.checklistSelect}>
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                </select>
                <button className={styles.btnAffecter} onClick={() => ajouterTache(detailMission._id)}>+ Ajouter</button>
              </div>

              {/* Liste des tâches */}
              {(detailMission.taches || []).length === 0 ? (
                <p className={styles.aucuneInscription}>Aucune tâche pour l'instant.</p>
              ) : (
                <div className={styles.checklistItems}>
                  {detailMission.taches.map(tache => (
                    <div key={tache._id} className={`${styles.checklistItem} ${tache.fait ? styles.checklistItemDone : ""}`}>
                      <button
                        className={styles.checklistToggle}
                        onClick={() => toggleTache(detailMission._id, tache._id, tache.fait)}
                      >
                        {tache.fait ? "☑" : "☐"}
                      </button>
                      <div className={styles.checklistItemBody}>
                        <span className={styles.checklistItemTexte}>{tache.texte}</span>
                        <div className={styles.checklistItemMeta}>
                          {tache.responsableNom && <span>👤 {tache.responsableNom}</span>}
                          <span className={`${styles.prioriteBadge} ${styles[`priorite_${tache.priorite}`]}`}>
                            {tache.priorite}
                          </span>
                        </div>
                      </div>
                      <button className={styles.btnRetirer} onClick={() => supprimerTache(detailMission._id, tache._id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : detailTab === "materiel" ? (
            /* ── Onglet Matériel ── */
            <div className={styles.materielSection}>
              {/* Résumé */}
              {(detailMission.materiel?.length > 0) && (
                <div className={styles.materielResume}>
                  <span>✅ {detailMission.materiel.filter(m => m.statut === "confirme" || m.statut === "sur_place" || m.statut === "rendu").length} confirmés</span>
                  <span>⏳ {detailMission.materiel.filter(m => m.statut === "a_fournir").length} en attente</span>
                  <span>📦 {detailMission.materiel.reduce((acc, m) => acc + m.quantite, 0)} items total</span>
                </div>
              )}

              {/* Formulaire ajout */}
              <div className={styles.materielAdd}>
                <input
                  placeholder="Nom du matériel..."
                  value={nouveauMateriel.nom}
                  onChange={e => setNouveauMateriel(m => ({ ...m, nom: e.target.value }))}
                  className={styles.checklistInput}
                />
                <input
                  type="number" min="1"
                  value={nouveauMateriel.quantite}
                  onChange={e => setNouveauMateriel(m => ({ ...m, quantite: parseInt(e.target.value) || 1 }))}
                  className={styles.materielQte}
                />
                <select
                  value={nouveauMateriel.categorie}
                  onChange={e => setNouveauMateriel(m => ({ ...m, categorie: e.target.value }))}
                  className={styles.checklistSelect}
                >
                  <option value="tech">🖥️ Tech</option>
                  <option value="logistique">📦 Logistique</option>
                  <option value="decoration">🎨 Déco</option>
                  <option value="nourriture">🍕 Nourriture</option>
                  <option value="autre">🔧 Autre</option>
                </select>
                <input
                  placeholder="Responsable"
                  value={nouveauMateriel.responsableNom}
                  onChange={e => setNouveauMateriel(m => ({ ...m, responsableNom: e.target.value }))}
                  className={styles.checklistInputSmall}
                />
                <button className={styles.btnAffecter} onClick={() => ajouterMateriel(detailMission._id)}>+ Ajouter</button>
              </div>

              {/* Liste matériel */}
              {(detailMission.materiel || []).length === 0 ? (
                <p className={styles.aucuneInscription}>Aucun matériel listé.</p>
              ) : (
                <table className={styles.inscriptionsTable}>
                  <thead>
                    <tr>
                      <th>Matériel</th>
                      <th>Qté</th>
                      <th>Catégorie</th>
                      <th>Responsable</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailMission.materiel.map(item => (
                      <tr key={item._id}>
                        <td><strong>{item.nom}</strong></td>
                        <td>{item.quantite}</td>
                        <td>
                          <span className={styles.tagCreneau}>
                            {{tech: "🖥️", logistique: "📦", decoration: "🎨", nourriture: "🍕", autre: "🔧"}[item.categorie] || "🔧"} {item.categorie}
                          </span>
                        </td>
                        <td>{item.responsableNom || "—"}</td>
                        <td>
                          <select
                            value={item.statut}
                            onChange={e => changerStatutMateriel(detailMission._id, item._id, e.target.value)}
                            className={`${styles.materielStatutSelect} ${styles[`mat_${item.statut}`]}`}
                          >
                            <option value="a_fournir">⏳ À fournir</option>
                            <option value="confirme">✅ Confirmé</option>
                            <option value="sur_place">📍 Sur place</option>
                            <option value="rendu">↩️ Rendu</option>
                          </select>
                        </td>
                        <td>
                          <button className={styles.btnRetirer} onClick={() => supprimerMateriel(detailMission._id, item._id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
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

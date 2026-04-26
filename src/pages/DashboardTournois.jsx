/**
 * DashboardTournois — page CRUD de gestion des tournois (admin).
 *
 * La page la plus riche du dashboard. Elle permet à l'admin de :
 * - Voir tous les tournois dans un tableau scrollable
 *   (titre, jeu, format, participants, statut, actions)
 * - Créer un nouveau tournoi via une modale complète
 * - Changer le statut d'un tournoi (ouvert, complet, en_cours, terminé)
 *   via un select dans la ligne du tableau
 * - Supprimer un tournoi avec confirmation
 *
 * Endpoints API utilisés :
 * - GET    /api/tournaments        → charger la liste
 * - POST   /api/tournaments        → créer un tournoi
 * - PUT    /api/tournaments/:id    → modifier le statut
 * - DELETE /api/tournaments/:id    → supprimer un tournoi
 *
 * Le formulaire de création contient des champs spécifiques :
 * - Titre, jeu, format (select), lieu, max participants (number),
 *   dates début/fin (datetime-local), récompense (optionnel), description
 *
 * Les champs sont organisés en grilles de 2 colonnes via CSS.
 */
import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardTournois.module.css";

// Valeurs initiales du formulaire de création de tournoi
const FORM_INITIAL = {
  titre: "",
  description: "",
  jeu: "",
  format: "1v1",
  lieu: "",
  dateDebut: "",
  dateFin: "",
  nombreMaxParticipants: 16,
  prize: "",
};

// Formats de tournoi disponibles
const FORMATS = ["1v1", "2v2", "4v4", "équipes", "battle-royale"];

function DashboardTournois() {
  // ── States ──
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);

  // ── Chargement des tournois au montage ──
  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/tournaments");
        setTournois(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les tournois.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  /** Mise à jour dynamique des champs du formulaire */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Création d'un nouveau tournoi via POST.
   * Le tournoi créé est ajouté en tête de la liste.
   */
  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/tournaments", formData);
      setTournois((prev) => [res.data.data, ...prev]);
      setModaleOuverte(false);
      setFormData(FORM_INITIAL);
    } catch (err) {
      setErreurForm(
        err.response?.data?.message || "Erreur lors de la création.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  /**
   * Suppression d'un tournoi après confirmation.
   */
  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce tournoi ?")) return;
    try {
      await api.delete(`/api/tournaments/${id}`);
      setTournois((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  /**
   * Changement de statut d'un tournoi via PUT.
   * Met à jour le statut dans la liste côté client (state optimiste).
   */
  const handleChangerStatut = async (id, nouveauStatut) => {
    try {
      await api.put(`/api/tournaments/${id}`, { statut: nouveauStatut });
      setTournois((prev) =>
        prev.map((t) => (t._id === id ? { ...t, statut: nouveauStatut } : t)),
      );
    } catch (err) {
      alert("Erreur lors de la modification du statut.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  // Mapping statut → variante de couleur du Badge
  const varianteStatut = {
    ouvert: "succes",
    complet: "avertissement",
    en_cours: "info",
    terminé: "defaut",
  };

  return (
    <div>
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des tournois</h1>
          <p className={styles.sousTitre}>
            {tournois.length} tournoi(s) au total
          </p>
        </div>
        <button
          className={styles.btnCreer}
          onClick={() => setModaleOuverte(true)}>
          + Nouveau tournoi
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          Tableau des tournois (avec scroll horizontal)
          ══════════════════════════════════════════════ */}
      <div className={styles.tableau}>
        <div className={styles.tableauScroll}>
          <div className={styles.tableauEntete}>
            <span>Titre</span>
            <span>Jeu</span>
            <span>Format</span>
            <span>Participants</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>

          {tournois.length === 0 && (
            <p className={styles.vide}>Aucun tournoi pour l'instant.</p>
          )}

          {tournois.map((t) => (
            <div key={t._id} className={styles.tableauLigne}>
              <span className={styles.titreLigne}>{t.titre}</span>
              <span>{t.jeu}</span>
              <span>{t.format}</span>
              {/* Affichage du ratio participants / max */}
              <span>
                {t.participants?.length ?? 0} / {t.nombreMaxParticipants}
              </span>
              <span>
                <Badge
                  texte={t.statut}
                  variante={varianteStatut[t.statut] ?? "defaut"}
                />
              </span>
              <span className={styles.actions}>
                {/* Select pour changer le statut */}
                <select
                  className={styles.selectStatut}
                  value={t.statut}
                  onChange={(e) => handleChangerStatut(t._id, e.target.value)}>
                  <option value="ouvert">ouvert</option>
                  <option value="complet">complet</option>
                  <option value="en_cours">en_cours</option>
                  <option value="terminé">terminé</option>
                </select>
                {/* Bouton de suppression */}
                <button
                  className={styles.btnSupprimer}
                  onClick={() => handleSupprimer(t._id)}>
                  Supprimer
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          Modale de création de tournoi
          ══════════════════════════════════════════════ */}
      {modaleOuverte && (
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouveau tournoi</h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleOuverte(false)}>
                ✕
              </button>
            </div>

            {erreurForm && (
              <div className={styles.erreurForm}>{erreurForm}</div>
            )}

            <form className={styles.formulaire} onSubmit={handleCreer}>
              {/* Titre */}
              <div className={styles.champ}>
                <label className={styles.label}>Titre</label>
                <input
                  className={styles.input}
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Nom du tournoi"
                  required
                />
              </div>

              {/* ── Grille 2 colonnes : Jeu + Format ── */}
              <div className={styles.grilleDeuxColonnes}>
                <div className={styles.champ}>
                  <label className={styles.label}>Jeu</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="jeu"
                    value={formData.jeu}
                    onChange={handleChange}
                    placeholder="Street Fighter 6, Tekken 8..."
                    required
                  />
                </div>
                <div className={styles.champ}>
                  <label className={styles.label}>Format</label>
                  <select
                    className={styles.input}
                    name="format"
                    value={formData.format}
                    onChange={handleChange}>
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Grille 2 colonnes : Lieu + Max participants ── */}
              <div className={styles.grilleDeuxColonnes}>
                <div className={styles.champ}>
                  <label className={styles.label}>Lieu</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleChange}
                    placeholder="Ville, salle..."
                    required
                  />
                </div>
                <div className={styles.champ}>
                  <label className={styles.label}>Max participants</label>
                  <input
                    className={styles.input}
                    type="number"
                    name="nombreMaxParticipants"
                    value={formData.nombreMaxParticipants}
                    onChange={handleChange}
                    min="2"
                    required
                  />
                </div>
              </div>

              {/* ── Grille 2 colonnes : Dates début + fin ── */}
              <div className={styles.grilleDeuxColonnes}>
                <div className={styles.champ}>
                  <label className={styles.label}>Date de début</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.champ}>
                  <label className={styles.label}>Date de fin</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Récompense (optionnel) */}
              <div className={styles.champ}>
                <label className={styles.label}>Récompense</label>
                <input
                  className={styles.input}
                  type="text"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                  placeholder="Trophée, DA, matériel..."
                />
              </div>

              {/* Description */}
              <div className={styles.champ}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description du tournoi..."
                  rows={4}
                  required
                />
              </div>

              {/* Boutons d'action de la modale */}
              <div className={styles.modaleActions}>
                <button
                  type="button"
                  className={styles.btnAnnuler}
                  onClick={() => setModaleOuverte(false)}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSoumettre}
                  disabled={envoiEnCours}>
                  {envoiEnCours ? "Création..." : "Créer le tournoi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardTournois;

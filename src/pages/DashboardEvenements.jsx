/**
 * DashboardEvenements — page CRUD de gestion des événements (admin).
 *
 * Structure et fonctionnement identiques à DashboardArticles, mais pour les événements.
 *
 * Fonctionnalités :
 * - Tableau listant tous les événements (titre, catégorie, lieu, date début, actions)
 * - Modale de création avec champs spécifiques aux événements :
 *   - Titre, catégorie, lieu, date de début, date de fin, description
 * - Suppression avec confirmation
 *
 * Endpoints API utilisés :
 * - GET    /api/events        → charger la liste
 * - POST   /api/events        → créer un événement
 * - DELETE /api/events/:id    → supprimer un événement
 *
 * Le formulaire utilise des champs `datetime-local` pour les dates,
 * permettant à l'utilisateur de sélectionner une date ET une heure.
 */
import { useState, useEffect } from "react";
import UploadImage from "../components/UI/UploadImage";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardEvenements.module.css";

// Valeurs initiales du formulaire de création d'événement
const FORM_INITIAL = {
  titre: "",
  description: "",
  categorie: "Exposition",
  lieu: "",
  dateDebut: "",
  dateFin: "",
  imageUrl: "",
};

// Catégories disponibles pour les événements
const CATEGORIES = [
  "Exposition",
  "Tournois",
  "Master Class",
  "FreeToPlay",
  "Streaming",
  "Autre",
];

function DashboardEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);
  const [galerieEventId, setGalerieEventId] = useState(null);
  const [galeriePhotos, setGaleriePhotos] = useState([]);
  const [legendeNouvelle, setLegendeNouvelle] = useState("");
  const [urlNouvelle, setUrlNouvelle] = useState("");

  // ── Chargement des événements au montage ──
  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/events");
        setEvenements(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les événements.");
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
   * Création d'un nouvel événement via POST.
   * L'événement créé est ajouté en tête de la liste.
   */
  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/events", formData);
      setEvenements((prev) => [res.data.data, ...prev]);
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
   * Suppression d'un événement après confirmation.
   * L'événement est retiré de la liste côté client.
   */
  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet événement ?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      setEvenements((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const ouvrirGalerie = (ev) => {
    setGalerieEventId(ev._id);
    setGaleriePhotos(ev.galerie || []);
    setUrlNouvelle("");
    setLegendeNouvelle("");
  };

  const handleAjouterPhoto = async () => {
    if (!urlNouvelle) return;
    try {
      const res = await api.post(`/api/events/${galerieEventId}/photos`, {
        url: urlNouvelle,
        legende: legendeNouvelle,
      });
      setGaleriePhotos(res.data.data);
      setEvenements((prev) =>
        prev.map((ev) => ev._id === galerieEventId ? { ...ev, galerie: res.data.data } : ev)
      );
      setUrlNouvelle("");
      setLegendeNouvelle("");
    } catch {
      alert("Erreur lors de l'ajout.");
    }
  };

  const handleSupprimerPhoto = async (index) => {
    try {
      const res = await api.delete(`/api/events/${galerieEventId}/photos/${index}`);
      setGaleriePhotos(res.data.data);
      setEvenements((prev) =>
        prev.map((ev) => ev._id === galerieEventId ? { ...ev, galerie: res.data.data } : ev)
      );
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des événements</h1>
          <p className={styles.sousTitre}>
            {evenements.length} événement(s) au total
          </p>
        </div>
        <button
          className={styles.btnCreer}
          onClick={() => setModaleOuverte(true)}>
          + Nouvel événement
        </button>
      </div>

      {/* ── Tableau des événements ── */}
      <div className={styles.tableau}>
        <div className={styles.tableauEntete}>
          <span>Titre</span>
          <span>Catégorie</span>
          <span>Lieu</span>
          <span>Date début</span>
          <span>Actions</span>
        </div>

        {evenements.length === 0 && (
          <p className={styles.vide}>Aucun événement pour l'instant.</p>
        )}

        {evenements.map((ev) => (
          <div key={ev._id} className={styles.tableauLigne}>
            <span className={styles.titreLigne}>{ev.titre}</span>
            <span>
              <Badge texte={ev.categorie} variante="primaire" />
            </span>
            <span className={styles.cellule}>{ev.lieu}</span>
            <span>{new Date(ev.dateDebut).toLocaleDateString("fr-FR")}</span>
            <span style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <button
                className={styles.btnGalerie}
                onClick={() => ouvrirGalerie(ev)}>
                Photos ({ev.galerie?.length ?? 0})
              </button>
              <button
                className={styles.btnSupprimer}
                onClick={() => handleSupprimer(ev._id)}>
                Supprimer
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* ── Modale de création d'événement ── */}
      {modaleOuverte && (
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouvel événement</h2>
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
                  placeholder="Titre de l'événement"
                  required
                />
              </div>

              {/* Catégorie (select) */}
              <div className={styles.champ}>
                <label className={styles.label}>Catégorie</label>
                <select
                  className={styles.input}
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lieu */}
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

              {/* Dates de début et fin (inputs datetime-local sur 2 colonnes) */}
              <div className={styles.grilleDates}>
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
              <div className={styles.champ}>
                <label className={styles.label}>
                  Affiche de l'événement (optionnel)
                </label>
                <UploadImage
                  onUpload={(url) =>
                    setFormData((prev) => ({ ...prev, imageUrl: url }))
                  }
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Aperçu"
                    style={{
                      marginTop: "0.5rem",
                      maxHeight: "150px",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </div>

              {/* Description (textarea) */}
              <div className={styles.champ}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'événement..."
                  rows={5}
                  required
                />
              </div>

              {/* Boutons d'action */}
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
                  {envoiEnCours ? "Création..." : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Modale galerie ── */}
      {galerieEventId && (
        <div className={styles.overlay} onClick={() => setGalerieEventId(null)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Galerie photos</h2>
              <button className={styles.modaleFermer} onClick={() => setGalerieEventId(null)}>✕</button>
            </div>

            <div className={styles.galerieUpload}>
              <UploadImage onUpload={(url) => setUrlNouvelle(url)} />
              {urlNouvelle && (
                <>
                  <img src={urlNouvelle} alt="aperçu" style={{ maxHeight: 80, borderRadius: 6, marginTop: 8 }} />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Légende (optionnel)"
                    value={legendeNouvelle}
                    onChange={(e) => setLegendeNouvelle(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                  <button className={styles.btnSoumettre} onClick={handleAjouterPhoto} style={{ marginTop: 8 }}>
                    Ajouter la photo
                  </button>
                </>
              )}
            </div>

            <div className={styles.galerieGrille}>
              {galeriePhotos.length === 0 && (
                <p className={styles.vide}>Aucune photo.</p>
              )}
              {galeriePhotos.map((photo, i) => (
                <div key={i} className={styles.galerieItem}>
                  <img src={photo.url} alt={photo.legende || `Photo ${i + 1}`} className={styles.galerieImg} />
                  {photo.legende && <p className={styles.galerieLegende}>{photo.legende}</p>}
                  <button className={styles.galerieSup} onClick={() => handleSupprimerPhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardEvenements;

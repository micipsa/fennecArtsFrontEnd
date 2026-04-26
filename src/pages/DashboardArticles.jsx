/**
 * DashboardArticles — page CRUD de gestion des articles (admin).
 *
 * Fonctionnalités :
 * - Liste tous les articles dans un tableau (titre, catégorie, auteur, date, actions)
 * - Bouton "Nouvel article" ouvrant une modale de création
 * - Bouton "Supprimer" sur chaque ligne avec confirmation (window.confirm)
 *
 * Flux de données :
 * - GET    /api/articles        → charger la liste au montage
 * - POST   /api/articles        → créer un nouvel article (via la modale)
 * - DELETE /api/articles/:id    → supprimer un article
 *
 * Après chaque opération (création / suppression), la liste est mise à jour
 * côté client sans recharger la page (state update optimiste).
 *
 * La modale utilise un overlay cliquable pour se fermer,
 * avec stopPropagation() sur la modale elle-même pour éviter
 * qu'un clic à l'intérieur ne la ferme.
 */
import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardArticles.module.css";

// Valeurs initiales du formulaire de création
const FORM_INITIAL = { titre: "", contenu: "", categorie: "Peinture" };

// Liste des catégories disponibles pour le select
const CATEGORIES = [
  "High-tech",
  "Manga",
  "Gaming",
  "Graphisme",
  "Esport",
  "Geekerie",
  "Bon Plan",
  "Photographie",

  "DIY",
  "Programmation",
  "TCG/JCC",
  "Littérature",
  "Chroniques",
  "Cinéma",
];

function DashboardArticles() {
  // ── States ──
  const [articles, setArticles] = useState([]); // Liste des articles
  const [chargement, setChargement] = useState(true); // Chargement initial
  const [erreur, setErreur] = useState(null); // Erreur de chargement
  const [modaleOuverte, setModaleOuverte] = useState(false); // État de la modale
  const [formData, setFormData] = useState(FORM_INITIAL); // Données du formulaire
  const [envoiEnCours, setEnvoiEnCours] = useState(false); // Envoi en cours
  const [erreurForm, setErreurForm] = useState(null); // Erreur du formulaire

  // ── Chargement des articles au montage ──
  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/articles");
        setArticles(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les articles.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  /**
   * Gestionnaire de changement des champs du formulaire.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Gestionnaire de création d'un nouvel article.
   * Effectue un POST et ajoute l'article créé en tête de la liste (state optimiste).
   */
  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/articles", formData);
      // Ajout du nouvel article en tête de la liste
      setArticles((prev) => [res.data.data, ...prev]);
      setModaleOuverte(false); // Fermeture de la modale
      setFormData(FORM_INITIAL); // Reset du formulaire
    } catch (err) {
      setErreurForm(
        err.response?.data?.message || "Erreur lors de la création.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  /**
   * Gestionnaire de suppression d'un article.
   * Demande confirmation puis effectue un DELETE.
   * Met à jour la liste en filtrant l'article supprimé.
   */
  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet article ?")) return;
    try {
      await api.delete(`/api/articles/${id}`);
      // Retrait de l'article de la liste côté client
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Affichage du spinner ou de l'erreur pendant le chargement
  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
      {/* ── En-tête avec compteur et bouton de création ── */}
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des articles</h1>
          <p className={styles.sousTitre}>
            {articles.length} article(s) au total
          </p>
        </div>
        <button
          className={styles.btnCreer}
          onClick={() => setModaleOuverte(true)}>
          + Nouvel article
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          Tableau des articles
          ══════════════════════════════════════════════ */}
      <div className={styles.tableau}>
        {/* En-tête du tableau */}
        <div className={styles.tableauEntete}>
          <span>Titre</span>
          <span>Catégorie</span>
          <span>Auteur</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {/* Message si aucun article */}
        {articles.length === 0 && (
          <p className={styles.vide}>Aucun article pour l'instant.</p>
        )}

        {/* Lignes du tableau */}
        {articles.map((article) => (
          <div key={article._id} className={styles.tableauLigne}>
            <span className={styles.titreLigne}>{article.titre}</span>
            <span>
              <Badge texte={article.categorie} variante="primaire" />
            </span>
            <span>{article.auteur?.nom ?? "—"}</span>
            <span>
              {new Date(article.createdAt).toLocaleDateString("fr-FR")}
            </span>
            <span>
              <button
                className={styles.btnSupprimer}
                onClick={() => handleSupprimer(article._id)}>
                Supprimer
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          Modale de création d'article
          ══════════════════════════════════════════════ */}
      {modaleOuverte && (
        // Overlay : clic dessus ferme la modale
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          {/* stopPropagation empêche le clic dans la modale de la fermer */}
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            {/* En-tête de la modale */}
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouvel article</h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleOuverte(false)}>
                ✕
              </button>
            </div>

            {/* Message d'erreur du formulaire */}
            {erreurForm && (
              <div className={styles.erreurForm}>{erreurForm}</div>
            )}

            {/* Formulaire de création */}
            <form className={styles.formulaire} onSubmit={handleCreer}>
              {/* Champ titre */}
              <div className={styles.champ}>
                <label className={styles.label}>Titre</label>
                <input
                  className={styles.input}
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Titre de l'article"
                  required
                />
              </div>

              {/* Select catégorie */}
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

              {/* Textarea contenu */}
              <div className={styles.champ}>
                <label className={styles.label}>Contenu</label>
                <textarea
                  className={styles.textarea}
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleChange}
                  placeholder="Contenu de l'article..."
                  rows={6}
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
                  {envoiEnCours ? "Création..." : "Créer l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardArticles;

import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardArticles.module.css";

const FORM_INITIAL = { titre: "", contenu: "", categorie: "Peinture" };
const CATEGORIES = [
  "Peinture",
  "Musique",
  "Théâtre",
  "Littérature",
  "Cinéma",
  "Danse",
];

function DashboardArticles() {
  const [articles, setArticles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/articles", formData);
      setArticles((prev) => [res.data.data, ...prev]);
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

  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet article ?")) return;
    try {
      await api.delete(`/api/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
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

      <div className={styles.tableau}>
        <div className={styles.tableauEntete}>
          <span>Titre</span>
          <span>Catégorie</span>
          <span>Auteur</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {articles.length === 0 && (
          <p className={styles.vide}>Aucun article pour l'instant.</p>
        )}

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

      {modaleOuverte && (
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouvel article</h2>
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

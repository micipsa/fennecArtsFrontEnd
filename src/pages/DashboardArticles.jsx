import { useState, useEffect } from "react";
import EditeurTexte from "../components/UI/EditeurTexte";
import UploadImage from "../components/UI/UploadImage";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardArticles.module.css";

const FORM_INITIAL = {
  titre: "",
  contenu: "",
  categorie: "High-tech",
  published: true,
  videoUrl: "",
  imageUrl: "",
};

const CATEGORIES = [
  "High-tech",
  "Manga",
  "Graphisme",
  "Esport",
  "Geekerie",
  "Bon Plan",
  "Photographie",
  "Gaming",
  "DIY",
  "Programmation",
  "TCG/JCC",
  "Littérature",
  "Chroniques",
  "Cinéma",
  "Let's Play",
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
];

function DashboardArticles() {
  const [articles, setArticles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);
  const [articleEnEdition, setArticleEnEdition] = useState(null);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/articles/admin/all");
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
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Quill passe la valeur directement, pas un event
  const handleContenuChange = (valeur) => {
    setFormData((prev) => ({ ...prev, contenu: valeur }));
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

  const handleOuvrirEdition = (article) => {
    setArticleEnEdition(article._id);
    setFormData({
      titre: article.titre,
      contenu: article.contenu,
      categorie: article.categorie,
      published: article.published,
      videoUrl: article.videoUrl || "",
      imageUrl: article.imageUrl || "",
    });
    setModaleEditionOuverte(true);
  };

  const handleModifier = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.put(`/api/articles/${articleEnEdition}`, formData);
      setArticles((prev) =>
        prev.map((a) => (a._id === articleEnEdition ? res.data.data : a)),
      );
      setModaleEditionOuverte(false);
      setArticleEnEdition(null);
      setFormData(FORM_INITIAL);
    } catch (err) {
      setErreurForm(
        err.response?.data?.message || "Erreur lors de la modification.",
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

  const handleTogglePublish = async (id, estPublie) => {
    try {
      const res = await api.put(`/api/articles/${id}`, {
        published: !estPublie,
      });
      setArticles((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, published: res.data.data.published } : a,
        ),
      );
    } catch (err) {
      alert("Erreur lors de la modification.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  const formulaireContenu = (
    <>
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
        <EditeurTexte
          value={formData.contenu}
          onChange={(val) => setFormData((prev) => ({ ...prev, contenu: val }))}
          placeholder="Rédigez votre article ici..."
        />
      </div>
      <div className={styles.champ}>
        <label className={styles.label}>Image de couverture (optionnel)</label>
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
      <div className={styles.champ}>
        <label className={styles.label}>URL vidéo YouTube (optionnel)</label>
        <input
          className={styles.input}
          type="text"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/embed/XXXXXXXXX"
        />
        <span className={styles.aide}>
          Colle uniquement l'URL src= de l'iframe YouTube
        </span>
      </div>
    </>
  );

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
        <div className={styles.tableauScroll}>
          <div className={styles.tableauEntete}>
            <span>Titre</span>
            <span>Catégorie</span>
            <span>Auteur</span>
            <span>Vues</span>
            <span>Statut</span>
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
              <span>{article.vues ?? 0}</span>
              <span>
                <button
                  className={
                    article.published ? styles.btnPublie : styles.btnBrouillon
                  }
                  onClick={() =>
                    handleTogglePublish(article._id, article.published)
                  }>
                  {article.published ? "✓ Publié" : "○ Brouillon"}
                </button>
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}>
                <button
                  className={styles.btnModifier}
                  onClick={() => handleOuvrirEdition(article)}>
                  Modifier
                </button>
                <button
                  className={styles.btnSupprimer}
                  onClick={() => handleSupprimer(article._id)}>
                  Supprimer
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modale création ── */}
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
              {formulaireContenu}
              <div className={styles.champCheckbox}>
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="published" className={styles.labelCheckbox}>
                  Publier immédiatement
                </label>
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

      {/* ── Modale édition ── */}
      {modaleEditionOuverte && (
        <div
          className={styles.overlay}
          onClick={() => setModaleEditionOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Modifier l'article</h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleEditionOuverte(false)}>
                ✕
              </button>
            </div>
            {erreurForm && (
              <div className={styles.erreurForm}>{erreurForm}</div>
            )}
            <form className={styles.formulaire} onSubmit={handleModifier}>
              {formulaireContenu}
              <div className={styles.champCheckbox}>
                <input
                  type="checkbox"
                  id="publishedEdit"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="publishedEdit" className={styles.labelCheckbox}>
                  Publié
                </label>
              </div>
              <div className={styles.modaleActions}>
                <button
                  type="button"
                  className={styles.btnAnnuler}
                  onClick={() => setModaleEditionOuverte(false)}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSoumettre}
                  disabled={envoiEnCours}>
                  {envoiEnCours ? "Modification..." : "Enregistrer"}
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

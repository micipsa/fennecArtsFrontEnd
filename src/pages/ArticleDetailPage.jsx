/**
 * ArticleDetailPage — page de détail d'un article individuel.
 *
 * Cette page affiche le contenu complet d'un article sélectionné.
 * L'identifiant de l'article est récupéré depuis l'URL via useParams() (:id).
 *
 * Structure de la page :
 * - Lien "Retour aux articles"
 * - En-tête : Badge de catégorie + date + titre + séparateur
 * - Bloc auteur : avatar (initiale) + nom + rôle
 * - Contenu complet de l'article (chaque paragraphe est un <p> séparé)
 *
 * Le contenu est découpé par les retours à la ligne (\n) pour
 * afficher chaque paragraphe dans une balise <p> distincte.
 */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./ArticleDetailPage.module.css";

function ArticleDetailPage() {
  // Récupération de l'id depuis l'URL (ex: /articles/abc123)
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // ── Chargement de l'article au montage ou quand l'id change ──
  useEffect(() => {
    const chargerArticle = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const res = await api.get(`/api/articles/${id}`);
        setArticle(res.data.data);
      } catch (err) {
        setErreur(err.response?.data?.message || "Article introuvable.");
      } finally {
        setChargement(false);
      }
    };
    chargerArticle();
  }, [id]); // Se relance si l'id change (navigation entre articles)

  // Affichage pendant le chargement
  if (chargement) return <Spinner />;

  // Affichage en cas d'erreur
  if (erreur)
    return (
      <div className="container">
        <MessageErreur message={erreur} />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/articles" className="btn btn-outline">
            Retour aux articles
          </Link>
        </div>
      </div>
    );

  // Si pas d'article (cas théorique)
  if (!article) return null;

  // Formatage de la date de création en français
  const dateFormatee = new Date(article.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Initiale de l'auteur pour l'avatar
  const initialeAuteur = (article.auteur?.nom ?? "A")[0].toUpperCase();

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Lien de retour à la liste */}
        <Link to="/articles" className={styles.retour}>
          ← Retour aux articles
        </Link>

        {/* ── En-tête de l'article ── */}
        <div className={styles.entete}>
          {/* Métadonnées : catégorie + date */}
          <div className={styles.meta}>
            <Badge texte={article.categorie} variante="primaire" />
            <span className={styles.date}>{dateFormatee}</span>
          </div>

          {/* Titre principal */}
          <h1 className={styles.titre}>{article.titre}</h1>

          <div className={styles.separateur} />

          {/* Bloc auteur : avatar + nom + rôle */}
          <div className={styles.auteurBloc}>
            <div className={styles.auteurAvatar}>{initialeAuteur}</div>
            <div className={styles.auteurInfo}>
              <span className={styles.auteurNom}>
                {article.auteur?.nom ?? "Auteur inconnu"}
              </span>
              <span className={styles.auteurRole}>Rédacteur Fennec Arts</span>
            </div>
          </div>
        </div>
        {/* Image de couverture */}
        {article.imageUrl && (
          <div className={styles.imageWrapper}>
            <img
              src={article.imageUrl}
              alt={article.titre}
              className={styles.imageCouverture}
            />
          </div>
        )}
        {/* ── Contenu complet de l'article ── */}
        <div className={styles.contenu}>
          {/* Découpage du contenu par \n pour créer des paragraphes séparés */}
          {article.contenu
            .split("\n")
            .map(
              (paragraphe, index) =>
                paragraphe.trim() && <p key={index}>{paragraphe}</p>,
            )}
        </div>
        {article.videoUrl && (
          <div className={styles.videoWrapper}>
            <iframe
              src={getEmbedUrl(article.videoUrl)}
              title="Vidéo YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
const getEmbedUrl = (url) => {
  if (!url) return null;
  // Déjà au format embed
  if (url.includes("youtube.com/embed/")) return url;
  // Format watch
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // Format youtu.be
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
};
export default ArticleDetailPage;

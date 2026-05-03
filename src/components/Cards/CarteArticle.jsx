/**
 * CarteArticle — composant card pour afficher un aperçu d'article.
 *
 * Inclut un bouton Like avec compteur et animation.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";
import { useToast } from "../UI/Toast";
import styles from "./CarteArticle.module.css";

function CarteArticle({ article }) {
  const { utilisateur } = useAuth();
  const { addToast } = useToast();
  const { _id, titre, contenu, categorie, auteur, createdAt, imageUrl, tags } =
    article;

  const [likesCount, setLikesCount] = useState(article.likes?.length || 0);
  const [liked, setLiked] = useState(
    article.likes?.includes(utilisateur?.id) || false,
  );
  const [animating, setAnimating] = useState(false);

  const extraitContenu =
    contenu.length > 120 ? contenu.slice(0, 120) + "..." : contenu;

  const dateFormatee = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!utilisateur) {
      addToast("Connecte-toi pour liker !", "info");
      return;
    }

    // Animation optimiste
    setAnimating(true);
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await api.post(`/api/articles/${_id}/like`);
      setLikesCount(res.data.totalLikes);
      setLiked(res.data.liked);
    } catch {
      // Rollback si erreur
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
      addToast("Erreur lors du like", "error");
    }
  };

  return (
    <article className={`${styles.carte} carte-article`}>
      {imageUrl && (
        <div className={styles.vignette}>
          <img src={imageUrl} alt={titre} className={styles.vignetteImg} />
        </div>
      )}

      <div className={styles.corps}>
        <div className={styles.entete}>
          <div className={styles.meta}>
            <Badge texte={categorie} variante="primaire" />
            {tags && tags.map(tag => (
              <Link key={tag} to={`/articles?tag=${tag}`} className={styles.tagLien}>#{tag}</Link>
            ))}
          </div>
          <span className={styles.date}>{dateFormatee}</span>
        </div>

        <h3 className={styles.titre}>{titre}</h3>
        <p className={styles.extrait}>{extraitContenu}</p>

        <div className={styles.pied}>
          <span className={styles.auteur}>
            Par <strong>{auteur?.nom ?? "Auteur inconnu"}</strong>
          </span>
          <div className={styles.piedDroit}>
            <button
              className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ""} ${animating ? styles.likeBtnPulse : ""}`}
              onClick={handleLike}
              aria-label={liked ? "Retirer le like" : "Liker cet article"}>
              <span className={styles.likeIcon}>{liked ? "❤️" : "🤍"}</span>
              <span className={styles.likeCount}>{likesCount}</span>
            </button>
            <Link to={`/articles/${_id}`} className={styles.lien}>
              Lire →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CarteArticle;

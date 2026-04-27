/**
 * CarteArticle — composant card pour afficher un aperçu d'article.
 *
 * Utilisé dans la liste des articles (ArticlesPage) et sur la page d'accueil (HomePage).
 *
 * Props :
 * - article : objet contenant les données de l'article
 *   - _id       : identifiant MongoDB (utilisé pour le lien de détail)
 *   - titre     : titre de l'article
 *   - contenu   : texte complet de l'article (tronqué à 120 caractères pour l'aperçu)
 *   - categorie : catégorie de l'article (ex: "Peinture", "Musique")
 *   - auteur    : objet { nom } de l'auteur (peut être null → "Auteur inconnu")
 *   - createdAt : date de création au format ISO (formatée en français)
 *
 * Structure de la carte :
 * - En-tête : Badge de catégorie + date formatée
 * - Corps   : titre + extrait du contenu (120 premiers caractères)
 * - Pied    : nom de l'auteur + lien "Lire la suite →"
 */
import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteArticle.module.css";

function CarteArticle({ article }) {
  const { _id, titre, contenu, categorie, auteur, createdAt, imageUrl } =
    article;

  const extraitContenu =
    contenu.length > 120 ? contenu.slice(0, 120) + "..." : contenu;

  const dateFormatee = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className={styles.carte}>
      {imageUrl && (
        <div className={styles.vignette}>
          <img src={imageUrl} alt={titre} className={styles.vignetteImg} />
        </div>
      )}

      <div className={styles.corps}>
        <div className={styles.entete}>
          <Badge texte={categorie} variante="primaire" />
          <span className={styles.date}>{dateFormatee}</span>
        </div>

        <h3 className={styles.titre}>{titre}</h3>
        <p className={styles.extrait}>{extraitContenu}</p>

        <div className={styles.pied}>
          <span className={styles.auteur}>
            Par <strong>{auteur?.nom ?? "Auteur inconnu"}</strong>
          </span>
          <Link to={`/articles/${_id}`} className={styles.lien}>
            Lire la suite →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CarteArticle;

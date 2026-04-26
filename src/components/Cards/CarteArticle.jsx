import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteArticle.module.css";

function CarteArticle({ article }) {
  const { _id, titre, contenu, categorie, auteur, createdAt } = article;

  const extraitContenu =
    contenu.length > 120 ? contenu.slice(0, 120) + "..." : contenu;

  const dateFormatee = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className={styles.carte}>
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
    </article>
  );
}

export default CarteArticle;

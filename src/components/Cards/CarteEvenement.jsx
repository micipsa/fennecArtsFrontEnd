import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteEvenement.module.css";

function CarteEvenement({ evenement }) {
  const {
    _id,
    titre,
    description,
    categorie,
    lieu,
    dateDebut,
    dateFin,
    adherents,
  } = evenement;

  const extraitDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const estFutur = new Date(dateDebut) > new Date();
  const varianteBadgeStatut = estFutur ? "succes" : "defaut";
  const texteStatut = estFutur ? "À venir" : "Passé";

  return (
    <article className={styles.carte}>
      <div className={styles.entete}>
        <Badge texte={categorie} variante="primaire" />
        <Badge texte={texteStatut} variante={varianteBadgeStatut} />
      </div>

      <h3 className={styles.titre}>{titre}</h3>
      <p className={styles.description}>{extraitDescription}</p>

      <div className={styles.infos}>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>📍</span>
          <span>{lieu}</span>
        </div>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>📅</span>
          <span>
            {formatDate(dateDebut)} → {formatDate(dateFin)}
          </span>
        </div>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>👥</span>
          <span>{adherents?.length ?? 0} participant(s)</span>
        </div>
      </div>

      <div className={styles.pied}>
        <Link to={`/events/${_id}`} className={styles.lien}>
          Voir l'événement →
        </Link>
      </div>
    </article>
  );
}

export default CarteEvenement;

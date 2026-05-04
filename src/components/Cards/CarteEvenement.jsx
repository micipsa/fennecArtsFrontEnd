/**
 * CarteEvenement — composant card pour afficher un aperçu d'événement.
 *
 * Utilisé dans la liste des événements (EventsPage) et sur la page d'accueil (HomePage).
 *
 * Props :
 * - evenement : objet contenant les données de l'événement
 *   - _id         : identifiant MongoDB
 *   - titre       : titre de l'événement
 *   - description : description complète (tronquée à 100 caractères pour l'aperçu)
 *   - categorie   : catégorie (ex: "Exposition", "Concert")
 *   - lieu        : lieu de l'événement
 *   - dateDebut   : date de début (format ISO)
 *   - dateFin     : date de fin (format ISO)
 *   - adherents   : tableau des adhérents inscrits
 *
 * Logique métier :
 * - L'événement est considéré "à venir" si dateDebut > maintenant.
 * - Le Badge de statut change de couleur selon que l'événement est passé ou à venir.
 */
import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteEvenement.module.css";

function CarteEvenement({ evenement }) {
  // Destructuration des propriétés de l'événement
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

  // Troncature de la description à 100 caractères pour l'aperçu
  // Suppression des balises HTML pour l'extrait
  const descriptionPure = description.replace(/<[^>]*>/g, "");
  const extraitDescription =
    descriptionPure.length > 100 ? descriptionPure.slice(0, 100) + "..." : descriptionPure;

  // Fonction utilitaire pour formater une date ISO en français
  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Détermination du statut : "à venir" ou "passé"
  const estFutur = new Date(dateDebut) > new Date();
  const varianteBadgeStatut = estFutur ? "succes" : "defaut"; // Vert ou gris
  const texteStatut = estFutur ? "À venir" : "Passé";

  return (
    <article className={styles.carte}>
      {/* En-tête : Badge de catégorie + Badge de statut (à venir / passé) */}
      <div className={styles.entete}>
        <Badge texte={categorie} variante="primaire" />
        <Badge texte={texteStatut} variante={varianteBadgeStatut} />
      </div>

      {/* Titre et description tronquée */}
      <h3 className={styles.titre}>{titre}</h3>
      <p className={styles.description}>{extraitDescription}</p>

      {/* Informations pratiques : lieu, dates, nombre de participants */}
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
          {/* Optional chaining pour gérer le cas où adherents est undefined */}
          <span>{adherents?.length ?? 0} participant(s)</span>
        </div>
      </div>

      {/* Pied : lien vers la page de détail de l'événement */}
      <div className={styles.pied}>
        <Link to={`/events/${_id}`} className={styles.lien}>
          Voir l'événement →
        </Link>
      </div>
    </article>
  );
}

export default CarteEvenement;

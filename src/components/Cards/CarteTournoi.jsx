/**
 * CarteTournoi — composant card pour afficher un aperçu de tournoi.
 *
 * Utilisé dans la liste des tournois (TournamentsPage) et sur la page d'accueil (HomePage).
 *
 * Props :
 * - tournoi : objet contenant les données du tournoi
 *   - _id                    : identifiant MongoDB
 *   - titre                  : nom du tournoi
 *   - description            : description (tronquée à 100 caractères)
 *   - jeu                    : nom du jeu (ex: "Tekken 8", "Street Fighter 6")
 *   - format                 : format du tournoi (ex: "1v1", "2v2", "équipes")
 *   - lieu                   : lieu du tournoi
 *   - dateDebut              : date de début (format ISO)
 *   - nombreMaxParticipants  : nombre maximum de joueurs autorisés
 *   - participants           : tableau des joueurs inscrits
 *   - statut                 : statut actuel ("ouvert", "complet", "en_cours", "terminé")
 *
 * Fonctionnalités visuelles spécifiques :
 * - Barre de progression montrant le taux de remplissage des inscriptions.
 * - Badge de statut coloré selon l'état du tournoi.
 * - Affichage du nombre de places restantes.
 */
import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteTournoi.module.css";

function CarteTournoi({ tournoi }) {
  // Destructuration des propriétés du tournoi
  const {
    _id,
    titre,
    description,
    jeu,
    format,
    lieu,
    dateDebut,
    nombreMaxParticipants,
    participants,
    statut,
  } = tournoi;

  // Troncature de la description à 100 caractères pour l'aperçu
  const extraitDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  // Fonction utilitaire pour formater une date ISO en français
  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Mapping statut → variante de couleur du Badge
  const varianteStatut = {
    ouvert: "succes",         // Vert
    complet: "avertissement", // Orange
    en_cours: "info",         // Bleu
    terminé: "defaut",        // Gris
  };

  // Calcul des places restantes et du pourcentage de remplissage
  const placesRestantes = nombreMaxParticipants - (participants?.length ?? 0);
  const pourcentageRempli =
    ((participants?.length ?? 0) / nombreMaxParticipants) * 100;

  return (
    <article className={styles.carte}>
      {/* En-tête : Badge du jeu + Badge du statut */}
      <div className={styles.entete}>
        <Badge texte={jeu} variante="primaire" />
        <Badge texte={statut} variante={varianteStatut[statut] ?? "defaut"} />
      </div>

      {/* Titre et description tronquée */}
      <h3 className={styles.titre}>{titre}</h3>
      <p className={styles.description}>{extraitDescription}</p>

      {/* Informations pratiques : format, lieu, date */}
      <div className={styles.infos}>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>🎮</span>
          <span>
            Format : <strong>{format}</strong>
          </span>
        </div>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>📍</span>
          <span>{lieu}</span>
        </div>
        <div className={styles.infoLigne}>
          <span className={styles.infoIcone}>📅</span>
          <span>{formatDate(dateDebut)}</span>
        </div>
      </div>

      {/* ── Barre de progression des inscriptions ── */}
      <div className={styles.progression}>
        {/* Texte : "X / Y participants" + "Z place(s) restante(s)" ou "Complet" */}
        <div className={styles.progressionTexte}>
          <span>
            {participants?.length ?? 0} / {nombreMaxParticipants} participants
          </span>
          <span>
            {placesRestantes > 0
              ? `${placesRestantes} place(s) restante(s)`
              : "Complet"}
          </span>
        </div>
        {/* Barre visuelle de progression (largeur dynamique via style inline) */}
        <div className={styles.progressionBarre}>
          <div
            className={styles.progressionRempli}
            style={{ width: `${pourcentageRempli}%` }}
          />
        </div>
      </div>

      {/* Pied : lien vers la page de détail du tournoi */}
      <div className={styles.pied}>
        <Link to={`/tournaments/${_id}`} className={styles.lien}>
          Voir le tournoi →
        </Link>
      </div>
    </article>
  );
}

export default CarteTournoi;

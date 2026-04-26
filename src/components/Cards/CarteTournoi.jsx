import { Link } from "react-router-dom";
import Badge from "../UI/Badge";
import styles from "./CarteTournoi.module.css";

function CarteTournoi({ tournoi }) {
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

  const extraitDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const varianteStatut = {
    ouvert: "succes",
    complet: "avertissement",
    en_cours: "info",
    terminé: "defaut",
  };

  const placesRestantes = nombreMaxParticipants - (participants?.length ?? 0);
  const pourcentageRempli =
    ((participants?.length ?? 0) / nombreMaxParticipants) * 100;

  return (
    <article className={styles.carte}>
      <div className={styles.entete}>
        <Badge texte={jeu} variante="primaire" />
        <Badge texte={statut} variante={varianteStatut[statut] ?? "defaut"} />
      </div>

      <h3 className={styles.titre}>{titre}</h3>
      <p className={styles.description}>{extraitDescription}</p>

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

      <div className={styles.progression}>
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
        <div className={styles.progressionBarre}>
          <div
            className={styles.progressionRempli}
            style={{ width: `${pourcentageRempli}%` }}
          />
        </div>
      </div>

      <div className={styles.pied}>
        <Link to={`/tournaments/${_id}`} className={styles.lien}>
          Voir le tournoi →
        </Link>
      </div>
    </article>
  );
}

export default CarteTournoi;

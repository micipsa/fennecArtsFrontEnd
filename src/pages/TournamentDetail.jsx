import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import useAuth from "../hooks/useAuth";
import styles from "./TournamentDetail.module.css";

function TournamentDetail() {
  const { id } = useParams();
  const { utilisateur } = useAuth();
  const [tournoi, setTournoi] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get(`/api/tournaments/${id}`);
        setTournoi(res.data.data);
      } catch (err) {
        setErreur("Tournoi introuvable.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [id]);

  const estInscrit =
    utilisateur &&
    tournoi?.participants?.some(
      (p) => p._id === utilisateur.id || p === utilisateur.id,
    );

  const handleInscrire = async () => {
    if (!utilisateur) return;
    setActionEnCours(true);
    setMessageAction(null);
    try {
      const res = await api.post(`/api/tournaments/${id}/inscrire`);
      setTournoi(res.data.data);
      setMessageAction({ type: "succes", texte: "Inscription confirmée !" });
    } catch (err) {
      setMessageAction({
        type: "erreur",
        texte: err.response?.data?.message || "Erreur lors de l'inscription.",
      });
    } finally {
      setActionEnCours(false);
    }
  };

  const handleDesinscrire = async () => {
    if (!utilisateur) return;
    setActionEnCours(true);
    setMessageAction(null);
    try {
      const res = await api.delete(`/api/tournaments/${id}/inscrire`);
      setTournoi(res.data.data);
      setMessageAction({ type: "succes", texte: "Désinscription effectuée." });
    } catch (err) {
      setMessageAction({
        type: "erreur",
        texte:
          err.response?.data?.message || "Erreur lors de la désinscription.",
      });
    } finally {
      setActionEnCours(false);
    }
  };

  if (chargement) return <Spinner />;

  if (erreur)
    return (
      <div className="container">
        <MessageErreur message={erreur} />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/tournaments" className="btn btn-outline">
            Retour aux tournois
          </Link>
        </div>
      </div>
    );

  if (!tournoi) return null;

  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const placesRestantes =
    tournoi.nombreMaxParticipants - (tournoi.participants?.length ?? 0);
  const pourcentage =
    ((tournoi.participants?.length ?? 0) / tournoi.nombreMaxParticipants) * 100;

  const varianteStatut = {
    ouvert: "succes",
    complet: "avertissement",
    en_cours: "info",
    terminé: "defaut",
  };

  return (
    <div className="container">
      <div className={styles.page}>
        <Link to="/tournaments" className={styles.retour}>
          ← Retour aux tournois
        </Link>

        <div className={styles.entete}>
          <div className={styles.meta}>
            <Badge texte={tournoi.jeu} variante="primaire" />
            <Badge
              texte={tournoi.statut}
              variante={varianteStatut[tournoi.statut]}
            />
            <Badge texte={tournoi.format} variante="info" />
          </div>

          <h1 className={styles.titre}>{tournoi.titre}</h1>

          <div className={styles.separateur} />

          <div className={styles.infosGrille}>
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📍</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Lieu</span>
                <span className={styles.infoValeur}>{tournoi.lieu}</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📅</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Début</span>
                <span className={styles.infoValeur}>
                  {formatDate(tournoi.dateDebut)}
                </span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>🏁</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Fin</span>
                <span className={styles.infoValeur}>
                  {formatDate(tournoi.dateFin)}
                </span>
              </div>
            </div>
            {tournoi.prize && (
              <div className={styles.infoCard}>
                <span className={styles.infoIcone}>🥇</span>
                <div className={styles.infoTexte}>
                  <span className={styles.infoLabel}>Récompense</span>
                  <span className={styles.infoValeur}>{tournoi.prize}</span>
                </div>
              </div>
            )}
            {tournoi.organisateur && (
              <div className={styles.infoCard}>
                <span className={styles.infoIcone}>🎭</span>
                <div className={styles.infoTexte}>
                  <span className={styles.infoLabel}>Organisateur</span>
                  <span className={styles.infoValeur}>
                    {tournoi.organisateur.nom}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.progressionSection}>
          <div className={styles.progressionTexte}>
            <span className={styles.progressionNombre}>
              {tournoi.participants?.length ?? 0} /{" "}
              {tournoi.nombreMaxParticipants}
            </span>
            <span className={styles.progressionLabel}>
              {placesRestantes > 0
                ? `${placesRestantes} place(s) restante(s)`
                : "🔥 Complet"}
            </span>
          </div>
          <div className={styles.progressionBarre}>
            <div
              className={styles.progressionRempli}
              style={{ width: `${pourcentage}%` }}
            />
          </div>
        </div>

        {messageAction && (
          <div className={`${styles.message} ${styles[messageAction.type]}`}>
            {messageAction.texte}
          </div>
        )}

        <div className={styles.actionSection}>
          {!utilisateur ? (
            <div className={styles.nonConnecte}>
              <p>Connectez-vous pour vous inscrire à ce tournoi.</p>
              <Link to="/login" className={styles.btnConnexion}>
                Se connecter
              </Link>
            </div>
          ) : tournoi.statut === "terminé" ? (
            <p className={styles.termine}>Ce tournoi est terminé.</p>
          ) : estInscrit ? (
            <div className={styles.inscritBloc}>
              <p className={styles.inscritTexte}>
                ✅ Vous êtes inscrit à ce tournoi
              </p>
              <button
                className={styles.btnDesinscrire}
                onClick={handleDesinscrire}
                disabled={actionEnCours}>
                {actionEnCours ? "En cours..." : "Se désinscrire"}
              </button>
            </div>
          ) : tournoi.statut === "complet" ? (
            <p className={styles.complet}>🔥 Ce tournoi est complet.</p>
          ) : (
            <button
              className={styles.btnInscrire}
              onClick={handleInscrire}
              disabled={actionEnCours}>
              {actionEnCours ? "Inscription..." : "🎮 S'inscrire au tournoi"}
            </button>
          )}
        </div>

        <div className={styles.separateur} />

        <div className={styles.contenu}>
          {tournoi.description
            .split("\n")
            .map(
              (paragraphe, index) =>
                paragraphe.trim() && <p key={index}>{paragraphe}</p>,
            )}
        </div>

        {tournoi.participants?.length > 0 && (
          <div className={styles.participantsSection}>
            <h2 className={styles.participantsTitre}>
              Participants inscrits ({tournoi.participants.length})
            </h2>
            <div className={styles.participantsGrille}>
              {tournoi.participants.map((p, index) => (
                <div key={p._id ?? index} className={styles.participantCard}>
                  <div className={styles.participantAvatar}>
                    {(p.nom ?? "U")[0].toUpperCase()}
                  </div>
                  <span className={styles.participantNom}>
                    {p.nom ?? "Participant"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TournamentDetail;

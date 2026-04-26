/**
 * TournamentDetail — page de détail d'un tournoi individuel.
 *
 * C'est la page la plus complexe de l'application. Elle affiche :
 * - Les métadonnées du tournoi (jeu, statut, format) via des Badges
 * - Les informations pratiques (lieu, dates, récompense, organisateur)
 * - Une barre de progression des inscriptions
 * - Des actions contextuelles selon l'état de l'utilisateur :
 *   - Non connecté → lien vers la page de connexion
 *   - Tournoi terminé → message informatif
 *   - Déjà inscrit → message de confirmation + bouton de désinscription
 *   - Tournoi complet → message "Complet"
 *   - Sinon → bouton d'inscription
 * - La description complète du tournoi
 * - La liste des participants inscrits (avec avatars)
 *
 * Principales interactions avec l'API :
 * - GET    /api/tournaments/:id          → charger le tournoi
 * - POST   /api/tournaments/:id/inscrire → s'inscrire
 * - DELETE /api/tournaments/:id/inscrire → se désinscrire
 */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import useAuth from "../hooks/useAuth";
import styles from "./TournamentDetail.module.css";

function TournamentDetail() {
  // Récupération de l'id depuis l'URL
  const { id } = useParams();
  // Récupération de l'utilisateur connecté (peut être null)
  const { utilisateur } = useAuth();

  const [tournoi, setTournoi] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  // State pour désactiver les boutons d'inscription/désinscription pendant l'envoi
  const [actionEnCours, setActionEnCours] = useState(false);
  // Message de feedback après une action (succès ou erreur)
  const [messageAction, setMessageAction] = useState(null);

  // ── Chargement du tournoi au montage ──
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

  /**
   * Vérifie si l'utilisateur connecté est déjà inscrit au tournoi.
   * Compare l'id de l'utilisateur avec les ids dans le tableau `participants`.
   * Les participants peuvent être des objets populés (p._id) ou des ids simples (p).
   */
  const estInscrit =
    utilisateur &&
    tournoi?.participants?.some(
      (p) => p._id === utilisateur.id || p === utilisateur.id,
    );

  /**
   * Gestionnaire d'inscription au tournoi.
   * Envoie un POST à l'API et met à jour le state local avec les nouvelles données.
   */
  const handleInscrire = async () => {
    if (!utilisateur) return; // Sécurité : ne rien faire si pas connecté
    setActionEnCours(true);
    setMessageAction(null);
    try {
      const res = await api.post(`/api/tournaments/${id}/inscrire`);
      setTournoi(res.data.data); // Mise à jour avec les données à jour (nouveau participant)
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

  /**
   * Gestionnaire de désinscription du tournoi.
   * Envoie un DELETE à l'API et met à jour le state local.
   */
  const handleDesinscrire = async () => {
    if (!utilisateur) return;
    setActionEnCours(true);
    setMessageAction(null);
    try {
      const res = await api.delete(`/api/tournaments/${id}/inscrire`);
      setTournoi(res.data.data); // Mise à jour (participant retiré)
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

  // Affichage pendant le chargement
  if (chargement) return <Spinner />;

  // Affichage en cas d'erreur
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

  // Fonction utilitaire de formatage de date avec heure
  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calcul des places restantes et du pourcentage de remplissage
  const placesRestantes =
    tournoi.nombreMaxParticipants - (tournoi.participants?.length ?? 0);
  const pourcentage =
    ((tournoi.participants?.length ?? 0) / tournoi.nombreMaxParticipants) * 100;

  // Mapping statut → variante de couleur du Badge
  const varianteStatut = {
    ouvert: "succes",
    complet: "avertissement",
    en_cours: "info",
    terminé: "defaut",
  };

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Lien de retour */}
        <Link to="/tournaments" className={styles.retour}>
          ← Retour aux tournois
        </Link>

        {/* ══════════════════════════════════════════════
            En-tête du tournoi
            ══════════════════════════════════════════════ */}
        <div className={styles.entete}>
          {/* Badges : jeu + statut + format */}
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

          {/* ── Grille des informations pratiques ── */}
          <div className={styles.infosGrille}>
            {/* Lieu */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📍</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Lieu</span>
                <span className={styles.infoValeur}>{tournoi.lieu}</span>
              </div>
            </div>
            {/* Date de début */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📅</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Début</span>
                <span className={styles.infoValeur}>
                  {formatDate(tournoi.dateDebut)}
                </span>
              </div>
            </div>
            {/* Date de fin */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>🏁</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Fin</span>
                <span className={styles.infoValeur}>
                  {formatDate(tournoi.dateFin)}
                </span>
              </div>
            </div>
            {/* Récompense (affichée seulement si elle existe) */}
            {tournoi.prize && (
              <div className={styles.infoCard}>
                <span className={styles.infoIcone}>🥇</span>
                <div className={styles.infoTexte}>
                  <span className={styles.infoLabel}>Récompense</span>
                  <span className={styles.infoValeur}>{tournoi.prize}</span>
                </div>
              </div>
            )}
            {/* Organisateur (affiché seulement si il existe) */}
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

        {/* ══════════════════════════════════════════════
            Barre de progression des inscriptions
            ══════════════════════════════════════════════ */}
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
          {/* Barre visuelle (largeur dynamique) */}
          <div className={styles.progressionBarre}>
            <div
              className={styles.progressionRempli}
              style={{ width: `${pourcentage}%` }}
            />
          </div>
        </div>

        {/* Message de feedback après inscription/désinscription */}
        {messageAction && (
          <div className={`${styles.message} ${styles[messageAction.type]}`}>
            {messageAction.texte}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            Zone d'action : inscription / désinscription
            Affichage contextuel selon l'état de l'utilisateur
            ══════════════════════════════════════════════ */}
        <div className={styles.actionSection}>
          {!utilisateur ? (
            // Cas 1 : Non connecté → lien de connexion
            <div className={styles.nonConnecte}>
              <p>Connectez-vous pour vous inscrire à ce tournoi.</p>
              <Link to="/login" className={styles.btnConnexion}>
                Se connecter
              </Link>
            </div>
          ) : tournoi.statut === "terminé" ? (
            // Cas 2 : Tournoi terminé
            <p className={styles.termine}>Ce tournoi est terminé.</p>
          ) : estInscrit ? (
            // Cas 3 : Utilisateur déjà inscrit → possibilité de se désinscrire
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
            // Cas 4 : Tournoi complet
            <p className={styles.complet}>🔥 Ce tournoi est complet.</p>
          ) : (
            // Cas 5 : Tournoi ouvert → bouton d'inscription
            <button
              className={styles.btnInscrire}
              onClick={handleInscrire}
              disabled={actionEnCours}>
              {actionEnCours ? "Inscription..." : "🎮 S'inscrire au tournoi"}
            </button>
          )}
        </div>

        <div className={styles.separateur} />

        {/* ── Description complète du tournoi ── */}
        <div className={styles.contenu}>
          {tournoi.description
            .split("\n")
            .map(
              (paragraphe, index) =>
                paragraphe.trim() && <p key={index}>{paragraphe}</p>,
            )}
        </div>

        {/* ══════════════════════════════════════════════
            Liste des participants inscrits
            ══════════════════════════════════════════════ */}
        {tournoi.participants?.length > 0 && (
          <div className={styles.participantsSection}>
            <h2 className={styles.participantsTitre}>
              Participants inscrits ({tournoi.participants.length})
            </h2>
            <div className={styles.participantsGrille}>
              {tournoi.participants.map((p, index) => (
                <div key={p._id ?? index} className={styles.participantCard}>
                  {/* Avatar avec l'initiale du nom du participant */}
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

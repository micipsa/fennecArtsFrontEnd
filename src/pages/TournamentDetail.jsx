import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import BracketVisuel from "../components/UI/BracketVisuel";
import useAuth from "../hooks/useAuth";
import styles from "./TournamentDetail.module.css";

const FORMATS_EQUIPE = ["2v2", "4v4", "équipes"];

function TournamentDetail() {
  const { id } = useParams();
  const { utilisateur } = useAuth();

  const [tournoi, setTournoi] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState(null);

  // Inscription équipe
  const [nomEquipe, setNomEquipe] = useState("");

  // Admin : génération bracket
  const [generationEnCours, setGenerationEnCours] = useState(false);

  // Admin : modal résultat de match
  const [matchSelecte, setMatchSelecte] = useState(null);
  const [gagnantInput, setGagnantInput] = useState("");
  const [score1Input, setScore1Input] = useState("");
  const [score2Input, setScore2Input] = useState("");
  const [envoiMatch, setEnvoiMatch] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get(`/api/tournaments/${id}`);
        setTournoi(res.data.data);
      } catch {
        setErreur("Tournoi introuvable.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [id]);

  const isAdmin = utilisateur?.role === "admin";
  const isFormatEquipe = FORMATS_EQUIPE.includes(tournoi?.format);

  // Vérifie si l'utilisateur connecté est déjà inscrit (joueur ou capitaine)
  const estInscrit =
    utilisateur &&
    tournoi?.participants?.some(
      (p) =>
        p.joueur?.toString() === utilisateur.id ||
        p.capitaine?.toString() === utilisateur.id
    );

  // ── Inscription ───────────────────────────────────────────────────────────
  const handleInscrire = async () => {
    if (!utilisateur) return;
    if (isFormatEquipe && !nomEquipe.trim()) return;
    setActionEnCours(true);
    setMessageAction(null);
    try {
      const body = isFormatEquipe ? { nomEquipe: nomEquipe.trim() } : {};
      const res = await api.post(`/api/tournaments/${id}/inscrire`, body);
      setTournoi(res.data.data);
      setNomEquipe("");
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

  // ── Désinscription ────────────────────────────────────────────────────────
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

  // ── Génération du bracket (admin) ─────────────────────────────────────────
  const handleGenererBracket = async () => {
    if (!window.confirm("Générer le bracket maintenant ? Cette action est irréversible.")) return;
    setGenerationEnCours(true);
    try {
      const res = await api.post(`/api/tournaments/${id}/generer-bracket`);
      setTournoi(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la génération.");
    } finally {
      setGenerationEnCours(false);
    }
  };

  // ── Ouverture de la modal résultat ────────────────────────────────────────
  const handleOuvrirMatch = (match) => {
    setMatchSelecte(match);
    setGagnantInput("");
    setScore1Input("");
    setScore2Input("");
  };

  // ── Envoi du résultat d'un match (admin) ──────────────────────────────────
  const handleSaisirResultat = async () => {
    if (!gagnantInput) return;
    setEnvoiMatch(true);
    try {
      const body = {
        gagnant: gagnantInput,
        score1: score1Input !== "" ? Number(score1Input) : null,
        score2: score2Input !== "" ? Number(score2Input) : null,
      };
      const res = await api.put(
        `/api/tournaments/${id}/matchs/${matchSelecte._id}`,
        body
      );
      setTournoi(res.data.data);
      setMatchSelecte(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la saisie.");
    } finally {
      setEnvoiMatch(false);
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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
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

        {/* ── En-tête ── */}
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

        {/* ── Barre de progression ── */}
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

        {/* ── Message feedback ── */}
        {messageAction && (
          <div className={`${styles.message} ${styles[messageAction.type]}`}>
            {messageAction.texte}
          </div>
        )}

        {/* ── Zone d'action inscription / désinscription ── */}
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
          ) : isFormatEquipe ? (
            // Inscription équipe : saisie du nom d'équipe
            <div className={styles.inscriptionEquipe}>
              <input
                className={styles.inputEquipe}
                type="text"
                placeholder="Nom de votre équipe"
                value={nomEquipe}
                onChange={(e) => setNomEquipe(e.target.value)}
                maxLength={40}
              />
              <button
                className={styles.btnInscrire}
                onClick={handleInscrire}
                disabled={!nomEquipe.trim() || actionEnCours}>
                {actionEnCours ? "Inscription..." : "🎮 Inscrire mon équipe"}
              </button>
            </div>
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

        {/* ── Description ── */}
        <div className={styles.contenu}>
          {tournoi.description
            .split("\n")
            .map(
              (p, i) => p.trim() && <p key={i}>{p}</p>
            )}
        </div>

        {/* ════════════════════════════════════════════════
            Bracket
            ════════════════════════════════════════════════ */}
        <div className={styles.bracketSection}>
          <h2 className={styles.participantsTitre}>Bracket</h2>

          {/* Bouton admin : générer le bracket */}
          {isAdmin && !tournoi.hasBracket && tournoi.participants.length >= 2 && (
            <button
              className={styles.btnGenererBracket}
              onClick={handleGenererBracket}
              disabled={generationEnCours}>
              {generationEnCours ? "Génération..." : "⚡ Générer le bracket"}
            </button>
          )}

          {tournoi.hasBracket && tournoi.matchs?.length > 0 ? (
            <>
              {isAdmin && (
                <p className={styles.indicationAdmin}>
                  Cliquez sur un match souligné en rouge pour saisir le résultat.
                </p>
              )}
              <BracketVisuel
                matchs={tournoi.matchs}
                onClicMatch={handleOuvrirMatch}
                isAdmin={isAdmin}
              />
            </>
          ) : !isAdmin ? (
            <p className={styles.bracketAttente}>
              Le bracket sera disponible dès le lancement du tournoi.
            </p>
          ) : null}
        </div>

        {/* ── Liste des participants ── */}
        {tournoi.participants?.length > 0 && (
          <div className={styles.participantsSection}>
            <h2 className={styles.participantsTitre}>
              Participants inscrits ({tournoi.participants.length})
            </h2>
            <div className={styles.participantsGrille}>
              {tournoi.participants.map((p, i) => (
                <div key={i} className={styles.participantCard}>
                  <div className={styles.participantAvatar}>
                    {(p.nomAffiche?.[0] ?? "?").toUpperCase()}
                  </div>
                  <span className={styles.participantNom}>
                    {p.nomAffiche ?? "Participant"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          Modal saisie résultat (admin)
          ════════════════════════════════════════════════ */}
      {matchSelecte && (
        <div
          className={styles.overlay}
          onClick={() => setMatchSelecte(null)}>
          <div
            className={styles.modaleMatch}
            onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleMatchEntete}>
              <h3 className={styles.modaleMatchTitre}>
                Résultat — Round {matchSelecte.round}
              </h3>
              <button
                className={styles.modaleFermer}
                onClick={() => setMatchSelecte(null)}>
                ✕
              </button>
            </div>

            {/* Sélection du gagnant */}
            <p className={styles.modaleMatchLabel}>Sélectionner le gagnant</p>
            <div className={styles.versusBloc}>
              <button
                className={[
                  styles.btnJoueur,
                  gagnantInput === matchSelecte.participant1?.nomAffiche
                    ? styles.btnJoueurActif
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setGagnantInput(matchSelecte.participant1?.nomAffiche)
                }>
                {matchSelecte.participant1?.nomAffiche}
              </button>
              <span className={styles.vs}>VS</span>
              <button
                className={[
                  styles.btnJoueur,
                  gagnantInput === matchSelecte.participant2?.nomAffiche
                    ? styles.btnJoueurActif
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setGagnantInput(matchSelecte.participant2?.nomAffiche)
                }>
                {matchSelecte.participant2?.nomAffiche}
              </button>
            </div>

            {/* Scores (optionnels) */}
            <p className={styles.modaleMatchLabel}>Scores (optionnel)</p>
            <div className={styles.scoresBloc}>
              <input
                className={styles.scoreInput}
                type="number"
                min="0"
                placeholder="0"
                value={score1Input}
                onChange={(e) => setScore1Input(e.target.value)}
              />
              <span className={styles.tiret}>—</span>
              <input
                className={styles.scoreInput}
                type="number"
                min="0"
                placeholder="0"
                value={score2Input}
                onChange={(e) => setScore2Input(e.target.value)}
              />
            </div>

            <div className={styles.modaleMatchActions}>
              <button
                className={styles.btnAnnuler}
                onClick={() => setMatchSelecte(null)}>
                Annuler
              </button>
              <button
                className={styles.btnConfirmer}
                onClick={handleSaisirResultat}
                disabled={!gagnantInput || envoiMatch}>
                {envoiMatch ? "Enregistrement..." : "Confirmer le résultat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentDetail;

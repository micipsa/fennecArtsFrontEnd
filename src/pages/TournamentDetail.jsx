import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Commentaires from "../components/UI/Commentaires";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import BracketVisuel from "../components/UI/BracketVisuel";
import BracketDoubleElim from "../components/UI/BracketDoubleElim";
import useAuth from "../hooks/useAuth";
import AvatarIcon from "../components/UI/AvatarIcon";
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

  const [nomEquipe, setNomEquipe] = useState("");
  const [generationEnCours, setGenerationEnCours] = useState(false);

  // ── Modal résultat — élimination simple ──────────────────────────────────
  const [matchSelecte, setMatchSelecte] = useState(null);

  // ── Modal résultat — double élimination ──────────────────────────────────
  // { match, zone: "WB"|"LB"|"GF", matchType: "match1"|"reset"|null }
  const [matchDoubleSelecte, setMatchDoubleSelecte] = useState(null);

  // Champs communs aux deux modals
  const [gagnantInput, setGagnantInput] = useState("");
  const [score1Input, setScore1Input] = useState("");
  const [score2Input, setScore2Input] = useState("");
  const [envoiMatch, setEnvoiMatch] = useState(false);

  // ── Modal Réclamation ─────────────────────────────────────────────────────
  const [reclamationOuverte, setReclamationOuverte] = useState(false);
  const [reclamationMessage, setReclamationMessage] = useState("");
  const [reclamationImage, setReclamationImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [envoiReclamation, setEnvoiReclamation] = useState(false);

  // ── Chargement ────────────────────────────────────────────────────────────
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

  const isAdmin = utilisateur?.role === "admin" || utilisateur?.role === "organisateur";
  const isFormatEquipe = FORMATS_EQUIPE.includes(tournoi?.format);

  const estInscrit =
    utilisateur &&
    tournoi?.participants?.some(
      (p) =>
        p.joueur?.toString() === utilisateur.id ||
        p.capitaine?.toString() === utilisateur.id,
    );

  // ── Inscription / Désinscription ──────────────────────────────────────────
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

  // ── Génération bracket simple ─────────────────────────────────────────────
  const handleGenererBracket = async () => {
    if (
      !window.confirm(
        "Générer le bracket (élimination simple) ? Cette action est irréversible.",
      )
    )
      return;
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

  // ── Génération bracket double élimination ─────────────────────────────────
  const handleGenererBracketDouble = async () => {
    if (
      !window.confirm(
        "Générer le bracket double élimination ? Cette action est irréversible.",
      )
    )
      return;
    setGenerationEnCours(true);
    try {
      const res = await api.post(
        `/api/tournaments/${id}/generer-bracket-double`,
      );
      setTournoi(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la génération.");
    } finally {
      setGenerationEnCours(false);
    }
  };

  // ── Ouverture modal — élimination simple ──────────────────────────────────
  const handleOuvrirMatch = (match) => {
    setMatchSelecte(match);
    setGagnantInput(match.gagnant?.nomAffiche || "");
    setScore1Input(match.score1 !== null && match.score1 !== undefined ? match.score1.toString() : "");
    setScore2Input(match.score2 !== null && match.score2 !== undefined ? match.score2.toString() : "");
  };

  // ── Ouverture modal — double élimination ──────────────────────────────────
  const handleOuvrirMatchDouble = (match, zone, matchType = null) => {
    setMatchDoubleSelecte({ match, zone, matchType });
    setGagnantInput(match.gagnant?.nomAffiche || "");
    setScore1Input(match.score1 !== null && match.score1 !== undefined ? match.score1.toString() : "");
    setScore2Input(match.score2 !== null && match.score2 !== undefined ? match.score2.toString() : "");
  };

  const fermerModal = () => {
    setMatchSelecte(null);
    setMatchDoubleSelecte(null);
    setReclamationOuverte(false);
    setReclamationMessage("");
    setReclamationImage("");
  };

  // ── Envoi résultat — élimination simple ───────────────────────────────────────
  const handleSaisirResultat = async () => {
    if (!gagnantInput) return;
    if (isAdmin && !window.confirm(`Valider le résultat : ${gagnantInput} gagne ?`)) return;
    setEnvoiMatch(true);
    try {
      const body = {
        gagnant: gagnantInput,
        score1: score1Input !== "" ? Number(score1Input) : null,
        score2: score2Input !== "" ? Number(score2Input) : null,
      };
      const url = isAdmin
        ? `/api/tournaments/${id}/matchs/${matchSelecte._id}`
        : `/api/tournaments/${id}/matchs/${matchSelecte._id}/report`;
      const res = await api.put(url, body);
      setTournoi(res.data.data);
      setMatchSelecte(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la saisie.");
    } finally {
      setEnvoiMatch(false);
    }
  };

  // ── Envoi résultat — double élimination ───────────────────────────────────
  const handleSaisirResultatDouble = async () => {
    if (!gagnantInput || !matchDoubleSelecte) return;
    if (isAdmin && !window.confirm(`Valider le résultat : ${gagnantInput} gagne ?`)) return;
    setEnvoiMatch(true);
    try {
      const { match, zone, matchType } = matchDoubleSelecte;
      const body = {
        gagnant: gagnantInput,
        score1: score1Input !== "" ? Number(score1Input) : null,
        score2: score2Input !== "" ? Number(score2Input) : null,
      };

      let url;
      if (isAdmin) {
        if (zone === "WB") url = `/api/tournaments/${id}/wb/${match._id}`;
        else if (zone === "LB") url = `/api/tournaments/${id}/lb/${match._id}`;
        else url = `/api/tournaments/${id}/gf/${matchType}`;
      } else {
        if (zone === "WB") url = `/api/tournaments/${id}/wb/${match._id}/report`;
        else if (zone === "LB") url = `/api/tournaments/${id}/lb/${match._id}/report`;
        else url = `/api/tournaments/${id}/gf/${matchType}/report`;
      }

      const res = await api.put(url, body);
      setTournoi(res.data.data);
      setMatchDoubleSelecte(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la saisie.");
    } finally {
      setEnvoiMatch(false);
    }
  };

  // ── Envoi d'une réclamation ────────────────────────────────────────────────
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du type de fichier
    const formatsAcceptes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!formatsAcceptes.includes(file.type)) {
      alert("Format d'image non supporté. Formats acceptés : JPEG, PNG, WEBP.");
      return;
    }

    // Validation de la taille de fichier (2 Mo max)
    const tailleMax = 2 * 1024 * 1024;
    if (file.size > tailleMax) {
      alert("L'image est trop volumineuse. Taille maximale autorisée : 2 Mo.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingImage(true);
    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReclamationImage(res.data.url);
    } catch (err) {
      alert("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSoumettreReclamation = async () => {
    if (!reclamationMessage || !reclamationImage) {
      alert("Veuillez fournir un message et une image de preuve.");
      return;
    }
    const activeMatch = matchSelecte || matchDoubleSelecte?.match;
    if (!activeMatch) return;

    setEnvoiReclamation(true);
    try {
      await api.post(`/api/reclamations`, {
        tournoiId: id,
        matchId: activeMatch._id || matchDoubleSelecte?.matchType,
        roundLabel: roundModal,
        message: reclamationMessage,
        imagePreuve: reclamationImage,
      });
      alert("Votre réclamation a été soumise avec succès ! L'organisateur sera notifié.");
      setReclamationOuverte(false);
      setReclamationMessage("");
      setReclamationImage("");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la soumission de la réclamation.");
    } finally {
      setEnvoiReclamation(false);
    }
  };


  // Champion du bracket simple = gagnant du match avec le round le plus élevé
  const championSimple =
    tournoi?.statut === "terminé" &&
    (tournoi?.typeBracket === "simple" || !tournoi?.typeBracket) &&
    tournoi?.matchs?.length > 0
      ? tournoi.matchs.reduce(
          (last, m) => (!last || m.round > last.round ? m : last),
          null,
        )?.gagnant?.nomAffiche || null
      : null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
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

  // Participants du match sélectionné (modal)
  const participantsModal = matchSelecte
    ? [matchSelecte.participant1, matchSelecte.participant2]
    : matchDoubleSelecte
      ? [
          matchDoubleSelecte.match.participant1,
          matchDoubleSelecte.match.participant2,
        ]
      : [];

  const roundModal = matchSelecte
    ? `Round ${matchSelecte.round}`
    : matchDoubleSelecte
      ? matchDoubleSelecte.zone === "GF"
        ? matchDoubleSelecte.matchType === "reset"
          ? "Grande Finale — Reset"
          : "Grande Finale — Match 1"
        : `${matchDoubleSelecte.zone} Round ${matchDoubleSelecte.match.round}`
      : "";

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
            {tournoi.typeBracket === "double" && (
              <Badge texte="Double Élimination" variante="accent" />
            )}
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
                  <span className={styles.organisateurLien}>
                    <AvatarIcon
                      avatarUrl={tournoi.organisateur?.avatarActif}
                      cadreStyle={tournoi.organisateur?.cadreStyle}
                      taille="xs"
                      nom={tournoi.organisateur?.nom}
                    />
                    <span style={tournoi.organisateur?.couleurPseudoActive ? { color: tournoi.organisateur.couleurPseudoActive } : {}}>
                      {tournoi.organisateur?.nom}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Progression ── */}
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

        {/* ── Inscription ── */}
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
            .map((p, i) => p.trim() && <p key={i}>{p}</p>)}
        </div>

        {/* ════════════════════════════════════════════════
            BRACKET
            ════════════════════════════════════════════════ */}
        <div className={styles.bracketSection}>
          <h2 className={styles.participantsTitre}>Bracket</h2>

          {/* Admin : boutons de génération (affiché si pas encore de bracket) */}
          {isAdmin &&
            !tournoi.hasBracket &&
            tournoi.participants.length >= 2 && (
              <div className={styles.bracketBtns}>
                <button
                  className={styles.btnGenererBracket}
                  onClick={handleGenererBracket}
                  disabled={generationEnCours}>
                  {generationEnCours
                    ? "Génération..."
                    : "⚡ Élimination simple"}
                </button>
                {tournoi.participants.length >= 4 && (
                  <button
                    className={`${styles.btnGenererBracket} ${styles.btnGenererDouble}`}
                    onClick={handleGenererBracketDouble}
                    disabled={generationEnCours}>
                    {generationEnCours
                      ? "Génération..."
                      : "⚔ Double élimination"}
                  </button>
                )}
              </div>
            )}

          {/* Indication */}
          {isAdmin && tournoi.hasBracket && (
            <p className={styles.indicationAdmin}>
              Cliquez sur un match pour valider ou arbitrer le résultat.
            </p>
          )}
          {!isAdmin && estInscrit && tournoi.hasBracket && tournoi.statut === "en_cours" && (
            <p className={styles.indicationAdmin}>
              Cliquez sur votre match pour soumettre votre résultat.
            </p>
          )}

          {/* Champion banner — bracket simple */}
          {championSimple && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "0 auto 2rem",
                animation: "fadeInUp 0.6s ease both",
              }}>
              <div
                style={{
                  background:
                    "radial-gradient(ellipse at center, #2a1f00 0%, #150f00 60%, #0a0800 100%)",
                  border: "2px solid #ffd700",
                  borderRadius: "16px",
                  padding: "1.8rem 3rem",
                  textAlign: "center",
                  minWidth: "320px",
                  animation: "glowPulse 2.5s ease-in-out infinite",
                }}>
                <style>{`
                  @keyframes glowPulse {
                    0%, 100% { box-shadow: 0 0 20px #ffd70066, 0 0 60px #ffd70033; }
                    50%       { box-shadow: 0 0 40px #ffd700aa, 0 0 100px #ffd70055; }
                  }
                  @keyframes trophyFloat {
                    0%, 100% { transform: translateY(0) rotate(-3deg); }
                    50%       { transform: translateY(-8px) rotate(3deg); }
                  }
                  @keyframes shimmerGold {
                    0%   { background-position: -300% center; }
                    100% { background-position: 300% center; }
                  }
                `}</style>
                <div
                  style={{
                    fontFamily: "Oxanium, sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "6px",
                    color: "#ffd70077",
                    textTransform: "uppercase",
                    marginBottom: "0.8rem",
                  }}>
                  Champion du tournoi
                </div>
                <span
                  style={{
                    fontSize: "2.8rem",
                    display: "block",
                    animation: "trophyFloat 2s ease-in-out infinite",
                    marginBottom: "0.5rem",
                    filter: "drop-shadow(0 0 12px #ffd700)",
                  }}>
                  🏆
                </span>
                <div
                  style={{
                    fontFamily: "Oxanium, sans-serif",
                    fontSize: "clamp(1.4rem, 4vw, 2rem)",
                    fontWeight: 800,
                    background:
                      "linear-gradient(90deg, #7d5a00, #ffd700, #fff8d0, #ffd700, #7d5a00)",
                    backgroundSize: "300% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmerGold 4s linear infinite",
                    letterSpacing: "2px",
                  }}>
                  {championSimple}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "5px",
                    color: "#ffd70066",
                    marginTop: "0.6rem",
                    textTransform: "uppercase",
                  }}>
                  ★ ══ Vainqueur ══ ★
                </div>
              </div>
            </div>
          )}

          {/* Bracket simple */}
          {tournoi.hasBracket &&
            (tournoi.typeBracket === "simple" || !tournoi.typeBracket) &&
            tournoi.matchs?.length > 0 && (
              <BracketVisuel
                matchs={tournoi.matchs}
                onClicMatch={handleOuvrirMatch}
                isAdmin={isAdmin}
                utilisateurId={utilisateur?.id}
              />
            )}

          {/* Bracket double élimination */}
          {tournoi.hasBracket && tournoi.typeBracket === "double" && (
            <BracketDoubleElim
              winnersMatchs={tournoi.winnersMatchs || []}
              losersMatchs={tournoi.losersMatchs || []}
              grandeFinale={tournoi.grandeFinale}
              champion={tournoi.champion}
              isAdmin={isAdmin}
              onClicMatch={handleOuvrirMatchDouble}
              utilisateurId={utilisateur?.id}
            />
          )}

          {/* Pas encore de bracket, côté public */}
          {!tournoi.hasBracket && !isAdmin && (
            <p className={styles.bracketAttente}>
              Le bracket sera disponible dès le lancement du tournoi.
            </p>
          )}
        </div>

        {/* ── Participants ── */}
        {tournoi.participants?.length > 0 && (
          <div className={styles.participantsSection}>
            <h2 className={styles.participantsTitre}>
              Participants inscrits ({tournoi.participants.length})
            </h2>
            <div className={styles.participantsGrille}>
              {tournoi.participants.map((p, i) => (
                <div key={i} className={styles.participantCard}>
                  <AvatarIcon
                    avatarUrl={p.joueur?.avatarActif || p.capitaine?.avatarActif || p.avatarActif}
                    cadreStyle={p.joueur?.cadreStyle || p.capitaine?.cadreStyle || p.cadreStyle}
                    taille="sm"
                    nom={p.nomAffiche}
                  />
                  <span
                    className={styles.participantNom}
                    style={(p.joueur?.couleurPseudoActive || p.capitaine?.couleurPseudoActive || p.couleurPseudoActive) ? { color: (p.joueur?.couleurPseudoActive || p.capitaine?.couleurPseudoActive || p.couleurPseudoActive) } : {}}
                  >
                    {p.nomAffiche ?? "Participant"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          Modal saisie résultat (simple ET double élim)
          ════════════════════════════════════════════════ */}
      {(matchSelecte || matchDoubleSelecte) && (() => {
        const activeMatch = matchSelecte || matchDoubleSelecte?.match;
        const r1 = activeMatch?.report1;
        const r2 = activeMatch?.report2;
        const aDesReports = r1 || r2;
        const enAccord = r1 && r2 &&
          r1.gagnant === r2.gagnant &&
          r1.score1 === r2.score1 &&
          r1.score2 === r2.score2;

        return (
        <div className={styles.overlay} onClick={fermerModal}>
          <div
            className={styles.modaleMatch}
            onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleMatchEntete}>
              <h3 className={styles.modaleMatchTitre}>
                {isAdmin ? "Arbitrage" : "Soumettre votre résultat"} — {roundModal}
              </h3>
              <button className={styles.modaleFermer} onClick={fermerModal}>
                ✕
              </button>
            </div>

            {/* Affichage des reports existants pour l'admin */}
            {isAdmin && aDesReports && (
              <div className={styles.reportsSection}>
                <p className={styles.modaleMatchLabel}>
                  {enAccord ? "✅ Les deux joueurs sont d'accord" : "⚠️ Litige — résultats différents"}
                </p>
                <div className={styles.reportsGrille}>
                  <div className={styles.reportCard}>
                    <span className={styles.reportTitre}>
                      {activeMatch.participant1?.nomAffiche || "Joueur 1"}
                    </span>
                    {r1 ? (
                      <>
                        <span className={styles.reportDetail}>Gagnant : <strong>{r1.gagnant}</strong></span>
                        <span className={styles.reportDetail}>Score : {r1.score1 ?? "—"} — {r1.score2 ?? "—"}</span>
                        <button
                          className={styles.btnAccepterReport}
                          onClick={() => {
                            setGagnantInput(r1.gagnant);
                            setScore1Input(r1.score1?.toString() ?? "");
                            setScore2Input(r1.score2?.toString() ?? "");
                          }}>
                          Utiliser ce résultat
                        </button>
                      </>
                    ) : (
                      <span className={styles.reportDetail}>Pas encore soumis</span>
                    )}
                  </div>
                  <div className={styles.reportCard}>
                    <span className={styles.reportTitre}>
                      {activeMatch.participant2?.nomAffiche || "Joueur 2"}
                    </span>
                    {r2 ? (
                      <>
                        <span className={styles.reportDetail}>Gagnant : <strong>{r2.gagnant}</strong></span>
                        <span className={styles.reportDetail}>Score : {r2.score1 ?? "—"} — {r2.score2 ?? "—"}</span>
                        <button
                          className={styles.btnAccepterReport}
                          onClick={() => {
                            setGagnantInput(r2.gagnant);
                            setScore1Input(r2.score1?.toString() ?? "");
                            setScore2Input(r2.score2?.toString() ?? "");
                          }}>
                          Utiliser ce résultat
                        </button>
                      </>
                    ) : (
                      <span className={styles.reportDetail}>Pas encore soumis</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!reclamationOuverte ? (
              <>
                <p className={styles.modaleMatchLabel}>Sélectionner le gagnant</p>
                <div className={styles.versusBloc}>
                  {participantsModal.map((p, i) => (
                    <button
                      key={i}
                      className={[
                        styles.btnJoueur,
                        gagnantInput === p?.nomAffiche ? styles.btnJoueurActif : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setGagnantInput(p?.nomAffiche)}>
                      {p?.nomAffiche || "TBD"}
                    </button>
                  ))}
                </div>

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
                  {!isAdmin && estInscrit && (
                    <button 
                      className={styles.btnReclamation} 
                      onClick={() => setReclamationOuverte(true)}>
                      🚨 Signaler un problème
                    </button>
                  )}
                  <div style={{ flex: 1 }}></div>
                  <button className={styles.btnAnnuler} onClick={fermerModal}>
                    Annuler
                  </button>
                  <button
                    className={styles.btnConfirmer}
                    onClick={
                      matchSelecte
                        ? handleSaisirResultat
                        : handleSaisirResultatDouble
                    }
                    disabled={!gagnantInput || envoiMatch}>
                    {envoiMatch
                      ? "Enregistrement..."
                      : isAdmin
                        ? "✓ Valider le résultat"
                        : "Soumettre mon résultat"}
                  </button>
                </div>
              </>
            ) : (
              // Vue Réclamation
              <div className={styles.reclamationVue}>
                <p className={styles.modaleMatchLabel}>Description du problème</p>
                <textarea
                  className={styles.reclamationTextarea}
                  placeholder="Expliquez pourquoi le résultat de ce match est incorrect..."
                  value={reclamationMessage}
                  onChange={(e) => setReclamationMessage(e.target.value)}
                  rows={4}
                />
                
                <p className={styles.modaleMatchLabel} style={{ marginTop: '1rem' }}>Image / Capture d'écran (Preuve)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className={styles.uploadInput}
                />
                {uploadingImage && <p style={{ fontSize: '0.8rem', color: '#f39c12' }}>Upload en cours...</p>}
                {reclamationImage && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={reclamationImage} alt="Preuve" style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #333' }} />
                  </div>
                )}

                <div className={styles.modaleMatchActions} style={{ marginTop: '1.5rem' }}>
                  <button className={styles.btnAnnuler} onClick={() => setReclamationOuverte(false)}>
                    Retour
                  </button>
                  <button
                    className={styles.btnConfirmer}
                    style={{ background: '#e74c3c' }}
                    onClick={handleSoumettreReclamation}
                    disabled={envoiReclamation || uploadingImage || !reclamationMessage || !reclamationImage}>
                    {envoiReclamation ? "Envoi..." : "Envoyer la réclamation"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        );
      })()}
      <Commentaires cibleId={id} typeCible="tournoi" />
    </div>
  );
}

export default TournamentDetail;

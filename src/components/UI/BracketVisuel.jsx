import styles from "./BracketVisuel.module.css";

// Dimensions fixes utilisées pour le calcul des positions absolues
const CARD_H = 72;   // hauteur d'une carte match en px
const CARD_W = 160;  // largeur d'une carte match en px
const ROUND_W = 210; // largeur d'un round (carte + espace connecteur)
const GAP = 12;      // espace vertical entre deux cartes du même round

function getRoundLabel(round, maxRound) {
  if (round === maxRound) return "Finale";
  if (round === maxRound - 1 && maxRound > 2) return "Demi-finales";
  if (round === maxRound - 2 && maxRound > 3) return "Quarts de finale";
  return `Round ${round}`;
}

// Calcule la position Y (top) du centre d'une carte dans le canvas
function getY(round, position) {
  const step = Math.pow(2, round - 1) * (CARD_H + GAP);
  return position * step + (step - CARD_H) / 2;
}

// Calcule la position X (left) d'un round
function getX(round) {
  return (round - 1) * ROUND_W;
}

// Détermine la couleur du statut d'un match
function getStatutIndicateur(match) {
  if (match.statut === "joue") return { color: "#27ae60", label: "Validé" };
  if (match.statut === "en_litige") {
    if (match.report1 && match.report2) {
      const accord =
        match.report1.gagnant === match.report2.gagnant &&
        match.report1.score1 === match.report2.score1 &&
        match.report1.score2 === match.report2.score2;
      return accord
        ? { color: "#f1c40f", label: "Accord — en attente de validation" }
        : { color: "#e74c3c", label: "Litige — scores différents" };
    }
    return { color: "#f39c12", label: "1 rapport soumis" };
  }
  return { color: "#555", label: "En attente" };
}

// Vérifie si l'utilisateur est participant d'un match
function estParticipant(match, userId) {
  if (!userId) return false;
  const p1 = match.participant1;
  const p2 = match.participant2;
  return (
    p1?.joueur?.toString() === userId ||
    p1?.capitaine?.toString() === userId ||
    p2?.joueur?.toString() === userId ||
    p2?.capitaine?.toString() === userId
  );
}

// ─── Carte d'un match individuel ──────────────────────────────────────────
function CarteMatch({ match, onClic, isAdmin, utilisateurId }) {
  const p1 = match.participant1;
  const p2 = match.participant2;
  const gagnant = match.gagnant;
  const indicateur = getStatutIndicateur(match);

  // Admin peut toujours cliquer, joueur peut cliquer sur son propre match non validé
  const estJoueur = estParticipant(match, utilisateurId);
  const peutCliquer =
    p1 && p2 &&
    (isAdmin || (estJoueur && match.statut !== "joue"));

  return (
    <div
      className={[
        styles.match,
        peutCliquer ? styles.matchCliquable : "",
        match.statut === "joue" ? styles.matchJoue : "",
        match.statut === "en_litige" ? styles.matchLitige : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => peutCliquer && onClic(match)}
      title={peutCliquer ? (isAdmin ? "Cliquer pour valider/modifier" : "Soumettre votre résultat") : indicateur.label}
    >
      {/* Indicateur de statut */}
      <span
        className={styles.statutDot}
        style={{ backgroundColor: indicateur.color }}
        title={indicateur.label}
      />

      {/* Participant 1 */}
      <div
        className={[
          styles.slot,
          gagnant && gagnant.nomAffiche === p1?.nomAffiche
            ? styles.slotGagnant
            : "",
          !p1 ? styles.slotBye : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.nom}>{p1?.nomAffiche ?? "BYE"}</span>
        {match.statut === "joue" && match.score1 !== null && (
          <span className={styles.score}>{match.score1}</span>
        )}
      </div>

      <div className={styles.divider} />

      {/* Participant 2 */}
      <div
        className={[
          styles.slot,
          gagnant && gagnant.nomAffiche === p2?.nomAffiche
            ? styles.slotGagnant
            : "",
          !p2 ? styles.slotBye : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.nom}>{p2?.nomAffiche ?? "BYE"}</span>
        {match.statut === "joue" && match.score2 !== null && (
          <span className={styles.score}>{match.score2}</span>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal du bracket ─────────────────────────────────────────
function BracketVisuel({ matchs, onClicMatch, isAdmin = false, utilisateurId = null }) {
  if (!matchs || matchs.length === 0) return null;

  const maxRound = Math.max(...matchs.map((m) => m.round));
  const round1Count = matchs.filter((m) => m.round === 1).length;
  const containerH = Math.max(round1Count * (CARD_H + GAP) - GAP, CARD_H);
  const containerW = maxRound * ROUND_W;

  // Construction des lignes SVG de connexion entre rounds
  const lignes = [];
  matchs.forEach((match) => {
    const nextMatch = matchs.find(
      (m) =>
        m.round === match.round + 1 &&
        m.position === Math.floor(match.position / 2)
    );
    if (!nextMatch) return;

    const x1 = getX(match.round) + CARD_W;
    const y1 = getY(match.round, match.position) + CARD_H / 2;
    const xMid = x1 + 25;
    const x2 = getX(nextMatch.round);
    const y2 = getY(nextMatch.round, nextMatch.position) + CARD_H / 2;

    lignes.push(
      <path
        key={`line-${match._id}`}
        d={`M ${x1} ${y1} L ${xMid} ${y1} L ${xMid} ${y2} L ${x2} ${y2}`}
        stroke="var(--couleur-bordure)"
        strokeWidth="1.5"
        fill="none"
      />
    );
  });

  return (
    <div className={styles.bracketContainer}>
      {/* Labels des rounds au-dessus */}
      <div className={styles.roundLabels} style={{ width: containerW }}>
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((r) => (
          <div key={r} className={styles.roundLabel} style={{ width: ROUND_W }}>
            {getRoundLabel(r, maxRound)}
          </div>
        ))}
      </div>

      {/* Canvas du bracket */}
      <div
        className={styles.canvas}
        style={{ height: containerH, width: containerW }}
      >
        <svg
          className={styles.lignesSvg}
          width={containerW}
          height={containerH}
        >
          {lignes}
        </svg>

        {matchs.map((match) => (
          <div
            key={match._id}
            style={{
              position: "absolute",
              top: getY(match.round, match.position),
              left: getX(match.round),
              width: CARD_W,
            }}
          >
            <CarteMatch
              match={match}
              onClic={onClicMatch}
              isAdmin={isAdmin}
              utilisateurId={utilisateurId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BracketVisuel;

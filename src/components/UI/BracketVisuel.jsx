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

// ─── Carte d'un match individuel ────────────────────────────────────────────
function CarteMatch({ match, onClic, isAdmin }) {
  const p1 = match.participant1;
  const p2 = match.participant2;
  const gagnant = match.gagnant;
  const peutCliquer =
    isAdmin && match.statut === "en_attente" && p1 && p2;

  return (
    <div
      className={[
        styles.match,
        peutCliquer ? styles.matchCliquable : "",
        match.statut === "joue" ? styles.matchJoue : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => peutCliquer && onClic(match)}
      title={peutCliquer ? "Cliquer pour entrer le résultat" : undefined}
    >
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
function BracketVisuel({ matchs, onClicMatch, isAdmin = false }) {
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
    const xMid = x1 + 25; // point médian dans l'espace entre les deux rounds
    const x2 = getX(nextMatch.round);
    const y2 = getY(nextMatch.round, nextMatch.position) + CARD_H / 2;

    // Chemin en "S" horizontal : droite → vertical → droite
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

      {/* Canvas du bracket : cartes + lignes SVG superposées */}
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
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BracketVisuel;

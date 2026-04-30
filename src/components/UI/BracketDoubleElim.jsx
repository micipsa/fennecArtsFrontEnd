// ============================================================================
// BracketDoubleElim.jsx — Bracket double élimination
// Props :
//   winnersMatchs  : array   — matchs WB depuis l'API
//   losersMatchs   : array   — matchs LB depuis l'API
//   grandeFinale   : object  — { match1, reset }
//   champion       : string  — nom du vainqueur final (null si pas encore)
//   isAdmin        : bool    — affiche les matchs cliquables
//   onClicMatch    : fn(match, zone, matchType?)
//                     zone = "WB" | "LB" | "GF"
//                     matchType = "match1" | "reset" (GF seulement)
// ============================================================================

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .br-root {
    font-family: 'Rajdhani', sans-serif;
    background: #0a0a16;
    min-height: 100vh;
    padding: 2rem 1.5rem 3rem;
    color: #e8e8f0;
  }

  .br-header { text-align: center; margin-bottom: 2.5rem; }

  .br-title {
    font-family: 'Oxanium', sans-serif;
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 800;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #e63946;
    text-shadow: 0 0 30px #e6394688;
  }

  .br-subtitle {
    font-size: 0.8rem;
    letter-spacing: 4px;
    color: #4a5568;
    text-transform: uppercase;
    margin-top: 0.3rem;
  }

  /* ── Champion Banner ── */
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px #ffd70066, 0 0 60px #ffd70033, inset 0 0 20px #ffd70011; }
    50%       { box-shadow: 0 0 40px #ffd700aa, 0 0 100px #ffd70055, inset 0 0 40px #ffd70022; }
  }
  @keyframes shimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes trophyFloat {
    0%, 100% { transform: translateY(0) rotate(-3deg); }
    50%       { transform: translateY(-8px) rotate(3deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .champion-wrap {
    display: flex;
    justify-content: center;
    margin: 0 auto 2.5rem;
    animation: fadeInUp 0.6s ease both;
  }

  .champion-banner {
    background: radial-gradient(ellipse at center, #2a1f00 0%, #150f00 60%, #0a0800 100%);
    border: 2px solid #ffd700;
    border-radius: 16px;
    padding: 1.8rem 3rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    animation: glowPulse 2.5s ease-in-out infinite;
    min-width: 320px;
  }
  .champion-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.02) 10px, rgba(255,215,0,0.02) 11px);
    pointer-events: none;
  }
  .champ-eyebrow {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 6px;
    color: #ffd70077;
    text-transform: uppercase;
    margin-bottom: 0.8rem;
  }
  .champ-trophy {
    font-size: 2.8rem;
    display: block;
    animation: trophyFloat 2s ease-in-out infinite;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 0 12px #ffd700);
  }
  .champ-name {
    font-family: 'Oxanium', sans-serif;
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 800;
    background: linear-gradient(90deg, #7d5a00, #ffd700, #fff8d0, #ffd700, #7d5a00);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
    letter-spacing: 2px;
  }
  .champ-footer {
    font-size: 0.75rem;
    letter-spacing: 5px;
    color: #ffd70066;
    margin-top: 0.6rem;
    text-transform: uppercase;
  }

  /* ── Sections ── */
  .br-section { margin-bottom: 2rem; }

  .section-pill {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 0.3rem 1rem;
    border-radius: 3px;
    display: inline-block;
    margin-bottom: 1.2rem;
  }
  .pill-wb { background: #e63946; color: #fff; }
  .pill-lb { background: #f4a261; color: #1a1a2e; }
  .pill-gf { background: #ffd700; color: #1a1a2e; }

  .br-divider { border: none; border-top: 1px solid #1e1e35; margin: 1.8rem 0; }

  /* ── Rounds ── */
  .rounds-scroll { overflow-x: auto; padding-bottom: 0.5rem; }
  .rounds-row { display: flex; gap: 2.5rem; align-items: flex-start; min-width: max-content; }
  .round-col { display: flex; flex-direction: column; gap: 0.75rem; min-width: 190px; }
  .round-label {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 2.5px;
    color: #3a3a5a;
    text-transform: uppercase;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #1e1e35;
    margin-bottom: 0.2rem;
  }

  /* ── Match Card ── */
  .match-card {
    background: #12122a;
    border: 1px solid #1e1e35;
    border-radius: 6px;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .match-card:hover { border-color: #2a2a55; }
  .match-card.wb-card { border-left: 3px solid #e6394644; }
  .match-card.lb-card { border-left: 3px solid #f4a26144; }
  .match-card.gf-card { border-left: 3px solid #ffd70066; border-width: 1px; border-left-width: 3px; }
  .match-card.pending { opacity: 0.55; }

  /* Cliquable en mode admin */
  .match-card.clickable {
    cursor: pointer;
    opacity: 1;
  }
  .match-card.clickable:hover {
    border-color: #e63946;
    background: #16162e;
  }
  .match-card.clickable .team-name { color: #e8e8f0; }

  .team-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 0.65rem;
    gap: 0.5rem;
    min-height: 34px;
  }
  .team-row + .team-row { border-top: 1px solid #1e1e35; }
  .team-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #6b7280;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s;
  }
  .team-score {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    min-width: 1.4rem;
    text-align: center;
    color: #3a3a5a;
  }
  .team-row.winner .team-name  { color: #e8e8f0; }
  .team-row.winner .team-score { color: #e63946; }
  .team-row.loser  .team-name  { color: #2e2e4a; text-decoration: line-through; }
  .team-row.loser  .team-score { color: #2e2e4a; }
  .tbd { font-style: italic; color: #2e2e4a !important; }

  /* ── Grande Finale ── */
  .gf-row { display: flex; gap: 2rem; flex-wrap: wrap; }
  .gf-col { min-width: 190px; max-width: 240px; }
  .gf-col .round-label { color: #5a5a30; border-color: #2a2a1a; }

  .reset-tag {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 2px;
    background: #f4a261;
    color: #1a1a2e;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    text-transform: uppercase;
    margin-right: 0.4rem;
    vertical-align: middle;
  }
  .gf-note {
    font-size: 0.72rem;
    color: #3a3a50;
    margin-top: 0.4rem;
    letter-spacing: 0.5px;
    font-style: italic;
  }
  .gf-non-necessaire {
    font-size: 0.78rem;
    color: #3a3a50;
    margin-top: 0.5rem;
    font-style: italic;
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupByRound(matchs) {
  const rounds = {};
  matchs.forEach((m) => {
    if (!rounds[m.round]) rounds[m.round] = [];
    rounds[m.round].push(m);
  });
  Object.values(rounds).forEach((arr) =>
    arr.sort((a, b) => a.position - b.position),
  );
  return rounds;
}

function labelRoundWB(round, totalRounds) {
  if (round === totalRounds) return "Finale WB";
  if (round === totalRounds - 1 && totalRounds > 2) return "Demi-Finale WB";
  return `Round ${round}`;
}

function labelRoundLB(round, totalRounds) {
  if (round === totalRounds) return "Finale LB";
  if (round === totalRounds - 1 && totalRounds > 2) return "Demi-Finale LB";
  return `Round ${round}`;
}

// ── Composants ───────────────────────────────────────────────────────────────

function TeamRow({ name, score, winner, loser }) {
  const tbd = !name;
  return (
    <div
      className={`team-row ${winner ? "winner" : ""} ${loser ? "loser" : ""}`}>
      <span className={`team-name ${tbd ? "tbd" : ""}`}>{name || "TBD"}</span>
      <span className="team-score">
        {score !== null && score !== undefined ? score : "—"}
      </span>
    </div>
  );
}

function MatchCard({ match, variant = "wb", isAdmin, onClick }) {
  const e1 = match.participant1?.nomAffiche || null;
  const e2 = match.participant2?.nomAffiche || null;
  const gagnantNom = match.gagnant?.nomAffiche || null;
  const joue = match.statut === "joue";

  // Cliquable si admin, pas encore joué, et les deux participants sont connus
  const clickable = isAdmin && !joue && e1 && e2;

  const winner1 = joue && gagnantNom === e1;
  const winner2 = joue && gagnantNom === e2;
  const loser1 = joue && !winner1 && e1 !== null;
  const loser2 = joue && !winner2 && e2 !== null;

  return (
    <div
      className={`match-card ${variant}-card ${!joue ? "pending" : ""} ${clickable ? "clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      title={clickable ? "Cliquer pour saisir le résultat" : undefined}>
      <TeamRow name={e1} score={match.score1} winner={winner1} loser={loser1} />
      <TeamRow name={e2} score={match.score2} winner={winner2} loser={loser2} />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function BracketDoubleElim({
  winnersMatchs = [],
  losersMatchs = [],
  grandeFinale = null,
  champion = null,
  isAdmin = false,
  onClicMatch,
}) {
  const wbRounds =
    winnersMatchs.length > 0
      ? Math.max(...winnersMatchs.map((m) => m.round))
      : 0;
  const lbRounds =
    losersMatchs.length > 0 ? Math.max(...losersMatchs.map((m) => m.round)) : 0;

  const wbParRound = groupByRound(winnersMatchs);
  const lbParRound = groupByRound(losersMatchs);

  const gfMatch1 = grandeFinale?.match1 || null;
  const gfReset = grandeFinale?.reset || null;

  const resetNecessaire = gfReset?.statut !== "non_necessaire";

  return (
    <>
      <style>{css}</style>
      <div className="br-root">
        {/* ── Champion Banner ── */}
        {champion && (
          <div className="champion-wrap">
            <div className="champion-banner">
              <div className="champ-eyebrow">Champion du tournoi</div>
              <span className="champ-trophy">🏆</span>
              <div className="champ-name">{champion}</div>
              <div className="champ-footer">★ ══ Vainqueur ══ ★</div>
            </div>
          </div>
        )}

        {/* ── Winners Bracket ── */}
        <div className="br-section">
          <span className="section-pill pill-wb">Winners Bracket</span>
          <div className="rounds-scroll">
            <div className="rounds-row">
              {Object.keys(wbParRound)
                .map(Number)
                .sort((a, b) => a - b)
                .map((round) => (
                  <div className="round-col" key={round}>
                    <div className="round-label">
                      {labelRoundWB(round, wbRounds)}
                    </div>
                    {wbParRound[round].map((m) => (
                      <MatchCard
                        key={m._id}
                        match={m}
                        variant="wb"
                        isAdmin={isAdmin}
                        onClick={() => onClicMatch && onClicMatch(m, "WB")}
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <hr className="br-divider" />

        {/* ── Losers Bracket ── */}
        <div className="br-section">
          <span className="section-pill pill-lb">Losers Bracket</span>
          <div className="rounds-scroll">
            <div className="rounds-row">
              {Object.keys(lbParRound)
                .map(Number)
                .sort((a, b) => a - b)
                .map((round) => (
                  <div className="round-col" key={round}>
                    <div className="round-label">
                      {labelRoundLB(round, lbRounds)}
                    </div>
                    {lbParRound[round].map((m) => (
                      <MatchCard
                        key={m._id}
                        match={m}
                        variant="lb"
                        isAdmin={isAdmin}
                        onClick={() => onClicMatch && onClicMatch(m, "LB")}
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <hr className="br-divider" />

        {/* ── Grande Finale ── */}
        <div className="br-section">
          <span className="section-pill pill-gf">🏆 Grande Finale</span>
          <div className="gf-row">
            {/* Match 1 */}
            {gfMatch1 && (
              <div className="gf-col">
                <div className="round-label">Match 1</div>
                <MatchCard
                  match={gfMatch1}
                  variant="gf"
                  isAdmin={isAdmin}
                  onClick={() =>
                    onClicMatch && onClicMatch(gfMatch1, "GF", "match1")
                  }
                />
              </div>
            )}

            {/* Reset */}
            {gfReset && (
              <div className="gf-col">
                <div className="round-label">
                  {resetNecessaire ? (
                    <>
                      <span className="reset-tag">Reset</span>Si nécessaire
                    </>
                  ) : (
                    <>
                      <span className="reset-tag">Reset</span>Non joué
                    </>
                  )}
                </div>
                {resetNecessaire ? (
                  <>
                    <MatchCard
                      match={gfReset}
                      variant="gf"
                      isAdmin={isAdmin && gfReset.statut === "en_attente"}
                      onClick={() =>
                        onClicMatch && onClicMatch(gfReset, "GF", "reset")
                      }
                    />
                    {gfReset.statut === "en_attente" && (
                      <p className="gf-note">
                        Joué si le LB winner gagne le Match 1
                      </p>
                    )}
                  </>
                ) : (
                  <p className="gf-non-necessaire">
                    Le WB champion a gagné directement.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import React from "react";
import styles from "./ArcadeLeaderboardTable.module.css";
import AvatarIcon from "../UI/AvatarIcon";

export default function ArcadeLeaderboardTable({ jeu, leaderboard = [], chargement = false, rafraichir }) {
  const getFormatValeur = (entry) => {
    if (jeu === "wordle") {
      return entry.meilleurTemps ? `${entry.meilleurTemps}s` : "—";
    }
    if (jeu === "typing") {
      return entry.meilleurScore ? `${entry.meilleurScore} WPM` : "—";
    }
    if (jeu === "pong") {
      return entry.meilleurScore !== undefined ? `${entry.meilleurScore} renvois` : "—";
    }
    if (jeu === "snake" || jeu === "quiz" || jeu === "memory") {
      return entry.meilleurScore !== undefined ? `${entry.meilleurScore} pts` : "—";
    }
    // RPS (par victoires)
    return entry.victoires !== undefined ? `${entry.victoires} Vic.` : "—";
  };

  const getLabelValeur = () => {
    if (jeu === "wordle") return "Meilleur Temps";
    if (jeu === "typing") return "Vitesse (WPM)";
    if (jeu === "pong") return "Renvois Max";
    if (jeu === "snake" || jeu === "quiz" || jeu === "memory") return "Meilleur Score";
    return "Victoires";
  };

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.retroHeader}>
        <div className={styles.neonTitle}>HIGH SCORES</div>
        {rafraichir && (
          <button className={styles.btnRafraichir} onClick={rafraichir} disabled={chargement}>
            {chargement ? "⌛" : "🔄"} Actualiser
          </button>
        )}
      </div>

      {chargement ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des scores...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className={styles.noScores}>
          <p>Aucun score enregistré pour l'instant. Soyez le premier ! 🚀</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.retroTable}>
            <thead>
              <tr>
                <th className={styles.rankCol}>Rang</th>
                <th>Joueur</th>
                <th className={styles.valueCol}>{getLabelValeur()}</th>
                <th className={styles.statsCol}>Ratio V/D</th>
                <th className={styles.dateCol}>Dernière partie</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const isTop3 = index < 3;
                const user = entry.utilisateur || { nom: "Inconnu", pseudo: "Inconnu" };
                const displayPseudo = user.pseudo || user.nom;

                return (
                  <tr key={entry._id || index} className={`${styles.row} ${isTop3 ? styles[`top${index + 1}`] : ""}`}>
                    <td className={styles.rankCell}>
                      {index === 0 && <span className={styles.medal}>🥇</span>}
                      {index === 1 && <span className={styles.medal}>🥈</span>}
                      {index === 2 && <span className={styles.medal}>🥉</span>}
                      {index >= 3 && <span className={styles.rankNumber}>{index + 1}</span>}
                    </td>
                    <td className={styles.playerCell}>
                      <div className={styles.avatarContainer}>
                        <AvatarIcon
                          avatarUrl={user.avatarActif}
                          cadreStyle={user.cadreStyle}
                          taille="xs"
                          nom={displayPseudo}
                        />
                      </div>
                      <div className={styles.playerInfo}>
                        <span 
                          className={styles.playerName} 
                          style={user.couleurPseudoActive ? { color: user.couleurPseudoActive } : {}}
                        >
                          {displayPseudo}
                        </span>
                        {user.titreActif && (
                          <span className={styles.playerTitle}>{user.titreActif}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.valueCell}>
                      {getFormatValeur(entry)}
                    </td>
                    <td className={styles.statsCell}>
                      <span className={styles.ratio}>
                        {entry.victoires || 0}V / {entry.defaites || 0}D
                      </span>
                      <span className={styles.partiesCount}>
                        ({entry.partiesJouees || 0} parties)
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {entry.dernierePartie
                        ? new Date(entry.dernierePartie).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import ClassementFiltres from "../components/UI/ClassementFiltres";
import AvatarIcon from "../components/UI/AvatarIcon";
import styles from "./ClassementPage.module.css";

const MEDAILLES = ["🥇", "🥈", "🥉"];

function ClassementPage() {
  const [joueurs, setJoueurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtreJeu, setFiltreJeu] = useState("global");

  const chargerClassement = (jeuId) => {
    setChargement(true);
    const url =
      jeuId === "global"
        ? "/api/users/classement"
        : `/api/users/classement?jeu=${jeuId}`;
    api
      .get(url)
      .then((res) => setJoueurs(res.data.data))
      .catch(() => setJoueurs([]))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    chargerClassement(filtreJeu);
  }, [filtreJeu]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>HALL OF LEGENDS</h1>
        <p className={styles.pageSousTitre}>qui sera le GOAT ? </p>
      </div>

      <div className={styles.contenu}>
        <ClassementFiltres onFiltrer={(val) => setFiltreJeu(val)} />

        {chargement ? (
          <Spinner />
        ) : (
          <>
          {/* ── Podium Top 3 ── */}
          {joueurs.length >= 3 && (
            <div className={styles.podium}>
              {[1, 0, 2].map((podIdx) => {
                const j = joueurs[podIdx];
                if (!j) return null;
                const rang = calculerRang(j.points ?? 0);
                const podClass = podIdx === 0 ? styles.podiumGold : podIdx === 1 ? styles.podiumSilver : styles.podiumBronze;
                return (
                  <Link key={j._id} to={`/membres/${j._id}`} className={`${styles.podiumCard} ${podClass}`}>
                    <div className={styles.podiumMedaille}>{MEDAILLES[podIdx]}</div>
                    <AvatarIcon avatarUrl={j.avatarActif} cadreStyle={j.cadreStyle} taille={podIdx === 0 ? "lg" : "md"} nom={j.nom} />
                    <h3 className={styles.podiumNom} style={j.couleurPseudoActive ? { color: j.couleurPseudoActive } : {}}>{j.nom}</h3>
                    <span className={styles.podiumRang} style={{ color: rang.couleur }}>{rang.affichage}</span>
                    <div className={styles.podiumStats}>
                      <span>⚡ {j.points ?? 0}</span>
                      <span>⚔️ {j.participationsTournois?.length ?? 0}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Rang (Site)</th>
                  <th>XP Total</th>
                  <th>Points eSport</th>
                  <th>Tournois</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {joueurs.map((joueur, index) => {
                  const rang = calculerRang(joueur.points ?? 0);
                  const isTop3 = index < 3;
                  return (
                    <tr
                      key={joueur._id}
                      className={`${styles.ligne} ${isTop3 ? styles[`top${index + 1}`] : ""}`}>
                      <td className={styles.colRang}>
                        {isTop3 ? (
                          <span className={styles.medaille}>
                            {MEDAILLES[index]}
                          </span>
                        ) : (
                          <span className={styles.numero}>#{index + 1}</span>
                        )}
                      </td>
                      <td className={styles.colNom}>
                        <Link
                          to={`/membres/${joueur._id}`}
                          className={styles.nomLien}
                          style={joueur.couleurPseudoActive ? { color: joueur.couleurPseudoActive } : {}}>
                          <AvatarIcon
                            avatarUrl={joueur.avatarActif}
                            cadreStyle={joueur.cadreStyle}
                            taille="sm"
                            nom={joueur.nom}
                          />
                          {joueur.nom}
                        </Link>
                      </td>
                      <td className={styles.colRangLol}>
                        <span
                          style={{ color: rang.couleur }}
                          className={styles.rangAffichage}>
                          {rang.affichage}
                        </span>
                      </td>
                      <td className={styles.colPoints}>
                        {joueur.points ?? 0} pts
                      </td>
                      <td className={styles.colEsportPoints}>
                        {filtreJeu === "global" ? (joueur.esportPoints ?? 0) : (joueur.jeuSpecifiquePoints ?? 0)} pts
                      </td>
                      <td className={styles.colTournois}>
                        {joueur.participationsTournois?.length ?? 0}
                      </td>
                      <td className={styles.colTags}>
                        {joueur.tags?.length > 0 ? (
                          <div className={styles.tags}>
                            {joueur.tags.map((tag) => (
                              <span
                                key={tag._id}
                                className={styles.tag}
                                style={{ backgroundColor: tag.couleur }}>
                                {tag.nom}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.vide}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {joueurs.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.vide}>
                      Aucun adhérent classé pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClassementPage;

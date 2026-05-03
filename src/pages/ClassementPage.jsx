import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import ClassementFiltres from "../components/UI/ClassementFiltres";
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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Rang LoL</th>
                  <th>Points</th>
                  <th>Tags</th>
                  <th>Tournois</th>
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
                          className={styles.nomLien}>
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
                      <td className={styles.colTournois}>
                        {joueur.participationsTournois?.length ?? 0}
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
        )}
      </div>
    </div>
  );
}

export default ClassementPage;

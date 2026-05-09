/**
 * HomePage — page d'accueil de l'application.
 *
 * C'est la première page visible par le visiteur. Elle présente :
 * 1. Un Hero (grande bannière d'introduction)
 * 2. Les 3 articles les plus récents
 * 3. Les tournois ouverts (statut === "ouvert"), limités à 3
 * 4. Les événements à venir (dateDebut > maintenant), limités à 3
 *
 * Chaque section a un lien "Voir tout →" qui renvoie vers la page complète.
 *
 * Les données sont chargées en parallèle via Promise.all() pour optimiser
 * le temps de chargement (une seule attente pour les 3 requêtes).
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Hero from "../components/UI/Hero";
import CarteArticle from "../components/Cards/CarteArticle";
import CarteEvenement from "../components/Cards/CarteEvenement";
import CarteTournoi from "../components/Cards/CarteTournoi";
import Spinner from "../components/UI/Spinner";
import { SkeletonGrille } from "../components/UI/Skeleton";
import styles from "./HomePage.module.css";

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [articleVedette, setArticleVedette] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resArticles, resEvents, resTournois, resVedette] = await Promise.all([
          api.get("/api/articles?limit=4&page=1"),
          api.get("/api/events"),
          api.get("/api/tournaments"),
          api.get("/api/articles?enVedette=true&limit=1"),
        ]);
        setArticleVedette(resVedette.data.data?.[0] || null);

        setArticles(resArticles.data.data);

        const maintenant = new Date();
        setEvenements(
          resEvents.data.data
            .filter((ev) => new Date(ev.dateDebut) > maintenant)
            .slice(0, 3),
        );

        setTournois(
          resTournois.data.data
            .filter((t) => t.statut === "ouvert")
            .slice(0, 3),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  return (
    <>
      <Hero />

      {/* Article en vedette */}
      {articleVedette && (
        <section className={styles.sectionVedette}>
          <div className="container">
            <div
              className={styles.carteVedette}
              style={{ backgroundImage: articleVedette.imageUrl ? `url(${articleVedette.imageUrl})` : undefined }}>
              <div className={styles.vedetteOverlay}>
                <span className={styles.badgeVedette}>EN VEDETTE</span>
                <h2 className={styles.vedetteTitre}>{articleVedette.titre}</h2>
                <p className={styles.vedetteCategorie}>{articleVedette.categorie}</p>
                <Link to={`/articles/${articleVedette._id}`} className={styles.vedetteLien}>
                  Lire l'article →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tableau de bord global (Bento Grid) */}
      <section className={styles.dashboardSection}>
        <div className={`container ${styles.bentoContainer}`}>
          
          {/* Colonne de gauche : Articles récents */}
          <div className={styles.bentoCol}>
            <div className={styles.sectionEntete}>
              <div>
                <h2 className={styles.sectionTitre}>Actualités Fennec</h2>
                <p className={styles.sectionSousTitre}>
                  Les dernières publications de la communauté
                </p>
              </div>
              <Link to="/articles" className={styles.voirTout}>Voir tout →</Link>
            </div>
            
            {chargement ? (
              <SkeletonGrille nombre={4} />
            ) : (
              <div className={styles.articlesGrille}>
                {articles.map((article) => (
                  <CarteArticle key={article._id} article={article} />
                ))}
              </div>
            )}
          </div>

          {/* Colonne de droite : Tournois, Arcade, Events */}
          <div className={styles.bentoCol}>
            
            {/* Tournois & Événements (Empilés) */}
            <div className={styles.eventsGrid}>
              
              {/* Tournois */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <h3>🏆 Tournois ouverts</h3>
                  <Link to="/tournaments" className={styles.lienDiscret}>Voir →</Link>
                </div>
                <div className={styles.cardBody}>
                  {chargement ? (
                    <SkeletonGrille nombre={1} />
                  ) : tournois.length === 0 ? (
                    <p className={styles.vide}>Aucun tournoi ouvert.</p>
                  ) : (
                    <div className={styles.tournoisListe}>
                      {tournois.map((t) => (
                        <CarteTournoi key={t._id} tournoi={t} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Evénements */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <h3>📅 Événements à venir</h3>
                  <Link to="/events" className={styles.lienDiscret}>Voir →</Link>
                </div>
                <div className={styles.cardBody}>
                  {chargement ? (
                    <SkeletonGrille nombre={1} />
                  ) : evenements.length === 0 ? (
                    <p className={styles.vide}>Aucun événement prévu.</p>
                  ) : (
                    <div className={styles.eventsListe}>
                      {evenements.map((ev) => (
                        <CarteEvenement key={ev._id} evenement={ev} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Arcade Fennec (Bannière premium) */}
            <div className={styles.arcadeBento}>
              <div className={styles.arcadeBentoContent}>
                <div className={styles.arcadeBentoHeader}>
                  <h3>🕹️ Arcade Fennec</h3>
                  <p>Affronte tes amis et gagne de l'XP et des FM !</p>
                </div>
                <div className={styles.arcadeBentoIcons}>
                  <span>🏓 Pong</span>
                  <span>🐍 Snake</span>
                  <span>🎮 Quiz</span>
                </div>
                <Link to="/arcade" className={styles.arcadeBtn}>Entrer dans l'Arcade</Link>
              </div>
            </div>

          </div>

        </div>
      </section>

    </>
  );
}

export default HomePage;

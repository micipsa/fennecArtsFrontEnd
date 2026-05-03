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
import AnecdoteAleatoire from "../components/Anecdotes/AnecdoteAleatoire";
import CitationAleatoire from "../components/Citations/CitationAleatoire";
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
          api.get("/api/articles?limit=3&page=1"),
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
                <a href={`/articles/${articleVedette._id}`} className={styles.vedetteLien}>
                  Lire l'article →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={`${styles.sectionTransition} ${styles.versRouge}`} />

      {/* Section 1 : Articles récents */}
      <section className={`${styles.section} ${styles.sectionFlottants}`}>
        <span className={`${styles.kanjiDecor} ${styles.gauche}`}>新</span>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={`${styles.sectionTitre} ${styles.sectionEnteteAnimee}`}>Articles récents</h2>
              <p className={styles.sectionSousTitre}>
                Les dernières publications de la communauté
              </p>
            </div>
            <Link to="/articles" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <SkeletonGrille nombre={3} />
          ) : (
            <div className={styles.grille}>
              {articles.map((article) => (
                <CarteArticle key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className={`${styles.sectionTransition} ${styles.versAccent}`} />

      <AnecdoteAleatoire />

      {/* Section 2 : Tournois ouverts */}
      <section className={`${styles.section} ${styles.sectionSombre} ${styles.sectionFlottants}`}>
        <span className={`${styles.kanjiDecor} ${styles.droite}`}>戦</span>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={`${styles.sectionTitre} ${styles.sectionEnteteAnimee}`}>🏆 Tournois ouverts</h2>
              <p className={styles.sectionSousTitre}>
                Inscrivez-vous avant qu'il ne soit trop tard
              </p>
            </div>
            <Link to="/tournaments" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <SkeletonGrille nombre={3} />
          ) : tournois.length === 0 ? (
            <p className={styles.vide}>Aucun tournoi ouvert pour le moment.</p>
          ) : (
            <div className={styles.grille}>
              {tournois.map((t) => (
                <CarteTournoi key={t._id} tournoi={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className={`${styles.sectionTransition} ${styles.versRouge}`} />

      {/* Section 3 : Événements à venir */}
      <section className={`${styles.section} ${styles.sectionFlottants}`}>
        <span className={`${styles.kanjiDecor} ${styles.gauche}`}>祭</span>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={`${styles.sectionTitre} ${styles.sectionEnteteAnimee}`}>Événements à venir</h2>
              <p className={styles.sectionSousTitre}>
                Ne manquez aucun événement de la scène
              </p>
            </div>
            <Link to="/events" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <SkeletonGrille nombre={3} />
          ) : evenements.length === 0 ? (
            <p className={styles.vide}>
              Aucun événement à venir pour le moment.
            </p>
          ) : (
            <div className={styles.grille}>
              {evenements.map((ev) => (
                <CarteEvenement key={ev._id} evenement={ev} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CitationAleatoire />
    </>
  );
}

export default HomePage;

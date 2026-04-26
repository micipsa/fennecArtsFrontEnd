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
import styles from "./HomePage.module.css";

function HomePage() {
  // States pour les données de chaque section
  const [articles, setArticles] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Chargement des données au montage du composant
  useEffect(() => {
    const charger = async () => {
      try {
        // Requêtes en parallèle : articles, événements et tournois
        const [resArticles, resEvents, resTournois] = await Promise.all([
          api.get("/api/articles?limit=3&page=1"), // 3 articles les plus récents
          api.get("/api/events"),                   // Tous les événements
          api.get("/api/tournaments"),              // Tous les tournois
        ]);

        // Articles : on utilise directement les 3 renvoyés par l'API
        setArticles(resArticles.data.data);

        // Événements : on filtre côté client pour ne garder que ceux à venir
        // puis on prend les 3 premiers
        const maintenant = new Date();
        setEvenements(
          resEvents.data.data
            .filter((ev) => new Date(ev.dateDebut) > maintenant)
            .slice(0, 3),
        );

        // Tournois : on filtre pour ne garder que les tournois ouverts
        // puis on prend les 3 premiers
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
  }, []); // [] = exécuté une seule fois au montage

  return (
    <>
      {/* ── Section Hero (bannière d'introduction) ── */}
      <Hero />

      {/* ══════════════════════════════════════════════
          Section 1 : Articles récents
          ══════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={styles.sectionTitre}>Articles récents</h2>
              <p className={styles.sectionSousTitre}>
                Les dernières publications de la communauté
              </p>
            </div>
            <Link to="/articles" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <Spinner />
          ) : (
            <div className={styles.grille}>
              {articles.map((article) => (
                <CarteArticle key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          Section 2 : Tournois ouverts
          ══════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.sectionSombre}`}>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={styles.sectionTitre}>🏆 Tournois ouverts</h2>
              <p className={styles.sectionSousTitre}>
                Inscrivez-vous avant qu'il ne soit trop tard
              </p>
            </div>
            <Link to="/tournaments" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <Spinner />
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

      {/* ══════════════════════════════════════════════
          Section 3 : Événements à venir
          ══════════════════════════════════════════════ */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionEntete}>
            <div>
              <h2 className={styles.sectionTitre}>Événements à venir</h2>
              <p className={styles.sectionSousTitre}>
                Ne manquez aucun événement de la scène
              </p>
            </div>
            <Link to="/events" className={styles.voirTout}>
              Voir tout →
            </Link>
          </div>
          {chargement ? (
            <Spinner />
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
    </>
  );
}

export default HomePage;

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
  const [articles, setArticles] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resArticles, resEvents, resTournois] = await Promise.all([
          api.get("/api/articles?limit=3&page=1"),
          api.get("/api/events"),
          api.get("/api/tournaments"),
        ]);

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

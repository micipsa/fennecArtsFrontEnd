import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Hero from "../components/UI/Hero";
import CarteArticle from "../components/Cards/CarteArticle";
import CarteEvenement from "../components/Cards/CarteEvenement";
import Spinner from "../components/UI/Spinner";
import styles from "./HomePage.module.css";

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resArticles, resEvents] = await Promise.all([
          api.get("/api/articles?limit=3&page=1"),
          api.get("/api/events"),
        ]);
        setArticles(resArticles.data.data);
        const tousEvents = resEvents.data.data;
        const maintenant = new Date();
        const aVenir = tousEvents
          .filter((ev) => new Date(ev.dateDebut) > maintenant)
          .slice(0, 3);
        setEvenements(aVenir);
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

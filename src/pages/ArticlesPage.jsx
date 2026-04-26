import { useState, useEffect } from "react";
import api from "../services/api";
import CarteArticle from "../components/Cards/CarteArticle";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Pagination from "../components/UI/Pagination";
import styles from "./ArticlesPage.module.css";

const CATEGORIES = [
  "Toutes",
  "Peinture",
  "Musique",
  "Théâtre",
  "Littérature",
  "Cinéma",
  "Danse",
];
const LIMITE = 9;

function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categorie, setCategorie] = useState("Toutes");

  useEffect(() => {
    const chargerArticles = async () => {
      try {
        setChargement(true);
        setErreur(null);

        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", LIMITE);
        if (categorie !== "Toutes") params.append("categorie", categorie);

        const res = await api.get(`/api/articles?${params.toString()}`);
        setArticles(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        setErreur(
          err.response?.data?.message || "Impossible de charger les articles.",
        );
      } finally {
        setChargement(false);
      }
    };

    chargerArticles();
  }, [page, categorie]);

  const handleCategorie = (nouvelleCategorie) => {
    setCategorie(nouvelleCategorie);
    setPage(1);
  };

  return (
    <div className="container">
      <div className={styles.entete}>
        <h1 className={styles.titre}>Articles</h1>
        <p className={styles.sousTitre}>
          Explorez nos publications culturelles
        </p>
      </div>

      <div className={styles.filtres}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filtreBouton} ${categorie === cat ? styles.filtreActif : ""}`}
            onClick={() => handleCategorie(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {chargement && <Spinner />}

      {erreur && (
        <MessageErreur message={erreur} onReessayer={() => setPage(1)} />
      )}

      {!chargement && !erreur && articles.length === 0 && (
        <p className={styles.vide}>
          Aucun article trouvé pour cette catégorie.
        </p>
      )}

      {!chargement && !erreur && articles.length > 0 && (
        <>
          <div className={styles.grille}>
            {articles.map((article) => (
              <CarteArticle key={article._id} article={article} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPagePrecedente={() => setPage((p) => p - 1)}
            onPageSuivante={() => setPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}

export default ArticlesPage;

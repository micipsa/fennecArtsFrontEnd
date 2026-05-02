/**
 * ArticlesPage — page listant tous les articles avec filtres et pagination.
 *
 * Fonctionnalités :
 * - Filtrage par catégorie (boutons : Toutes, Peinture, Musique, etc.)
 * - Pagination côté serveur (9 articles par page, paramètre `limit`)
 * - Gestion des états : chargement, erreur, liste vide
 *
 * Le useEffect se déclenche à chaque changement de `page` ou `categorie`,
 * ce qui relance automatiquement la requête API avec les nouveaux paramètres.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import CarteArticle from "../components/Cards/CarteArticle";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Pagination from "../components/UI/Pagination";
import styles from "./ArticlesPage.module.css";

// Liste des catégories disponibles pour le filtrage
const CATEGORIES = [
  "Toutes",
  "High-tech",
  "Manga",
  "Graphisme",
  "Esport",
  "Geekerie",
  "Bon Plan",
  "Photographie",
  "Gaming",
  "DIY",
  "Programmation",
  "TCG/JCC",
  "Littérature",
  "Chroniques",
  "Cinéma",
  "Let's Play",
];

// Nombre d'articles affichés par page
const LIMITE = 9;

function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTag = searchParams.get("tag");
  // ── States ──
  const [articles, setArticles] = useState([]); // Liste des articles
  const [chargement, setChargement] = useState(true); // Indicateur de chargement
  const [erreur, setErreur] = useState(null); // Message d'erreur
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categorie, setCategorie] = useState("Toutes");
  const [tagActif, setTagActif] = useState(urlTag);
  const [tagsDisponibles, setTagsDisponibles] = useState([]);

  useEffect(() => {
    setTagActif(urlTag);
  }, [urlTag]);

  useEffect(() => {
    const chargerArticles = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", LIMITE);
        if (categorie !== "Toutes") params.append("categorie", categorie);
        if (tagActif) params.append("tag", tagActif);
        const res = await api.get(`/api/articles?${params.toString()}`);
        setArticles(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        const tags = [...new Set(res.data.data.flatMap((a) => a.tags || []))];
        setTagsDisponibles(tags);
      } catch (err) {
        setErreur(err.response?.data?.message || "Impossible de charger les articles.");
      } finally {
        setChargement(false);
      }
    };
    chargerArticles();
  }, [page, categorie, tagActif]);

  const handleCategorie = (nouvelleCategorie) => {
    setCategorie(nouvelleCategorie);
    setTagActif(null);
    setPage(1);
  };

  const handleTag = (tag) => {
    const nouveauTag = tag === tagActif ? null : tag;
    setTagActif(nouveauTag);
    if (nouveauTag) setSearchParams({ tag: nouveauTag });
    else setSearchParams({});
    setPage(1);
  };

  return (
    <div className="container">
      {/* ── En-tête de la page ── */}
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

      {tagsDisponibles.length > 0 && (
        <div className={styles.filtresTags}>
          {tagsDisponibles.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagChip} ${tagActif === tag ? styles.tagChipActif : ""}`}
              onClick={() => handleTag(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* ── États conditionnels : chargement, erreur, liste vide ── */}
      {chargement && <Spinner />}

      {erreur && (
        <MessageErreur message={erreur} onReessayer={() => setPage(1)} />
      )}

      {!chargement && !erreur && articles.length === 0 && (
        <p className={styles.vide}>
          Aucun article trouvé pour cette catégorie.
        </p>
      )}

      {/* ── Grille d'articles + pagination ── */}
      {!chargement && !erreur && articles.length > 0 && (
        <>
          <div className={styles.grille}>
            {articles.map((article) => (
              <CarteArticle key={article._id} article={article} />
            ))}
          </div>
          {/* Composant de pagination */}
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

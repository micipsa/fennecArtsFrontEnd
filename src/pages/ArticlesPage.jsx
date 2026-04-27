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
  // ── States ──
  const [articles, setArticles] = useState([]); // Liste des articles
  const [chargement, setChargement] = useState(true); // Indicateur de chargement
  const [erreur, setErreur] = useState(null); // Message d'erreur
  const [page, setPage] = useState(1); // Numéro de page courante
  const [totalPages, setTotalPages] = useState(1); // Nombre total de pages
  const [categorie, setCategorie] = useState("Toutes"); // Filtre de catégorie actif

  // ── Chargement des articles quand la page ou la catégorie change ──
  useEffect(() => {
    const chargerArticles = async () => {
      try {
        setChargement(true);
        setErreur(null);

        // Construction des paramètres de requête (query string)
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", LIMITE);
        // On n'ajoute le filtre catégorie que si ce n'est pas "Toutes"
        if (categorie !== "Toutes") params.append("categorie", categorie);

        // Requête GET avec les paramètres de pagination et filtrage
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
  }, [page, categorie]); // Dépendances : relance à chaque changement

  /**
   * Changement de catégorie : met à jour le filtre et remet la page à 1.
   */
  const handleCategorie = (nouvelleCategorie) => {
    setCategorie(nouvelleCategorie);
    setPage(1); // On revient à la page 1 quand on change de catégorie
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

      {/* ── Boutons de filtre par catégorie ── */}
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

import { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import styles from "./StorePage.module.css";

const CATEGORIES = [
  { id: "tous", label: "Tous les articles" },
  { id: "cadre_profil", label: "Cadres Profil" },
  { id: "titre_custom", label: "Titres Custom" },
  { id: "couleur_pseudo", label: "Couleurs" },
  { id: "boost_xp", label: "Boosts XP" },
  { id: "ticket_tournoi", label: "Tickets Tournoi" },
  { id: "goodies", label: "Goodies" }
];

export default function StorePage() {
  const { utilisateur } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categorie, setCategorie] = useState("tous");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get("/api/store");
        setArticles(res.data.data);
      } catch (err) {
        addToast("Erreur lors du chargement de la boutique", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleAchat = async (article) => {
    if (!utilisateur) return addToast("Vous devez être connecté", "error");
    if (utilisateur.fm < article.prix) return addToast("Fonds insuffisants", "error");
    
    if (confirm(`Acheter "${article.nom}" pour ${article.prix} FM ?`)) {
      try {
        await api.post(`/api/store/${article._id}/acheter`);
        addToast("Achat réussi ! Retrouvez-le dans votre inventaire.", "success");
        // Simuler mise à jour FM locale
        utilisateur.fm -= article.prix;
      } catch (err) {
        addToast(err.response?.data?.message || "Erreur lors de l'achat", "error");
      }
    }
  };

  const filteredArticles = categorie === "tous" 
    ? articles 
    : articles.filter(a => a.type === categorie);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.fumee} />

      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>SACRED SHOP</h1>
        <p className={styles.pageSousTitre}>Marchand mystique</p>
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
        <div className={styles.titreBox}>
          <h1>Boutique <span>Fennec</span></h1>
          <p>Dépense tes FM pour personnaliser ton profil et acheter des avantages exclusifs.</p>
        </div>
        {utilisateur && (
          <div className={styles.solde}>
            <span>Solde actuel</span>
            <strong>🪙 {utilisateur.fm} FM</strong>
          </div>
        )}
      </header>

      <nav className={styles.categories}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} 
            className={categorie === cat.id ? styles.active : ""}
            onClick={() => setCategorie(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className={styles.loading}>Chargement de la boutique...</div>
      ) : (
        <div className={styles.grid}>
          {filteredArticles.length === 0 ? (
            <div className={styles.empty}>Aucun article disponible dans cette catégorie.</div>
          ) : (
            filteredArticles.map(article => (
              <div key={article._id} className={styles.card}>
                <div className={styles.imageBox}>
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.nom} />
                  ) : (
                    <div className={styles.imagePlaceholder}>🛒</div>
                  )}
                  {article.stock !== -1 && (
                    <span className={styles.stockBadge}>
                      {article.stock > 0 ? `${article.stock} restants` : "Rupture"}
                    </span>
                  )}
                </div>
                <div className={styles.infoBox}>
                  <span className={styles.typeTag}>{CATEGORIES.find(c => c.id === article.type)?.label}</span>
                  <h3>{article.nom}</h3>
                  <p>{article.description}</p>
                  <div className={styles.footer}>
                    <span className={styles.prix}>🪙 {article.prix} FM</span>
                    <button 
                      className={styles.btnAcheter} 
                      onClick={() => handleAchat(article)}
                      disabled={!utilisateur || utilisateur.fm < article.prix || (article.stock !== -1 && article.stock <= 0)}
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  );
}

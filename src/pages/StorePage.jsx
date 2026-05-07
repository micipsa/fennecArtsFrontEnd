import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import LevelUpAnimation from "../components/UI/LevelUpAnimation";
import styles from "./StorePage.module.css";

const CATEGORIES = [
  { id: "tous", label: "Tous les articles" },
  { id: "avatar_icon", label: "Avatars" },
  { id: "cadre_profil", label: "Cadres Profil" },
  { id: "fond_carte", label: "Fonds de Carte" },
  { id: "titre_custom", label: "Titres Custom" },
  { id: "couleur_pseudo", label: "Couleurs" },
  { id: "boost_xp", label: "Boosts XP" },
  { id: "ticket_tournoi", label: "Tickets Tournoi" },
  { id: "goodies", label: "Goodies" }
];

const COULEURS_RARETE = {
  commun: { couleur: "#b0b0b0", label: "Commun", glow: "none" },
  rare: { couleur: "#3498db", label: "Rare", glow: "0 0 8px rgba(52,152,219,0.5)" },
  epique: { couleur: "#9b59b6", label: "Épique", glow: "0 0 12px rgba(155,89,182,0.6)" },
  legendaire: { couleur: "#f39c12", label: "Légendaire", glow: "0 0 16px rgba(243,156,18,0.7)" },
};

export default function StorePage() {
  const { utilisateur } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categorie, setCategorie] = useState("tous");
  const [loading, setLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);
  const [inventaire, setInventaire] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, invRes] = await Promise.all([
          api.get("/api/store"),
          utilisateur ? api.get("/api/store/inventaire/me") : Promise.resolve({ data: { data: [] } }),
        ]);
        setArticles(storeRes.data.data);
        setInventaire(invRes.data.data || []);
      } catch (err) {
        addToast("Erreur lors du chargement de la boutique", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAchat = async (article) => {
    if (!utilisateur) return addToast("Vous devez être connecté", "error");
    if (utilisateur.fm < article.prix) return addToast("Fonds insuffisants", "error");
    
    if (confirm(`Acheter "${article.nom}" pour ${article.prix} FM ?`)) {
      try {
        const res = await api.post(`/api/store/${article._id}/acheter`);
        
        if (res.data.levelUp) {
          setLevelUpData(res.data.xpGagne);
        } else {
          addToast("Achat réussi ! Retrouvez-le dans votre inventaire.", "success");
        }
        
        // Ajouter à l'inventaire local pour update l'affichage
        setInventaire(prev => [...prev, { article: article._id }]);
        // Mettre à jour FM localement
        utilisateur.fm -= article.prix;
      } catch (err) {
        addToast(err.response?.data?.message || "Erreur lors de l'achat", "error");
      }
    }
  };

  const filteredArticles = categorie === "tous" 
    ? articles 
    : articles.filter(a => a.type === categorie);

  // Vérifier si un article est déjà possédé
  const estPossede = (articleId) => {
    return inventaire.some(inv => {
      const id = inv.article?._id || inv.article;
      return id === articleId;
    });
  };

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
            <strong>💰 {utilisateur.fm} FM</strong>
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

      {/* Bannière Lootbox */}
      <Link to="/lootbox" className={styles.lootboxBanner}>
        <span className={styles.lootboxIcone}>🎁</span>
        <div>
          <strong>LOOTBOX</strong>
          <span>Tente ta chance pour 100 FM !</span>
        </div>
        <span className={styles.lootboxFleche}>→</span>
      </Link>

      {/* Bannière Ticket à Gratter */}
      <Link to="/fortune" className={styles.lootboxBanner}>
        <span className={styles.lootboxIcone}>🎫</span>
        <div>
          <strong>TICKET À GRATTER</strong>
          <span>1 ticket gratuit par jour !</span>
        </div>
        <span className={styles.lootboxFleche}>→</span>
      </Link>

      {/* Bannière Classeur TCG */}
      <Link to="/classeur" className={styles.lootboxBanner}>
        <span className={styles.lootboxIcone}>🃏</span>
        <div>
          <strong>CLASSEUR DE CARTES</strong>
          <span>Collectionne des cartes TCG exclusives !</span>
        </div>
        <span className={styles.lootboxFleche}>→</span>
      </Link>

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
                  {article.type === "fond_carte" && article.donnees?.style ? (
                    <div className={styles.fondPreview} data-fond={article.donnees.style}>
                      {article.donnees.style === "controller" && "🎮"}
                      {article.donnees.style === "code" && "⌨️"}
                      {article.donnees.style === "synthwave" && "🌅"}
                      {article.donnees.style === "dragon" && "🐉"}
                      {article.donnees.style === "sakura" && "🌸"}
                    </div>
                  ) : article.imageUrl ? (
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
                  <h3 style={
                    article.donnees?.rarete && COULEURS_RARETE[article.donnees.rarete]
                      ? { color: COULEURS_RARETE[article.donnees.rarete].couleur, textShadow: COULEURS_RARETE[article.donnees.rarete].glow }
                      : {}
                  }>{article.nom}</h3>
                  {article.donnees?.rarete && COULEURS_RARETE[article.donnees.rarete] && (
                    <span
                      className={styles.rareteBadge}
                      style={{ color: COULEURS_RARETE[article.donnees.rarete].couleur, borderColor: COULEURS_RARETE[article.donnees.rarete].couleur }}
                    >
                      ✦ {COULEURS_RARETE[article.donnees.rarete].label.toUpperCase()}
                    </span>
                  )}
                  <p>{article.description}</p>
                  <div className={styles.footer}>
                    <span className={styles.prix}>💰 {article.prix} FM</span>
                    {estPossede(article._id) ? (
                      <button className={styles.btnAcheter} disabled style={{ background: '#28a745', borderColor: '#28a745', color: '#fff', opacity: 1 }}>
                        Possédé ✓
                      </button>
                    ) : (
                      <button 
                        className={styles.btnAcheter} 
                        onClick={() => handleAchat(article)}
                        disabled={!utilisateur || utilisateur.fm < article.prix || (article.stock !== -1 && article.stock <= 0)}
                      >
                        Acheter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {levelUpData && (
        <LevelUpAnimation 
          xpGagne={levelUpData} 
          onClose={() => setLevelUpData(null)} 
        />
      )}
      </div>
    </div>
  );
}

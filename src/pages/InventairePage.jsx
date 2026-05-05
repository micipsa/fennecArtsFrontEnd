import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import styles from "./InventairePage.module.css";

const CATEGORIES = [
  { id: "tous", label: "Tous", icone: "📦" },
  { id: "cadre_profil", label: "Cadres", icone: "🖼️" },
  { id: "couleur_pseudo", label: "Couleurs", icone: "🎨" },
  { id: "avatar_icon", label: "Avatars", icone: "🦊" },
  { id: "titre_custom", label: "Titres", icone: "🏷️" },
  { id: "autres", label: "Autres", icone: "📜" },
];

export default function InventairePage() {
  const { utilisateur, updateUtilisateurLocal } = useAuth();
  const [achats, setAchats] = useState([]);
  const [categorie, setCategorie] = useState("tous");
  const [equipes, setEquipes] = useState({
    cadre: null,
    titre: null,
    couleur: null,
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchInventaire = async () => {
      try {
        const res = await api.get("/api/store/inventaire/me");
        setAchats(res.data.data);
        setEquipes(res.data.equipes);
      } catch (err) {
        addToast("Impossible de charger l'inventaire", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInventaire();
  }, []);

  const handleEquiper = async (achatId, type) => {
    try {
      const res = await api.patch(`/api/store/equiper/${achatId}`);
      addToast("Profil mis à jour", "success");

      const userMAJ = res.data.data;
      setEquipes({
        cadre: userMAJ.cadreProfilActif,
        titre: userMAJ.titreActif,
        couleur: userMAJ.couleurPseudoActive,
        avatar: userMAJ.avatarActif,
      });
      if (updateUtilisateurLocal) updateUtilisateurLocal(userMAJ);
    } catch (err) {
      addToast("Erreur lors de l'équipement", "error");
    }
  };

  const isEquipe = (achat) => {
    if (!achat.article) return false;
    if (achat.article.type === "cadre_profil")
      return equipes.cadre === achat._id;
    if (achat.article.type === "titre_custom")
      return equipes.titre === achat.article.donnees?.titre;
    if (achat.article.type === "couleur_pseudo")
      return equipes.couleur === achat.article.donnees?.couleur;
    if (achat.article.type === "avatar_icon") {
      const avatarUrl = achat.article.donnees?.avatarUrl || achat.article.imageUrl;
      return equipes.avatar === avatarUrl;
    }
    return false;
  };

  // Filtrage par catégorie
  const TYPES_PRINCIPAUX = ["cadre_profil", "couleur_pseudo", "avatar_icon", "titre_custom"];
  const filteredAchats = achats.filter((a) => {
    if (!a.article) return false;
    if (categorie === "tous") return true;
    if (categorie === "autres") return !TYPES_PRINCIPAUX.includes(a.article.type);
    return a.article.type === categorie;
  });

  // Compteurs par catégorie
  const compteurs = {
    tous: achats.filter(a => a.article).length,
    cadre_profil: achats.filter(a => a.article?.type === "cadre_profil").length,
    couleur_pseudo: achats.filter(a => a.article?.type === "couleur_pseudo").length,
    avatar_icon: achats.filter(a => a.article?.type === "avatar_icon").length,
    titre_custom: achats.filter(a => a.article?.type === "titre_custom").length,
    autres: achats.filter(a => a.article && !TYPES_PRINCIPAUX.includes(a.article.type)).length,
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>SAGE'S VAULT</h1>
        <p className={styles.pageSousTitre}>Inventaire RPG</p>
      </div>

      <div className={styles.contenu}>
        <header className={styles.header}>
          <h1>
            Mon <span>Inventaire</span>
          </h1>
          <p>Gère tes objets achetés et personnalise ton profil.</p>
        </header>

        {/* Barre de catégories */}
        <nav className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${categorie === cat.id ? styles.catBtnActive : ""}`}
              onClick={() => setCategorie(cat.id)}
            >
              <span className={styles.catIcone}>{cat.icone}</span>
              <span className={styles.catLabel}>{cat.label}</span>
              <span className={styles.catCount}>{compteurs[cat.id] || 0}</span>
            </button>
          ))}
        </nav>

        {loading ? (
          <div className={styles.loading}>Chargement de l'inventaire...</div>
        ) : filteredAchats.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎒</div>
            <p>{categorie === "tous" ? "Ton inventaire est vide." : "Aucun objet dans cette catégorie."}</p>
            <Link to="/store" className={styles.btnStore}>
              Visiter la boutique
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredAchats.map((achat) => (
              <div
                key={achat._id}
                className={`${styles.card} ${isEquipe(achat) ? styles.equipeCard : ""}`}>
                {isEquipe(achat) && (
                  <div className={styles.badgeEquipe}>ÉQUIPÉ</div>
                )}

                {/* Badge de source (lootbox vs achat) */}
                {achat.prixPaye === 0 && (
                  <div className={styles.badgeLootbox}>🎁</div>
                )}

                <div className={styles.imageBox}>
                  {achat.article?.type === "couleur_pseudo" && achat.article?.donnees?.couleur ? (
                    <div
                      className={styles.couleurPreview}
                      style={{ background: achat.article.donnees.couleur, boxShadow: `0 0 20px ${achat.article.donnees.couleur}` }}
                    />
                  ) : achat.article?.imageUrl ? (
                    <img src={achat.article.imageUrl} alt={achat.article.nom} />
                  ) : (
                    <div className={styles.placeholderIcon}>✨</div>
                  )}
                </div>
                <div className={styles.infoBox}>
                  <h3>{achat.article?.nom || "Article inconnu"}</h3>
                  <div className={styles.actions}>
                    {["cadre_profil", "titre_custom", "couleur_pseudo", "avatar_icon"].includes(
                      achat.article?.type,
                    ) ? (
                      <button
                        className={`${styles.btnEquiper} ${isEquipe(achat) ? styles.btnDesequiper : ""}`}
                        onClick={() =>
                          handleEquiper(achat._id, achat.article.type)
                        }>
                        {isEquipe(achat) ? "Retirer" : "Équiper"}
                      </button>
                    ) : (
                      <span className={styles.statutLabel}>
                        {achat.statut === "consomme" ? "Utilisé" : achat.statut}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

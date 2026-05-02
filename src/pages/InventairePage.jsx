import { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/UI/Toast";
import styles from "./InventairePage.module.css";

export default function InventairePage() {
  const { utilisateur, updateUtilisateurLocal } = useAuth();
  const [achats, setAchats] = useState([]);
  const [equipes, setEquipes] = useState({
    cadre: null,
    titre: null,
    couleur: null,
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

      // Update local state
      const userMAJ = res.data.data;
      setEquipes({
        cadre: userMAJ.cadreProfilActif,
        titre: userMAJ.titreActif,
        couleur: userMAJ.couleurPseudoActive,
      });
      // Optionnel: update auth context
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
    return false;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          Mon <span>Inventaire</span>
        </h1>
        <p>Gère tes objets achetés et personnalise ton profil.</p>
      </header>

      {loading ? (
        <div className={styles.loading}>Chargement de l'inventaire...</div>
      ) : achats.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎒</div>
          <p>Ton inventaire est vide.</p>
          <a href="/store" className={styles.btnStore}>
            Visiter la boutique
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {achats.map((achat) => (
            <div
              key={achat._id}
              className={`${styles.card} ${isEquipe(achat) ? styles.equipeCard : ""}`}>
              {isEquipe(achat) && (
                <div className={styles.badgeEquipe}>ÉQUIPÉ</div>
              )}
              <div className={styles.imageBox}>
                {achat.article?.imageUrl ? (
                  <img src={achat.article.imageUrl} alt={achat.article.nom} />
                ) : (
                  <div className={styles.placeholderIcon}>✨</div>
                )}
              </div>
              <div className={styles.infoBox}>
                <h3>{achat.article?.nom || "Article inconnu"}</h3>
                <p>{achat.article?.description}</p>
                <div className={styles.actions}>
                  {["cadre_profil", "titre_custom", "couleur_pseudo"].includes(
                    achat.article?.type,
                  ) ? (
                    <button
                      className={`${styles.btnEquiper} ${isEquipe(achat) ? styles.btnDesequiper : ""}`}
                      onClick={() =>
                        handleEquiper(achat._id, achat.article.type)
                      }>
                      {isEquipe(achat) ? "Déséquiper" : "Équiper"}
                    </button>
                  ) : (
                    <span className={styles.statutLabel}>
                      Statut: {achat.statut}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

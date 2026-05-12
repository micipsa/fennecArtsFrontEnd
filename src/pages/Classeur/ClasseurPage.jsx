/**
 * ClasseurPage — Page de collection de cartes TCG de l'utilisateur.
 * 
 * Affiche le classeur avec toutes les cartes collectionnées,
 * les stats de complétion, et la boutique de cartes.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import styles from "./ClasseurPage.module.css";

const RARETE_CONFIG = {
  commun:     { label: "Commun",     couleur: "#8c8c8c", glow: "rgba(140,140,140,0.3)" },
  rare:       { label: "Rare",       couleur: "#3498db", glow: "rgba(52,152,219,0.4)" },
  epique:     { label: "Épique",     couleur: "#9b59b6", glow: "rgba(155,89,182,0.4)" },
  legendaire: { label: "Légendaire", couleur: "#ffd700", glow: "rgba(255,215,0,0.5)" },
  mythique:   { label: "Mythique",   couleur: "#e74c3c", glow: "rgba(231,76,60,0.5)" },
};

function CartePreview({ carte, brillant, onClick }) {
  const config = RARETE_CONFIG[carte.rarete] || RARETE_CONFIG.commun;
  return (
    <div
      className={`${styles.carteItem} ${brillant ? styles.brillant : ""}`}
      style={{ "--carte-glow": config.glow, "--carte-border": config.couleur }}
      onClick={() => onClick(carte)}
    >
      {brillant && <div className={styles.brillantBadge}>✨</div>}
      <div className={styles.carteImage}>
        <img src={carte.imageUrl} alt={carte.nom} loading="lazy" />
      </div>
      <div className={styles.carteInfo}>
        <span className={styles.carteRarete} style={{ color: config.couleur }}>
          {config.label}
        </span>
        <h4 className={styles.carteNom}>{carte.nom}</h4>
        <span className={styles.carteSerie}>{carte.serie}</span>
      </div>
    </div>
  );
}

function CarteDetail({ carte, brillant, onClose }) {
  const config = RARETE_CONFIG[carte.rarete] || RARETE_CONFIG.commun;
  return createPortal(
    <div className={styles.detailOverlay} onClick={onClose}>
      <div className={styles.detailCard} onClick={e => e.stopPropagation()} style={{ "--carte-border": config.couleur, "--carte-glow": config.glow }}>
        {brillant && <div className={styles.detailBrillant}>✨ BRILLANTE</div>}
        <div className={styles.detailImage}>
          <img src={carte.imageUrl} alt={carte.nom} />
        </div>
        <div className={styles.detailBody}>
          <span className={styles.detailRarete} style={{ color: config.couleur }}>{config.label}</span>
          <h2 className={styles.detailNom}>{carte.nom}</h2>
          <p className={styles.detailDesc}>{carte.description}</p>
          <div className={styles.detailSerie}>{carte.serie} • {carte.categorie}</div>
          
          {/* Stats TCG */}
          {carte.stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statBar}>
                <span>⚔️ ATK</span>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${carte.stats.attaque}%`, background: "#e74c3c" }} /></div>
                <span>{carte.stats.attaque}</span>
              </div>
              <div className={styles.statBar}>
                <span>🛡️ DEF</span>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${carte.stats.defense}%`, background: "#3498db" }} /></div>
                <span>{carte.stats.defense}</span>
              </div>
              <div className={styles.statBar}>
                <span>⚡ VIT</span>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${carte.stats.vitesse}%`, background: "#2ecc71" }} /></div>
                <span>{carte.stats.vitesse}</span>
              </div>
              <div className={styles.statBar}>
                <span>💎 CHA</span>
                <div className={styles.barBg}><div className={styles.barFill} style={{ width: `${carte.stats.charisme}%`, background: "#9b59b6" }} /></div>
                <span>{carte.stats.charisme}</span>
              </div>
            </div>
          )}
          
          {carte.edition !== "standard" && (
            <div className={styles.editionBadge}>
              {carte.edition === "limitee" ? "⭐ ÉDITION LIMITÉE" : "🌟 UNIQUE"}
            </div>
          )}
          
          {carte.artisteNom && (
            <div className={styles.artisteText}>
              Illustration by {carte.artisteNom}
            </div>
          )}
        </div>
        <button className={styles.detailClose} onClick={onClose}>Fermer</button>
      </div>
    </div>,
    document.body
  );
}

export default function ClasseurPage() {
  const { utilisateur } = useAuth();
  const [onglet, setOnglet] = useState("collection"); // collection | boutique | catalogue
  const [collection, setCollection] = useState([]);
  const [stats, setStats] = useState(null);
  const [boutique, setBoutique] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [carteSelectionnee, setCarteSelectionnee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achatEnCours, setAchatEnCours] = useState(false);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [colRes, boutRes, catRes] = await Promise.all([
        api.get("/api/cartes/ma-collection"),
        api.get("/api/cartes/boutique"),
        api.get("/api/cartes"),
      ]);
      setCollection(colRes.data.data.collection);
      setStats(colRes.data.data.stats);
      setBoutique(boutRes.data.data);
      setCatalogue(catRes.data.data);
    } catch (err) {
      console.error("Erreur chargement classeur:", err);
    }
    setLoading(false);
  };

  const acheterCarte = async (carteId) => {
    if (achatEnCours) return;
    setAchatEnCours(true);
    try {
      await api.post(`/api/cartes/${carteId}/acheter`);
      await chargerDonnees();
      setCarteSelectionnee(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'achat");
    }
    setAchatEnCours(false);
  };

  // Vérifier si on possède déjà une carte
  const possedeCarte = (carteId) => {
    return collection.some(c => c.carte?._id === carteId);
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loading}>Chargement du classeur... 📖</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>MON CLASSEUR</h1>
        <p className={styles.pageSousTitre}>Collection de cartes Fennec Arts</p>
      </div>

      <div className={styles.container}>
        {/* Stats de complétion */}
        {stats && (
          <div className={styles.completionBar}>
            <div className={styles.completionInfo}>
              <span>📖 {stats.cartesUniques} / {stats.totalCatalogue} cartes</span>
              <span className={styles.completionPercent}>{stats.completion}%</span>
            </div>
            <div className={styles.completionTrack}>
              <div className={styles.completionFill} style={{ width: `${stats.completion}%` }} />
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className={styles.onglets}>
          {[
            { id: "collection", label: `🃏 Ma Collection (${collection.length})` },
            { id: "boutique", label: `🏪 Boutique (${boutique.length})` },
            { id: "catalogue", label: `📋 Catalogue (${catalogue.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.onglet} ${onglet === tab.id ? styles.ongletActif : ""}`}
              onClick={() => setOnglet(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {onglet === "collection" && (
          <div className={styles.grid}>
            {collection.length === 0 ? (
              <div className={styles.empty}>
                <p>📭 Ton classeur est vide pour l'instant.</p>
                <p>Visite la boutique ou participe aux events pour obtenir des cartes !</p>
              </div>
            ) : (
              collection.map((item, i) => (
                <CartePreview
                  key={item._id || i}
                  carte={item.carte}
                  brillant={item.brillant}
                  onClick={setCarteSelectionnee}
                />
              ))
            )}
          </div>
        )}

        {onglet === "boutique" && (
          <div className={styles.grid}>
            {boutique.length === 0 ? (
              <div className={styles.empty}>Aucune carte en vente pour le moment.</div>
            ) : (
              boutique.map(carte => {
                const possede = possedeCarte(carte._id);
                return (
                  <div key={carte._id} className={styles.boutiqueItem}>
                    <CartePreview carte={carte} onClick={setCarteSelectionnee} />
                    <div className={styles.boutiqueFooter}>
                      <span className={styles.boutiquePrix}>{carte.prixBoutique} FM 💰</span>
                      <button
                        className={styles.boutiqueBtn}
                        onClick={() => acheterCarte(carte._id)}
                        disabled={possede || achatEnCours}
                      >
                        {possede ? "Possédée ✓" : "Acheter"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {onglet === "catalogue" && (
          <div className={styles.grid}>
            {catalogue.map(carte => {
              const possede = possedeCarte(carte._id);
              return (
                <div key={carte._id} className={`${styles.carteItem} ${!possede ? styles.carteNonPossedee : ""}`}>
                  <div className={styles.carteImage}>
                    <img src={carte.imageUrl} alt={carte.nom} loading="lazy" style={!possede ? { filter: "grayscale(100%) brightness(0.4)" } : {}} />
                    {possede && <div className={styles.possedeCheck}>✓</div>}
                  </div>
                  <div className={styles.carteInfo}>
                    <span className={styles.carteRarete} style={{ color: RARETE_CONFIG[carte.rarete]?.couleur }}>
                      {RARETE_CONFIG[carte.rarete]?.label}
                    </span>
                    <h4 className={styles.carteNom}>{carte.nom}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal détail carte */}
      {carteSelectionnee && (
        <CarteDetail
          carte={carteSelectionnee}
          brillant={false}
          onClose={() => setCarteSelectionnee(null)}
        />
      )}
    </div>
  );
}

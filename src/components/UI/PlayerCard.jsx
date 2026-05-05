/**
 * PlayerCard — Carte de joueur partageable style TCG (Trading Card Game).
 * 
 * Affiche l'avatar, le pseudo, le rang, les stats clés et les cosmétiques
 * du joueur dans un design premium de carte à collectionner.
 * Peut être exportée en image via Canvas API.
 */
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { calculerRang, COULEURS_RANG } from "../../utils/rangs";
import AvatarIcon from "./AvatarIcon";
import styles from "./PlayerCard.module.css";

const RARITY_CONFIG = {
  Fer:           { bg: "linear-gradient(145deg, #2a2a2a, #3d3d3d)", border: "#8c8c8c", glow: "rgba(140,140,140,0.3)" },
  Bronze:       { bg: "linear-gradient(145deg, #2a1f0f, #3d2d16)", border: "#cd7f32", glow: "rgba(205,127,50,0.3)" },
  Argent:       { bg: "linear-gradient(145deg, #1f2329, #2d333b)", border: "#c0c0c0", glow: "rgba(192,192,192,0.3)" },
  Or:            { bg: "linear-gradient(145deg, #2a2200, #3d3300)", border: "#ffd700", glow: "rgba(255,215,0,0.4)" },
  Platine:      { bg: "linear-gradient(145deg, #0f2a24, #163d33)", border: "#4fc3a1", glow: "rgba(79,195,161,0.3)" },
  "Émeraude":   { bg: "linear-gradient(145deg, #0f2a18, #163d22)", border: "#50c878", glow: "rgba(80,200,120,0.3)" },
  Diamant:      { bg: "linear-gradient(145deg, #0f1f2a, #162d3d)", border: "#a8d8f0", glow: "rgba(168,216,240,0.4)" },
  "Maître":     { bg: "linear-gradient(145deg, #1f0f2a, #2d163d)", border: "#9b59b6", glow: "rgba(155,89,182,0.4)" },
  "Grand Maître": { bg: "linear-gradient(145deg, #2a0f0f, #3d1616)", border: "#e74c3c", glow: "rgba(231,76,60,0.4)" },
  Challenger:   { bg: "linear-gradient(145deg, #2a1f0f, #3d2d16)", border: "#f4a261", glow: "rgba(244,162,97,0.5)" },
};

export default function PlayerCard({ profil, onClose }) {
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const rang = calculerRang(profil?.points || 0);
  const rarity = RARITY_CONFIG[rang.nom] || RARITY_CONFIG["Fer"];
  const streak = profil?.streakConnexion || 0;
  const tournois = profil?.participationsTournois?.length || 0;
  const badges = profil?.badges?.length || 0;

  // Export en image via Canvas API natif (pas de dépendance externe)
  const handleExport = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const w = 640;
      const h = 960;
      canvas.width = w;
      canvas.height = h;

      // Fond dégradé basé sur le rang
      const borderColor = rarity.border;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(0.5, "#16213e");
      grad.addColorStop(1, "#0f3460");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 24);
      ctx.fill();

      // Bordure
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Header rang
      ctx.font = "bold 28px sans-serif";
      ctx.fillStyle = rang.couleur;
      ctx.textAlign = "left";
      ctx.fillText(rang.affichage, 40, 60);
      ctx.textAlign = "right";
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${profil?.points || 0} XP`, w - 40, 60);

      // Avatar cercle
      ctx.beginPath();
      ctx.arc(w / 2, 200, 60, 0, Math.PI * 2);
      ctx.fillStyle = borderColor;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Initiale dans l'avatar
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText((profil?.nom || "?")[0].toUpperCase(), w / 2, 218);

      // Nom
      ctx.font = "bold 36px sans-serif";
      ctx.fillStyle = profil?.couleurPseudoActive || "#fff";
      ctx.fillText(profil?.nom || "Joueur", w / 2, 310);

      // Titre
      if (profil?.titreActif) {
        ctx.font = "italic 16px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(profil.titreActif, w / 2, 340);
      }

      // Stats
      const stats = [
        { label: "XP", value: String(profil?.points || 0) },
        { label: "FM", value: `💰 ${profil?.fm || 0}` },
        { label: "Tournois", value: `⚔️ ${tournois}` },
        { label: "Streak", value: `🔥 ${streak}` },
      ];
      const statY = 400;
      const statW = (w - 80) / 4;
      stats.forEach((s, i) => {
        const x = 40 + i * statW + statW / 2;
        // Fond stat
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.roundRect(40 + i * statW, statY, statW - 10, 70, 12);
        ctx.fill();
        // Valeur
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(s.value, x - 5, statY + 32);
        // Label
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText(s.label, x - 5, statY + 55);
      });

      // Footer
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.textAlign = "left";
      ctx.fillText("🦊 FENNEC ARTS", 40, h - 40);
      ctx.textAlign = "right";
      const dateStr = new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      ctx.fillText(dateStr, w - 40, h - 40);

      // Télécharger
      const link = document.createElement("a");
      link.download = `fennec-card-${profil?.nom || "player"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export impossible. Essayez une capture d'écran !");
    }
    setExporting(false);
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.cardContainer} onClick={(e) => e.stopPropagation()}>
        <div
          ref={cardRef}
          className={`${styles.card} ${flipped ? styles.flipped : ""}`}
          style={{
            "--card-bg": rarity.bg,
            "--card-border": rarity.border,
            "--card-glow": rarity.glow,
          }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* ── Face avant ── */}
          <div className={styles.front}>
            {/* Holographic overlay */}
            <div className={styles.holoOverlay} />
            
            {/* Header avec rang */}
            <div className={styles.cardHeader}>
              <span className={styles.cardRang} style={{ color: rang.couleur }}>
                {rang.affichage}
              </span>
              <span className={styles.cardXP}>{profil?.points || 0} XP</span>
            </div>

            {/* Avatar zone */}
            <div className={styles.avatarZone}>
              <div className={styles.avatarFrame}>
                <AvatarIcon
                  avatarUrl={profil?.avatarActif}
                  cadreStyle={profil?.cadreStyle}
                  taille="xl"
                  nom={profil?.nom || "?"}
                />
              </div>
            </div>

            {/* Nom & Titre */}
            <div className={styles.infoZone}>
              <h2
                className={styles.playerName}
                style={profil?.couleurPseudoActive ? { color: profil.couleurPseudoActive } : {}}
              >
                {profil?.nom || "Joueur"}
              </h2>
              {profil?.titreActif && (
                <div className={styles.playerTitle}>{profil.titreActif}</div>
              )}
            </div>

            {/* Stats grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{profil?.points || 0}</span>
                <span className={styles.statLabel}>XP</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>💰 {profil?.fm || 0}</span>
                <span className={styles.statLabel}>FM</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>⚔️ {tournois}</span>
                <span className={styles.statLabel}>Tournois</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>🔥 {streak}</span>
                <span className={styles.statLabel}>Streak</span>
              </div>
            </div>

            {/* Badges showcase */}
            {badges > 0 && (
              <div className={styles.badgesRow}>
                {(profil.badgesEquipes || profil.badges || []).slice(0, 5).map((b, i) => (
                  <span key={b._id || i} className={styles.badgeMini} title={b.nom}>
                    {b.icone || "🏆"}
                  </span>
                ))}
                {badges > 5 && <span className={styles.badgeMore}>+{badges - 5}</span>}
              </div>
            )}

            {/* Footer */}
            <div className={styles.cardFooter}>
              <span className={styles.footerLogo}>🦊 FENNEC ARTS</span>
              <span className={styles.footerDate}>
                {new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* ── Face arrière ── */}
          <div className={styles.back}>
            <div className={styles.backContent}>
              <div className={styles.backLogo}>🦊</div>
              <h3 className={styles.backTitle}>FENNEC ARTS</h3>
              <p className={styles.backSubtitle}>Esports & Gaming Community</p>
              <div className={styles.backPattern} />
              {profil?.bio && <p className={styles.backBio}>"{profil.bio}"</p>}
              {profil?.citation && <p className={styles.backCitation}>« {profil.citation} »</p>}
            </div>
          </div>
        </div>

        {/* Actions en-dessous de la carte */}
        <div className={styles.actions}>
          <button
            className={styles.btnExport}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Export..." : "📥 Télécharger"}
          </button>
          <button className={styles.btnFlip} onClick={() => setFlipped(!flipped)}>
            🔄 Retourner
          </button>
          <button className={styles.btnClose} onClick={onClose}>
            ✕ Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

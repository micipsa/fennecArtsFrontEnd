/**
 * BoutonPartage — boutons de partage social (Facebook, X/Twitter, copier le lien)
 *
 * Props :
 * - titre : titre de l'article/page à partager
 * - url : URL complète à partager (optionnel, utilise window.location.href par défaut)
 */
import { useState } from "react";
import { useToast } from "./Toast";
import api from "../../services/api";
import styles from "./BoutonPartage.module.css";

function BoutonPartage({ titre, url }) {
  const { addToast } = useToast();
  const [copie, setCopie] = useState(false);

  const shareUrl = url || window.location.href;

  const partagerFacebook = async () => {
    try { await api.post("/api/quetes/action", { action: "premier_partage_semaine" }); } catch (e) {}
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const partagerTwitter = async () => {
    try { await api.post("/api/quetes/action", { action: "premier_partage_semaine" }); } catch (e) {}
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(titre)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopie(true);
      addToast("Lien copié dans le presse-papier !", "success");
      setTimeout(() => setCopie(false), 2000);
    } catch {
      addToast("Impossible de copier le lien", "error");
    }
  };

  return (
    <div className={styles.partage}>
      <span className={styles.label}>Partager :</span>
      <div className={styles.boutons}>
        {/* Facebook */}
        <button
          className={`${styles.btn} ${styles.facebook}`}
          onClick={partagerFacebook}
          aria-label="Partager sur Facebook">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </button>

        {/* Twitter / X */}
        <button
          className={`${styles.btn} ${styles.twitter}`}
          onClick={partagerTwitter}
          aria-label="Partager sur X">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Copier le lien */}
        <button
          className={`${styles.btn} ${styles.copier} ${copie ? styles.copieFait : ""}`}
          onClick={copierLien}
          aria-label="Copier le lien">
          {copie ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default BoutonPartage;

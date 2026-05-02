import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/UI/Toast";
import styles from "./OngletReseaux.module.css";

const RESEAUX = [
  { key: "twitter", label: "Twitter / X", icon: "🐦" },
  { key: "twitch", label: "Twitch", icon: "🟣" },
  { key: "youtube", label: "YouTube", icon: "▶️" },
  { key: "instagram", label: "Instagram", icon: "📸" },
  { key: "tiktok", label: "TikTok", icon: "🎵" },
  { key: "facebook", label: "Facebook", icon: "📘" },
];

export default function OngletReseaux({ profil, onUpdate }) {
  const [reseaux, setReseaux] = useState(profil?.reseauxSociaux || {});
  const [sauvegarde, setSauvegarde] = useState(false);
  const { addToast } = useToast();

  const sauvegarder = async () => {
    setSauvegarde(true);
    try {
      await api.patch("/api/users/me/profil-etendu", { reseauxSociaux: reseaux });
      addToast("Réseaux sociaux sauvegardés", "success");
      onUpdate?.();
    } catch (err) {
      addToast("Erreur de sauvegarde", "error");
    } finally { setSauvegarde(false); }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.titre}>🌐 Mes réseaux sociaux</h3>
        <div className={styles.grid}>
          {RESEAUX.map(({ key, label, icon }) => (
            <div key={key} className={styles.champ}>
              <label><span className={styles.icon}>{icon}</span> {label}</label>
              <input type="text" placeholder={`Lien ou pseudo ${label}`} value={reseaux[key] || ""} onChange={e => setReseaux({ ...reseaux, [key]: e.target.value })} />
            </div>
          ))}
        </div>
      </section>
      <button className={styles.btnSauvegarder} onClick={sauvegarder} disabled={sauvegarde}>
        {sauvegarde ? "Sauvegarde..." : "💾 Sauvegarder"}
      </button>
    </div>
  );
}

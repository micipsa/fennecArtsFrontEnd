import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/UI/Toast";
import { THEMES_PROFIL, getThemesDebloquesPour } from "../../utils/themesProfil";
import styles from "./OngletPersonnalisation.module.css";

export default function OngletPersonnalisation({ profil, onUpdate }) {
  const badges = profil?.badges || [];
  const [badgesEquipes, setBadgesEquipes] = useState((profil?.badgesEquipes || []).map(b => b._id || b));
  const [statutPerso, setStatutPerso] = useState(profil?.statutPersonnalise || "");
  const [profilPublic, setProfilPublic] = useState(profil?.profilPublic !== false);
  const [banniereUrl, setBanniereUrl] = useState(profil?.banniereUrl || "");
  const [sauvegarde, setSauvegarde] = useState(false);
  const [themeChoisi, setThemeChoisi] = useState(profil?.themeProfilActif || "auto");
  const themesDebloques = profil?.themesDebloques || getThemesDebloquesPour(profil?.points || 0);
  const { addToast } = useToast();

  const toggleBadge = (id) => {
    if (badgesEquipes.includes(id)) {
      setBadgesEquipes(badgesEquipes.filter(b => b !== id));
    } else if (badgesEquipes.length < 3) {
      setBadgesEquipes([...badgesEquipes, id]);
    } else {
      addToast("Maximum 3 badges équipés", "warning");
    }
  };

  const changerTheme = async (code) => {
    setThemeChoisi(code);
    try {
      await api.patch("/api/users/me/theme-profil", { theme: code });
      addToast("Thème mis à jour", "success");
      onUpdate?.();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur", "error");
    }
  };

  const sauvegarder = async () => {
    setSauvegarde(true);
    try {
      await Promise.all([
        api.patch("/api/users/me/badges-equipes", { badgeIds: badgesEquipes }),
        api.patch("/api/users/me/profil-etendu", { statutPersonnalise: statutPerso, profilPublic, banniereUrl }),
      ]);
      addToast("Personnalisation sauvegardée", "success");
      onUpdate?.();
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur", "error");
    } finally { setSauvegarde(false); }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.titre}>🎨 Thème de profil</h3>
        <p className={styles.description}>Choisis ton ambiance ou laisse en auto pour suivre ton rang</p>

        <div className={styles.themesGrille}>
          <button
            className={`${styles.themeCard} ${themeChoisi === "auto" ? styles.themeActif : ""}`}
            onClick={() => changerTheme("auto")}
          >
            <span className={styles.themeIcone}>⚡</span>
            <span className={styles.themeNom}>Auto</span>
            <span className={styles.themeDesc}>Selon mon rang</span>
          </button>

          {Object.entries(THEMES_PROFIL).map(([code, theme]) => {
            const debloque = themesDebloques.includes(code);
            return (
              <button
                key={code}
                className={`${styles.themeCard} ${themeChoisi === code ? styles.themeActif : ""} ${!debloque ? styles.themeBloque : ""}`}
                onClick={() => debloque && changerTheme(code)}
                disabled={!debloque}
                style={{
                  "--theme-c1": theme.couleurPrimaire,
                  "--theme-c2": theme.couleurSecondaire,
                }}
              >
                <span className={styles.themeIcone}>{debloque ? theme.icone : "🔒"}</span>
                <span className={styles.themeNom}>{theme.nom}</span>
                <span className={styles.themeDesc}>{theme.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🏅 Badges équipés (max 3)</h3>
        {badges.length === 0 ? (
          <p className={styles.vide}>Aucun badge débloqué pour le moment.</p>
        ) : (
          <div className={styles.badgesGrid}>
            {badges.map(b => (
              <button
                key={b._id}
                className={`${styles.badgeBtn} ${badgesEquipes.includes(b._id) ? styles.badgeActif : ""}`}
                onClick={() => toggleBadge(b._id)}
              >
                <span className={styles.badgeIcon}>{b.icone || "🏆"}</span>
                <span className={styles.badgeNom}>{b.nom}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🖼️ Bannière de profil</h3>
        <input type="text" className={styles.input} placeholder="URL de la bannière" value={banniereUrl} onChange={e => setBanniereUrl(e.target.value)} />
        {banniereUrl && <img src={banniereUrl} alt="Aperçu" className={styles.bannierePreview} />}
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>💬 Statut personnalisé</h3>
        <input type="text" className={styles.input} placeholder="Ex: En mode grind..." value={statutPerso} onChange={e => setStatutPerso(e.target.value)} maxLength={80} />
        <p className={styles.hint}>{statutPerso.length}/80</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🔒 Visibilité du profil</h3>
        <label className={styles.toggle}>
          <input type="checkbox" checked={profilPublic} onChange={e => setProfilPublic(e.target.checked)} />
          <span>Profil visible publiquement</span>
        </label>
      </section>

      <button className={styles.btnSauvegarder} onClick={sauvegarder} disabled={sauvegarde}>
        {sauvegarde ? "Sauvegarde..." : "💾 Sauvegarder"}
      </button>
    </div>
  );
}

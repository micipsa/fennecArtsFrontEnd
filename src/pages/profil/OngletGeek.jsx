import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/UI/Toast";
import styles from "./OngletGeek.module.css";

export default function OngletGeek({ profil, onUpdate }) {
  const [animes, setAnimes] = useState(
    (profil?.animesFavoris || []).join(", "),
  );
  const [mangas, setMangas] = useState(
    (profil?.mangasFavoris || []).join(", "),
  );
  const [films, setFilms] = useState(
    (profil?.filmsSeriesFavoris || []).join(", "),
  );
  const [bio, setBio] = useState(profil?.bio || "");
  const [citation, setCitation] = useState(profil?.citation || "");
  const [sauvegarde, setSauvegarde] = useState(false);
  const { addToast } = useToast();

  const parseList = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

  const sauvegarder = async () => {
    setSauvegarde(true);
    try {
      await api.patch("/api/users/me/profil-etendu", {
        animesFavoris: parseList(animes),
        mangasFavoris: parseList(mangas),
        filmsSeriesFavoris: parseList(films),
        bio,
        citation,
      });
      addToast("Identité geek sauvegardée", "success");
      onUpdate?.();
    } catch (err) {
      addToast("Erreur de sauvegarde", "error");
    } finally {
      setSauvegarde(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <h3 className={styles.titre}>🎌 Animes favoris</h3>
        <input
          type="text"
          className={styles.input}
          placeholder="One Piece, Naruto, Attack on Titan..."
          value={animes}
          onChange={(e) => setAnimes(e.target.value)}
        />
        <p className={styles.hint}>Séparez par des virgules (max 10)</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>📚 Mangas favoris</h3>
        <input
          type="text"
          className={styles.input}
          placeholder="Berserk, Vagabond, Chainsaw Man..."
          value={mangas}
          onChange={(e) => setMangas(e.target.value)}
        />
        <p className={styles.hint}>Séparez par des virgules (max 10)</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>🎬 Films / Séries geek</h3>
        <input
          type="text"
          className={styles.input}
          placeholder="Breaking Bad, Interstellar..."
          value={films}
          onChange={(e) => setFilms(e.target.value)}
        />
        <p className={styles.hint}>Séparez par des virgules (max 10)</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>📝 Bio personnelle</h3>
        <textarea
          className={styles.textarea}
          placeholder="Parle de toi en quelques mots..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
        />
        <p className={styles.hint}>{bio.length}/500</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.titre}>💬 Citation favorite</h3>
        <input
          type="text"
          className={styles.input}
          placeholder="Believe it! — Naruto"
          value={citation}
          onChange={(e) => setCitation(e.target.value)}
          maxLength={200}
        />
        <p className={styles.hint}>{citation.length}/200</p>
      </section>

      <button
        className={styles.btnSauvegarder}
        onClick={sauvegarder}
        disabled={sauvegarde}>
        {sauvegarde ? "Sauvegarde..." : "💾 Sauvegarder"}
      </button>
    </div>
  );
}

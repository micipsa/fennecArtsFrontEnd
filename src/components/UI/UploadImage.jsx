import { useState } from "react";
import axios from "axios";
import styles from "./UploadImage.module.css";

const UploadImage = ({ onUpload }) => {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  const handleFichier = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const formData = new FormData();
    formData.append("image", fichier);

    setChargement(true);
    setErreur(null);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data.url);
    } catch (err) {
      setErreur("Échec de l'upload. Réessaie.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.conteneur}>
      <label className={styles.label}>
        {chargement ? "Envoi en cours..." : "Choisir une image"}
        <input
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/webp"
          onChange={handleFichier}
          className={styles.input}
        />
      </label>
      {erreur && <p className={styles.erreur}>{erreur}</p>}
    </div>
  );
};

export default UploadImage;

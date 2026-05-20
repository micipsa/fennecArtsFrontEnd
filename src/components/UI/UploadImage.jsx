import { useState } from "react";
import api from "../../services/api";
import styles from "./UploadImage.module.css";

const UploadImage = ({ onUpload }) => {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFichier = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    // Validation du type de fichier
    const formatsAcceptes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!formatsAcceptes.includes(fichier.type)) {
      setErreur("Format d'image non supporté. formats acceptés : JPEG, PNG, WEBP.");
      return;
    }

    // Validation de la taille de fichier (2 Mo max)
    const tailleMax = 2 * 1024 * 1024;
    if (fichier.size > tailleMax) {
      setErreur("L'image est trop volumineuse. Taille maximale autorisée : 2 Mo.");
      return;
    }

    // Création de la prévisualisation locale
    const urlLocale = URL.createObjectURL(fichier);
    setPreviewUrl(urlLocale);

    const formData = new FormData();
    formData.append("image", fichier);

    setChargement(true);
    setErreur(null);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data.url);
    } catch (err) {
      setErreur("Échec de l'upload. Réessaie.");
      setPreviewUrl(null); // Reset en cas d'erreur
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.conteneur}>
      {previewUrl && (
        <div className={styles.previewContainer}>
          <img src={previewUrl} alt="Aperçu" className={styles.preview} style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '6px', marginBottom: '10px' }} />
        </div>
      )}
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

import { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import styles from "./ProfilPage.module.css";

function ProfilPage() {
  const { utilisateur } = useAuth();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerProfil = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setProfil(res.data.user);
      } catch (err) {
        setProfil(utilisateur);
      } finally {
        setChargement(false);
      }
    };

    chargerProfil();
  }, [utilisateur]);

  const varianteRole = {
    admin: "primaire",
    redacteur: "info",
    adherent: "succes",
    utilisateur: "defaut",
  };

  if (chargement) return <Spinner />;

  const dateInscription = profil?.createdAt
    ? new Date(profil.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Non disponible";

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Mon profil</h1>
          <p className={styles.sousTitre}>Informations de votre compte</p>
        </div>

        <div className={styles.carte}>
          <div className={styles.avatar}>
            {(profil?.nom || utilisateur?.nom || "?")[0].toUpperCase()}
          </div>

          <div className={styles.infos}>
            <div className={styles.infoLigne}>
              <span className={styles.infoLabel}>Nom</span>
              <span className={styles.infoValeur}>
                {profil?.nom ?? utilisateur?.nom}
              </span>
            </div>
            <div className={styles.infoLigne}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValeur}>
                {profil?.email ?? utilisateur?.email}
              </span>
            </div>
            <div className={styles.infoLigne}>
              <span className={styles.infoLabel}>Rôle</span>
              <Badge
                texte={profil?.role ?? utilisateur?.role}
                variante={
                  varianteRole[profil?.role ?? utilisateur?.role] ?? "defaut"
                }
              />
            </div>
            <div className={styles.infoLigne}>
              <span className={styles.infoLabel}>Membre depuis</span>
              <span className={styles.infoValeur}>{dateInscription}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilPage;

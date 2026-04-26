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
  const [formMdp, setFormMdp] = useState({
    ancien: "",
    nouveau: "",
    confirmation: "",
  });
  const [erreurMdp, setErreurMdp] = useState(null);
  const [successMdp, setSuccessMdp] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

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

  const handleChangeMdp = (e) => {
    setFormMdp({ ...formMdp, [e.target.name]: e.target.value });
  };

  const handleSoumettreNewMdp = async (e) => {
    e.preventDefault();
    setErreurMdp(null);
    setSuccessMdp(null);

    if (formMdp.nouveau !== formMdp.confirmation) {
      setErreurMdp("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (formMdp.nouveau.length < 6) {
      setErreurMdp("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      await api.put("/api/auth/password", {
        ancienMotDePasse: formMdp.ancien,
        nouveauMotDePasse: formMdp.nouveau,
      });
      setSuccessMdp("Mot de passe modifié avec succès !");
      setFormMdp({ ancien: "", nouveau: "", confirmation: "" });
    } catch (err) {
      setErreurMdp(err.response?.data?.message || "Erreur lors du changement.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) return <Spinner />;

  const nom = profil?.nom ?? utilisateur?.nom ?? "?";
  const email = profil?.email ?? utilisateur?.email;
  const role = profil?.role ?? utilisateur?.role;

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
          <div className={styles.carteBandeau} />
          <div className={styles.carteCorps}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{nom[0].toUpperCase()}</div>
            </div>

            <p className={styles.nomPrincipal}>{nom}</p>
            <Badge texte={role} variante={varianteRole[role] ?? "defaut"} />

            <div className={styles.infos}>
              <div className={styles.infoLigne}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValeur}>{email}</span>
              </div>
              <div className={styles.infoLigne}>
                <span className={styles.infoLabel}>Rôle</span>
                <Badge texte={role} variante={varianteRole[role] ?? "defaut"} />
              </div>
              <div className={styles.infoLigne}>
                <span className={styles.infoLabel}>Membre depuis</span>
                <span className={styles.infoValeur}>{dateInscription}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionMdp}>
          <h2 className={styles.sectionMdpTitre}>Changer le mot de passe</h2>

          {erreurMdp && <div className={styles.erreur}>{erreurMdp}</div>}
          {successMdp && <div className={styles.succes}>{successMdp}</div>}

          <form
            className={styles.formulaireMdp}
            onSubmit={handleSoumettreNewMdp}>
            <div className={styles.champ}>
              <label className={styles.label}>Ancien mot de passe</label>
              <input
                className={styles.input}
                type="password"
                name="ancien"
                value={formMdp.ancien}
                onChange={handleChangeMdp}
                placeholder="••••••••"
                required
              />
            </div>
            <div className={styles.champ}>
              <label className={styles.label}>Nouveau mot de passe</label>
              <input
                className={styles.input}
                type="password"
                name="nouveau"
                value={formMdp.nouveau}
                onChange={handleChangeMdp}
                placeholder="••••••••"
                required
              />
            </div>
            <div className={styles.champ}>
              <label className={styles.label}>
                Confirmer le nouveau mot de passe
              </label>
              <input
                className={styles.input}
                type="password"
                name="confirmation"
                value={formMdp.confirmation}
                onChange={handleChangeMdp}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className={styles.btnMdp}
              disabled={envoiEnCours}>
              {envoiEnCours ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilPage;

import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/UI/Toast";
import styles from "./AuthPage.module.css";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);

    if (password !== confirmPassword) {
      return setErreur("Les mots de passe ne correspondent pas.");
    }
    
    if (password.length < 6) {
      return setErreur("Le mot de passe doit contenir au moins 6 caractères.");
    }

    setChargement(true);

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      addToast("Mot de passe réinitialisé avec succès !", "success");
      navigate("/login");
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la réinitialisation. Le lien est peut-être expiré.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Nouveau mot de passe</h1>
          <p className={styles.sousTitre}>Choisis un nouveau mot de passe sécurisé pour ton compte.</p>
        </div>

        {erreur && <div className={styles.erreur}>{erreur}</div>}

        <form className={styles.formulaire} onSubmit={handleSubmit}>
          <div className={styles.champ}>
            <label className={styles.label} htmlFor="password">Nouveau mot de passe</label>
            <div className={styles.champMdpWrapper}>
              <input
                className={styles.input}
                type={voirMdp ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className={styles.btnVoirMdp} onClick={() => setVoirMdp(!voirMdp)} tabIndex={-1}>
                {voirMdp ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className={styles.champ}>
            <label className={styles.label} htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className={styles.champMdpWrapper}>
              <input
                className={styles.input}
                type={voirMdp ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.boutonSoumettre} disabled={chargement}>
            {chargement ? "Réinitialisation..." : "Enregistrer le mot de passe"}
          </button>
        </form>
      </div>
    </main>
  );
}

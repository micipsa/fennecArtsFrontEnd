import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import styles from "./AuthPage.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    setMessage(null);

    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      // En mode dev, le backend nous renvoie le token brut pour tester
      const token = res.data.data?.resetToken;
      if (token) {
        setMessage(`Simulation d'email : cliquez ici pour réinitialiser -> /reset-password/${token}`);
      } else {
        setMessage(res.data.message || "Email envoyé avec succès.");
      }
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la demande.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <img src="/fennec-logo.png" alt="Fennec Arts" className={styles.logo} />
          <h1 className={styles.titre}>Mot de passe oublié ?</h1>
          <p className={styles.sousTitre}>
            Entre ton adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {erreur && <div className={styles.erreur}>{erreur}</div>}
        {message && (
          <div className={styles.erreur} style={{ background: "rgba(46, 204, 113, 0.1)", color: "#2ecc71", borderColor: "#2ecc71" }}>
            {message.includes("Simulation") ? (
              <a href={message.split("-> ")[1]} style={{ color: "#2ecc71", textDecoration: "underline" }}>Lien de réinitialisation de test</a>
            ) : (
              message
            )}
          </div>
        )}

        <form className={styles.formulaire} onSubmit={handleSubmit}>
          <div className={styles.champ}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              className={styles.input}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
            />
          </div>

          <button type="submit" className={styles.boutonSoumettre} disabled={chargement}>
            {chargement ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        <div className={styles.lienAlternatif}>
          Tu t'en souviens finalement ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </main>
  );
}

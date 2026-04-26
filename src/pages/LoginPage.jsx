import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import styles from "./AuthPage.module.css";

function LoginPage() {
  const navigate = useNavigate();
  const { connecter } = useAuth();

  const [formData, setFormData] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.motDePasse,
      });
      connecter(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.message || "Identifiants incorrects.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logo}
          />
          <h1 className={styles.titre}>Connexion</h1>
          <p className={styles.sousTitre}>Accédez à votre espace Fennec Arts</p>
        </div>

        {erreur && <div className={styles.erreur}>{erreur}</div>}

        <form className={styles.formulaire} onSubmit={handleSubmit}>
          <div className={styles.champ}>
            <label className={styles.label} htmlFor="email">
              Adresse email
            </label>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className={styles.champ}>
            <label className={styles.label} htmlFor="motDePasse">
              Mot de passe
            </label>
            <input
              className={styles.input}
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.boutonSoumettre}
            disabled={chargement}>
            {chargement ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>

        <p className={styles.lienAlternatif}>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

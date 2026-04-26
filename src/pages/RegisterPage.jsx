import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import styles from "./AuthPage.module.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { connecter } = useAuth();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
  });
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
      const res = await api.post("/api/auth/register", {
        nom: formData.nom,
        email: formData.email,
        password: formData.motDePasse,
      });
      connecter(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <h1 className={styles.titre}>Créer un compte</h1>
          <p className={styles.sousTitre}>
            Rejoignez la communauté Fennec Arts
          </p>
        </div>

        {erreur && <div className={styles.erreur}>{erreur}</div>}

        <form className={styles.formulaire} onSubmit={handleSubmit}>
          <div className={styles.champ}>
            <label className={styles.label} htmlFor="nom">
              Nom complet
            </label>
            <input
              className={styles.input}
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.boutonSoumettre}
            disabled={chargement}>
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className={styles.lienAlternatif}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

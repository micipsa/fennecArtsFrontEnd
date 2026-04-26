/**
 * RegisterPage — page d'inscription (création de compte).
 *
 * Formulaire avec trois champs : nom, email, mot de passe.
 * Au submit :
 * 1. Envoie une requête POST à /api/auth/register.
 * 2. Si succès : connecte automatiquement l'utilisateur (token + state)
 *    et redirige vers l'accueil.
 * 3. Si erreur : affiche le message d'erreur de l'API.
 *
 * Le mot de passe a une longueur minimale de 6 caractères (attribut minLength).
 * Le fonctionnement est identique à LoginPage, avec un champ supplémentaire (nom).
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import styles from "./AuthPage.module.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { connecter } = useAuth();

  // State du formulaire (controlled inputs)
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
  });
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  /**
   * Met à jour dynamiquement le champ modifié dans formData.
   * Fonctionne grâce au `name` de chaque input (computed property name).
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Gestionnaire de soumission du formulaire d'inscription.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    try {
      // Envoi des données d'inscription au backend
      const res = await api.post("/api/auth/register", {
        nom: formData.nom,
        email: formData.email,
        password: formData.motDePasse,
      });

      // Connexion automatique après inscription réussie
      connecter(res.data.token, res.data.user);

      // Redirection vers l'accueil
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
        {/* ── En-tête : logo + titre ── */}
        <div className={styles.entete}>
          <img
            src="/FennecArts_eSports_Logo.png"
            alt="Fennec Arts"
            className={styles.logo}
          />
          <h1 className={styles.titre}>Créer un compte</h1>
          <p className={styles.sousTitre}>
            Rejoignez la communauté Fennec Arts
          </p>
        </div>

        {/* Affichage conditionnel de l'erreur */}
        {erreur && <div className={styles.erreur}>{erreur}</div>}

        {/* ── Formulaire d'inscription ── */}
        <form className={styles.formulaire} onSubmit={handleSubmit}>
          {/* Champ nom */}
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

          {/* Champ email */}
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

          {/* Champ mot de passe (minimum 6 caractères) */}
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

          {/* Bouton de soumission */}
          <button
            type="submit"
            className={styles.boutonSoumettre}
            disabled={chargement}>
            {chargement ? "Création..." : "CRÉER MON COMPTE"}
          </button>
        </form>

        {/* Lien alternatif vers la page de connexion */}
        <p className={styles.lienAlternatif}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

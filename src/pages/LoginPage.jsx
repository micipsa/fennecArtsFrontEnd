/**
 * LoginPage — page de connexion utilisateur.
 *
 * Formulaire avec deux champs : email et mot de passe.
 * Au submit :
 * 1. Envoie une requête POST à /api/auth/login avec les identifiants.
 * 2. Si succès : appelle connecter() du AuthContext (sauvegarde token + state),
 *    puis redirige vers l'accueil.
 * 3. Si erreur : affiche le message d'erreur renvoyé par l'API.
 *
 * Le formulaire gère :
 * - Un state `formData` contrôlé (controlled inputs)
 * - Un state `erreur` pour afficher les erreurs
 * - Un state `chargement` pour désactiver le bouton pendant l'envoi
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import styles from "./AuthPage.module.css";

function LoginPage() {
  const navigate = useNavigate();
  // Récupération de la fonction de connexion depuis le Context
  const { connecter } = useAuth();

  // State du formulaire (controlled inputs)
  const [formData, setFormData] = useState({ email: "", motDePasse: "" });
  // State pour le message d'erreur
  const [erreur, setErreur] = useState(null);
  // State pour désactiver le bouton pendant l'envoi
  const [chargement, setChargement] = useState(false);

  /**
   * Gestionnaire de changement des champs du formulaire.
   * Met à jour dynamiquement la propriété correspondante dans formData
   * grâce au `name` de l'input (computed property name).
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Gestionnaire de soumission du formulaire.
   * Envoie les identifiants au backend et gère la réponse.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setErreur(null); // Reset du message d'erreur
    setChargement(true); // Active l'indicateur de chargement

    try {
      // Envoi des identifiants au backend
      const res = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.motDePasse,
      });

      // Succès : sauvegarde du token + données utilisateur via le Context
      connecter(res.data.token, res.data.user);

      // Redirection vers la page d'accueil
      navigate("/");
    } catch (err) {
      // Erreur : affichage du message d'erreur de l'API (ou message par défaut)
      setErreur(err.response?.data?.message || "Identifiants incorrects.");
    } finally {
      setChargement(false); // Réactive le bouton
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.carte}>
        {/* ── En-tête : logo + titre ── */}
        <div className={styles.entete}>
          <div className={styles.wrapperLogos}>
            <img
              src="/fennekagelogo.png"
              alt="Fennec's Clan"
              className={`${styles.logoCollab} ${styles.logoFennecClan}`}
            />
            <span className={styles.xCollab}>X</span>
            <img
              src="/FennecArts_eSports_Logo.png"
              alt="Fennec Arts"
              className={styles.logoCollab}
            />
          </div>
          <h1 className={styles.titre}>Connexion</h1>
          <p className={styles.sousTitre}>
            Plateforme officielle Fennec's Clan x Fennec Arts
          </p>
        </div>

        {/* Affichage conditionnel de l'erreur */}
        {erreur && <div className={styles.erreur}>{erreur}</div>}

        {/* ── Formulaire de connexion ── */}
        <form className={styles.formulaire} onSubmit={handleSubmit}>
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

          {/* Champ mot de passe */}
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

          {/* Bouton de soumission — désactivé pendant le chargement */}
          <button
            type="submit"
            className={styles.boutonSoumettre}
            disabled={chargement}>
            {chargement ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>

        {/* Lien alternatif vers la page d'inscription */}
        <p className={styles.lienAlternatif}>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

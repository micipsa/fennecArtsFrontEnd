/**
 * DashboardUtilisateurs — page de gestion des utilisateurs (admin).
 *
 * Permet à l'administrateur de :
 * - Voir la liste de tous les utilisateurs (nom, email, rôle actuel)
 * - Changer le rôle d'un utilisateur via un select (PATCH /api/users/:id/role)
 * - Supprimer un utilisateur (DELETE /api/users/:id)
 *
 * Les rôles disponibles sont :
 * - utilisateur : rôle par défaut à l'inscription
 * - adherent    : membre actif de l'association
 * - redacteur   : peut créer des articles
 * - admin       : accès complet au dashboard
 *
 * Chaque rôle a une couleur de Badge associée (mapping varianteRole).
 *
 * ⚠️  Pas de modale de création ici, car les utilisateurs s'inscrivent
 *     eux-mêmes via la page /register.
 */
import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardUtilisateurs.module.css";

// Liste des rôles possibles (affiché dans le select de changement de rôle)
const ROLES = ["utilisateur", "adherent", "redacteur", "organisateur", "admin"];

// Mapping rôle → variante de couleur du Badge
const varianteRole = {
  admin: "primaire",
  redacteur: "info",
  adherent: "succes",
  organisateur: "accent",
  utilisateur: "defaut",
};

function DashboardUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  // Stocke l'id de l'utilisateur dont le rôle est en cours de modification
  const [enCoursDeModif, setEnCoursDeModif] = useState(null);

  // ── Chargement de tous les utilisateurs au montage ──
  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/users");
        setUtilisateurs(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les utilisateurs.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  /**
   * Gestionnaire de changement de rôle.
   * Envoie un PATCH à l'API et met à jour le rôle côté client.
   * @param {string} id - L'id MongoDB de l'utilisateur
   * @param {string} nouveauRole - Le nouveau rôle sélectionné
   */
  const handleChangerRole = async (id, nouveauRole) => {
    setEnCoursDeModif(id); // Désactive le select pendant la requête
    try {
      await api.patch(`/api/users/${id}/role`, { role: nouveauRole });
      // Mise à jour optimiste du rôle dans la liste côté client
      setUtilisateurs((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: nouveauRole } : u)),
      );
    } catch (err) {
      alert("Erreur lors de la modification du rôle.");
    } finally {
      setEnCoursDeModif(null);
    }
  };

  /**
   * Gestionnaire de suppression d'un utilisateur.
   * Demande confirmation puis effectue un DELETE.
   */
  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet utilisateur ?"))
      return;
    try {
      await api.delete(`/api/users/${id}`);
      setUtilisateurs((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des utilisateurs</h1>
          <p className={styles.sousTitre}>
            {utilisateurs.length} utilisateur(s) au total
          </p>
        </div>
      </div>

      {/* ── Tableau des utilisateurs ── */}
      <div className={styles.tableau}>
        <div className={styles.tableauEntete}>
          <span>Nom</span>
          <span>Email</span>
          <span>Rôle actuel</span>
          <span>Changer le rôle</span>
          <span>Actions</span>
        </div>

        {utilisateurs.length === 0 && (
          <p className={styles.vide}>Aucun utilisateur trouvé.</p>
        )}

        {utilisateurs.map((u) => (
          <div key={u._id} className={styles.tableauLigne}>
            <span className={styles.nom}>{u.nom}</span>
            <span className={styles.email}>{u.email}</span>
            <span>
              <Badge
                texte={u.role}
                variante={varianteRole[u.role] ?? "defaut"}
              />
            </span>
            <span>
              {/* Select pour changer le rôle — désactivé pendant la requête */}
              <select
                className={styles.selectRole}
                value={u.role}
                onChange={(e) => handleChangerRole(u._id, e.target.value)}
                disabled={enCoursDeModif === u._id}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </span>
            <span>
              <button
                className={styles.btnSupprimer}
                onClick={() => handleSupprimer(u._id)}>
                Supprimer
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardUtilisateurs;

import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardUtilisateurs.module.css";

const ROLES = ["utilisateur", "adherent", "redacteur", "admin"];

const varianteRole = {
  admin: "primaire",
  redacteur: "info",
  adherent: "succes",
  utilisateur: "defaut",
};

function DashboardUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCoursDeModif, setEnCoursDeModif] = useState(null);

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

  const handleChangerRole = async (id, nouveauRole) => {
    setEnCoursDeModif(id);
    try {
      await api.patch(`/api/users/${id}/role`, { role: nouveauRole });
      setUtilisateurs((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: nouveauRole } : u)),
      );
    } catch (err) {
      alert("Erreur lors de la modification du rôle.");
    } finally {
      setEnCoursDeModif(null);
    }
  };

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
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des utilisateurs</h1>
          <p className={styles.sousTitre}>
            {utilisateurs.length} utilisateur(s) au total
          </p>
        </div>
      </div>

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

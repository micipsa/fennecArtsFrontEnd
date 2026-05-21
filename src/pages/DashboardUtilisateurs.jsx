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
import { Link } from "react-router-dom";
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
  const [enCoursDeModif, setEnCoursDeModif] = useState(null);
  const [tagsDisponibles, setTagsDisponibles] = useState([]);
  const [modaleGestion, setModaleGestion] = useState(null);
  const [tagsSelectionnes, setTagsSelectionnes] = useState([]);
  const [bonusForm, setBonusForm] = useState({
    points: "",
    fm: "",
    raison: "",
  });
  const [envoiTags, setEnvoiTags] = useState(false);
  const [envoiBonus, setEnvoiBonus] = useState(false);

  // Nouveaux états pour la recherche et la pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUtilisateurs, setTotalUtilisateurs] = useState(0);
  const [recherche, setRecherche] = useState("");
  const [rechercheDebounced, setRechercheDebounced] = useState("");

  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setRechercheDebounced(recherche);
      setPage(1); // Retour à la première page lors d'une nouvelle recherche
    }, 400);
    return () => clearTimeout(timer);
  }, [recherche]);

  // Charger les utilisateurs paginés et filtrés
  useEffect(() => {
    const chargerUsers = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/users", {
          params: { page, limit: 20, search: rechercheDebounced },
        });
        setUtilisateurs(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotalUtilisateurs(res.data.total || 0);
      } catch (err) {
        setErreur("Impossible de charger les utilisateurs.");
      } finally {
        setChargement(false);
      }
    };
    chargerUsers();
  }, [page, rechercheDebounced]);

  // Charger les tags disponibles une seule fois
  useEffect(() => {
    const chargerTags = async () => {
      try {
        const resTags = await api.get("/api/tags");
        setTagsDisponibles(resTags.data.data || []);
      } catch (err) {
        console.error("Impossible de charger les tags", err);
      }
    };
    chargerTags();
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

  const ouvrirGestion = (u) => {
    setModaleGestion(u);
    setTagsSelectionnes((u.tags || []).map((t) => t._id || t));
    setBonusForm({ points: "", fm: "", raison: "" });
  };

  const toggleTag = (tagId) => {
    setTagsSelectionnes((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSauvegarderTags = async () => {
    setEnvoiTags(true);
    try {
      const res = await api.patch(`/api/users/${modaleGestion._id}/tags`, {
        tags: tagsSelectionnes,
      });
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u._id === modaleGestion._id ? { ...u, tags: res.data.data.tags } : u,
        ),
      );
      setModaleGestion((prev) => ({ ...prev, tags: res.data.data.tags }));
    } catch {
      alert("Erreur lors de la sauvegarde des tags.");
    } finally {
      setEnvoiTags(false);
    }
  };

  const handleAjouterBonus = async (e) => {
    e.preventDefault();
    if ((!bonusForm.points && !bonusForm.fm) || !bonusForm.raison) return;
    setEnvoiBonus(true);
    try {
      await api.patch(`/api/users/${modaleGestion._id}/points-bonus`, {
        points: Number(bonusForm.points) || 0,
        fm: Number(bonusForm.fm) || 0,
        raison: bonusForm.raison,
      });
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u._id === modaleGestion._id
            ? {
                ...u,
                points: (u.points || 0) + (Number(bonusForm.points) || 0),
                fm: (u.fm || 0) + (Number(bonusForm.fm) || 0),
              }
            : u,
        ),
      );
      setBonusForm({ points: "", fm: "", raison: "" });
    } catch {
      alert("Erreur lors de l'ajout des points.");
    } finally {
      setEnvoiBonus(false);
    }
  };

  if (chargement && utilisateurs.length === 0) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des utilisateurs</h1>
          <p className={styles.sousTitre}>
            {totalUtilisateurs} utilisateur(s) au total
          </p>
        </div>
      </div>

      {/* ── Recherche ── */}
      <div className={styles.rechercheConteneur}>
        <input
          type="text"
          className={styles.rechercheInput}
          placeholder="Rechercher par pseudo ou email..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        {recherche && (
          <button className={styles.rechercheEffacer} onClick={() => setRecherche("")}>
            ✕ Effacer
          </button>
        )}
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
            <span className={styles.nom}>
              <Link
                to={`/membres/${u._id}`}
                className={styles.lienProfil}
                title="Voir le profil public">
                {u.nom}
              </Link>
            </span>
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
            <span
              style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <button
                className={styles.btnGerer}
                onClick={() => ouvrirGestion(u)}>
                Gérer
              </button>
              <button
                className={styles.btnSupprimer}
                onClick={() => handleSupprimer(u._id)}>
                Supprimer
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.btnPage}
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Précédent
          </button>
          <span className={styles.infoPage}>
            Page {page} sur {totalPages}
          </span>
          <button
            className={styles.btnPage}
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            Suivant
          </button>
        </div>
      )}

      {/* ── Modale gestion adhérent ── */}
      {modaleGestion && (
        <div className={styles.overlay} onClick={() => setModaleGestion(null)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>
                Gérer — {modaleGestion.nom}
              </h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleGestion(null)}>
                ✕
              </button>
            </div>

            {/* Tags */}
            <div className={styles.modaleSection}>
              <h3 className={styles.modaleSousTitre}>Tags</h3>
              <div className={styles.tagsGrille}>
                {tagsDisponibles.map((tag) => (
                  <label key={tag._id} className={styles.tagLabel}>
                    <input
                      type="checkbox"
                      checked={tagsSelectionnes.includes(tag._id)}
                      onChange={() => toggleTag(tag._id)}
                    />
                    <span
                      className={styles.tagChip}
                      style={{
                        background: tag.couleur + "22",
                        color: tag.couleur,
                        borderColor: tag.couleur + "66",
                      }}>
                      {tag.nom}
                    </span>
                  </label>
                ))}
                {tagsDisponibles.length === 0 && (
                  <p className={styles.videModale}>Aucun tag disponible.</p>
                )}
              </div>
              <button
                className={styles.btnSauvegarder}
                onClick={handleSauvegarderTags}
                disabled={envoiTags}>
                {envoiTags ? "Sauvegarde..." : "Sauvegarder les tags"}
              </button>
            </div>

            {/* Bonus points */}
            <div className={styles.modaleSection}>
              <h3 className={styles.modaleSousTitre}>Bonus points et FM</h3>
              <form className={styles.bonusForm} onSubmit={handleAjouterBonus}>
                <input
                  className={styles.bonusInput}
                  type="number"
                  min="0"
                  placeholder="Points XP"
                  value={bonusForm.points}
                  onChange={(e) =>
                    setBonusForm((p) => ({ ...p, points: e.target.value }))
                  }
                />
                <input
                  className={styles.bonusInput}
                  type="number"
                  min="0"
                  placeholder="FM"
                  value={bonusForm.fm}
                  onChange={(e) =>
                    setBonusForm((p) => ({ ...p, fm: e.target.value }))
                  }
                />
                <input
                  className={styles.bonusInput}
                  type="text"
                  placeholder="Raison"
                  value={bonusForm.raison}
                  onChange={(e) =>
                    setBonusForm((p) => ({ ...p, raison: e.target.value }))
                  }
                  required
                />
                <button
                  className={styles.btnBonus}
                  type="submit"
                  disabled={envoiBonus}>
                  {envoiBonus ? "..." : "+ Ajouter"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardUtilisateurs;

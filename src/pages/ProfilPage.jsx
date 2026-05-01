/**
 * ProfilPage — page de profil de l'utilisateur connecté.
 *
 * Cette page (protégée par RouteProtegee) affiche :
 * 1. Les informations du profil : nom, email, rôle, date d'inscription.
 *    - Un avatar avec l'initiale du nom.
 *    - Un Badge coloré selon le rôle (admin, redacteur, adherent, utilisateur).
 * 2. Un formulaire de changement de mot de passe :
 *    - Ancien mot de passe
 *    - Nouveau mot de passe (minimum 6 caractères)
 *    - Confirmation du nouveau mot de passe
 *
 * Flux de données :
 * - Au montage, appel GET /api/auth/me pour récupérer le profil complet.
 * - En cas d'erreur, on utilise les données du Context comme fallback.
 * - Le changement de mot de passe utilise PUT /api/auth/password.
 */
import { useState, useEffect } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import { calculerRang } from "../utils/rangs";
import styles from "./ProfilPage.module.css";

function ProfilPage() {
  // Données de l'utilisateur depuis le Context (utilisées comme fallback)
  const { utilisateur } = useAuth();

  // State du profil chargé depuis l'API
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  // States pour le formulaire de changement de mot de passe
  const [formMdp, setFormMdp] = useState({
    ancien: "",
    nouveau: "",
    confirmation: "",
  });
  const [erreurMdp, setErreurMdp] = useState(null);
  const [successMdp, setSuccessMdp] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // ── Chargement du profil au montage ──
  useEffect(() => {
    const chargerProfil = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setProfil(res.data.user);
      } catch (err) {
        // En cas d'erreur, on utilise les données du Context comme fallback
        setProfil(utilisateur);
      } finally {
        setChargement(false);
      }
    };
    chargerProfil();
  }, [utilisateur]);

  // Mapping rôle → variante de couleur du Badge
  const varianteRole = {
    admin: "primaire",
    redacteur: "info",
    adherent: "succes",
    organisateur: "accent",
    utilisateur: "defaut",
  };

  /**
   * Gestionnaire de changement des champs du formulaire mot de passe.
   */
  const handleChangeMdp = (e) => {
    setFormMdp({ ...formMdp, [e.target.name]: e.target.value });
  };

  /**
   * Gestionnaire de soumission du formulaire de changement de mot de passe.
   * Effectue des validations côté client avant l'envoi :
   * - Vérification que les deux nouveaux mots de passe correspondent
   * - Vérification de la longueur minimale (6 caractères)
   */
  const handleSoumettreNewMdp = async (e) => {
    e.preventDefault();
    setErreurMdp(null);
    setSuccessMdp(null);

    // Validation : les deux mots de passe doivent correspondre
    if (formMdp.nouveau !== formMdp.confirmation) {
      setErreurMdp("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    // Validation : longueur minimale de 6 caractères
    if (formMdp.nouveau.length < 6) {
      setErreurMdp("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      // Envoi de la requête PUT pour changer le mot de passe
      await api.put("/api/auth/password", {
        ancienMotDePasse: formMdp.ancien,
        nouveauMotDePasse: formMdp.nouveau,
      });
      setSuccessMdp("Mot de passe modifié avec succès !");
      // Reset du formulaire après succès
      setFormMdp({ ancien: "", nouveau: "", confirmation: "" });
    } catch (err) {
      setErreurMdp(err.response?.data?.message || "Erreur lors du changement.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  // Affichage du spinner pendant le chargement des données
  if (chargement) return <Spinner />;

  // Extraction des données avec fallback sur le Context
  const nom = profil?.nom ?? utilisateur?.nom ?? "?";
  const email = profil?.email ?? utilisateur?.email;
  const role = profil?.role ?? utilisateur?.role;

  // Formatage de la date d'inscription en français
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
        {/* ── En-tête de la page ── */}
        <div className={styles.entete}>
          <h1 className={styles.titre}>Mon profil</h1>
          <p className={styles.sousTitre}>Informations de votre compte</p>
        </div>

        {/* ── Carte de profil ── */}
        <div className={styles.carte}>
          {/* Bandeau coloré en haut de la carte */}
          <div className={styles.carteBandeau} />
          <div className={styles.carteCorps}>
            {/* Avatar avec l'initiale du nom */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>{nom[0].toUpperCase()}</div>
            </div>

            {/* Nom et rôle */}
            <p className={styles.nomPrincipal}>{nom}</p>
            <Badge texte={role} variante={varianteRole[role] ?? "defaut"} />

            {/* Informations détaillées */}
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

        {/* ══════════════════════════════════════════════
            Section : Rang XP
            ══════════════════════════════════════════════ */}
        {role !== "utilisateur" &&
          (() => {
            const points = profil?.points ?? 0;
            const rang = calculerRang(points);
            return (
              <div className={styles.sectionXP}>
                <h2 className={styles.sectionTitre}>Rang & XP</h2>
                <div className={styles.rangBloc}>
                  <div
                    className={styles.rangNom}
                    style={{ color: rang.couleur }}>
                    {rang.nom} {rang.division}
                  </div>
                  <div className={styles.rangPoints}>{points} pts</div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${rang.progression}%`,
                        background: rang.couleur,
                      }}
                    />
                  </div>
                  {rang.pointsSuivant !== null && (
                    <p className={styles.progressLabel}>
                      {rang.pointsSuivant} pts avant le rang suivant
                    </p>
                  )}
                  {rang.pointsSuivant === null && (
                    <p className={styles.progressLabel}>
                      Rang maximum atteint 🏆
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

        {/* ══════════════════════════════════════════════
            Section : Tags
            ══════════════════════════════════════════════ */}
        {role !== "utilisateur" && profil?.tags?.length > 0 && (
          <div className={styles.sectionTags}>
            <h2 className={styles.sectionTitre}>Mes tags</h2>
            <div className={styles.tagsListe}>
              {profil.tags.map((tag) => (
                <span
                  key={tag._id}
                  className={styles.tag}
                  style={{ backgroundColor: tag.couleur }}>
                  {tag.nom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            Section : Participations tournois
            ══════════════════════════════════════════════ */}
        {profil?.participationsTournois?.length > 0 && (
          <div className={styles.sectionTags}>
            <h2 className={styles.sectionTitre}>Tournois joués</h2>
            <div className={styles.tagsListe}>
              {profil.participationsTournois.map((p, i) => (
                <div key={i} className={styles.tag} style={{ backgroundColor: "var(--couleur-sombre)" }}>
                  <strong>{p.titreTournoi}</strong>
                  {p.position && <span> — {p.position}</span>}
                  <span> ({p.pointsGagnes} pts)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            Section : Changement de mot de passe
            ══════════════════════════════════════════════ */}
        <div className={styles.sectionMdp}>
          <h2 className={styles.sectionMdpTitre}>Changer le mot de passe</h2>

          {/* Messages d'erreur ou de succès */}
          {erreurMdp && <div className={styles.erreur}>{erreurMdp}</div>}
          {successMdp && <div className={styles.succes}>{successMdp}</div>}

          <form
            className={styles.formulaireMdp}
            onSubmit={handleSoumettreNewMdp}>
            {/* Champ : ancien mot de passe */}
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
            {/* Champ : nouveau mot de passe */}
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
            {/* Champ : confirmation du nouveau mot de passe */}
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
            {/* Bouton de soumission */}
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

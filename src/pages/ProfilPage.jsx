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
import { getThemeUtilisateur } from "../utils/themesProfil";
import PanneauQuetes from "../components/UI/PanneauQuetes";
import OngletGaming from "./profil/OngletGaming";
import OngletGeek from "./profil/OngletGeek";
import OngletReseaux from "./profil/OngletReseaux";
import OngletPersonnalisation from "./profil/OngletPersonnalisation";
import AvatarIcon from "../components/UI/AvatarIcon";
import StatsVisuelles from "../components/UI/StatsVisuelles";
import PlayerCard from "../components/UI/PlayerCard";
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
  const [historique, setHistorique] = useState([]);
  const [showPlayerCard, setShowPlayerCard] = useState(false);

  // States pour le changement de pseudo
  const [nouveauPseudo, setNouveauPseudo] = useState("");
  const [erreurPseudo, setErreurPseudo] = useState(null);
  const [successPseudo, setSuccessPseudo] = useState(null);
  const [pseudoEnCours, setPseudoEnCours] = useState(false);

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
    api.get("/api/users/historique-xp").then((r) => setHistorique(r.data.data)).catch(() => {});
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

  const [ongletActif, setOngletActif] = useState("apercu");
  const rechargerProfil = () => {
    api.get("/api/auth/me").then(res => setProfil(res.data.user)).catch(() => {});
  };

  // Gestionnaire de changement de pseudo
  const handleSoumettreNouveauPseudo = async (e) => {
    e.preventDefault();
    setErreurPseudo(null);
    setSuccessPseudo(null);
    if (nouveauPseudo.trim().length < 3) {
      setErreurPseudo("Le pseudo doit faire au moins 3 caractères.");
      return;
    }
    setPseudoEnCours(true);
    try {
      await api.put("/api/auth/pseudo", { pseudo: nouveauPseudo.trim() });
      setSuccessPseudo(`Pseudo changé en "${nouveauPseudo.trim()}" avec succès !`);
      setNouveauPseudo("");
      rechargerProfil();
    } catch (err) {
      setErreurPseudo(err.response?.data?.message || "Erreur lors du changement.");
    } finally {
      setPseudoEnCours(false);
    }
  };

  const ONGLETS = [
    { id: "apercu", label: "Vue d'ensemble" },
    { id: "gaming", label: "Identité Gaming" },
    { id: "geek", label: "Identité Geek" },
    { id: "reseaux", label: "Réseaux" },
    { id: "perso", label: "Personnalisation" },
    { id: "securite", label: "Sécurité" },
  ];

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

  const rangCalculeProfil = calculerRang(profil?.points || 0);
  const themeActif = getThemeUtilisateur({ ...profil, rangCalcule: rangCalculeProfil });

  const FOND_CARTE_MAP = {
    controller: styles.fondController,
    code: styles.fondCode,
    synthwave: styles.fondSynthwave,
    dragon: styles.fondDragon,
    sakura: styles.fondSakura,
  };
  const fondClass = profil?.fondCarteActif ? FOND_CARTE_MAP[profil.fondCarteActif] || "" : "";

  return (
    <div
      className={styles.pageWrapper}
      style={{
        "--theme-primaire": themeActif.couleurPrimaire,
        "--theme-secondaire": themeActif.couleurSecondaire,
        "--theme-accent": themeActif.couleurAccent,
        background: themeActif.fond,
      }}
    >
    <div className="container">
      <div className={styles.page}>
        {/* ── En-tête de la page ── */}
        <div className={styles.entete}>
          <h1 className={styles.titre}>Mon profil</h1>
          <p className={styles.sousTitre}>Informations de votre compte</p>
        </div>

        <div className={styles.onglets}>
          {ONGLETS.map(o => (
            <button key={o.id} className={`${styles.onglet} ${ongletActif === o.id ? styles.ongletActif : ""}`} onClick={() => setOngletActif(o.id)}>
              {o.label}
            </button>
          ))}
        </div>

        {ongletActif === "gaming" && <OngletGaming profil={profil} onUpdate={rechargerProfil} />}
        {ongletActif === "geek" && <OngletGeek profil={profil} onUpdate={rechargerProfil} />}
        {ongletActif === "reseaux" && <OngletReseaux profil={profil} onUpdate={rechargerProfil} />}
        {ongletActif === "perso" && <OngletPersonnalisation profil={profil} onUpdate={rechargerProfil} />}

        {ongletActif === "apercu" && (<>

        {/* ── Carte de profil ── */}
        <div className={`${styles.carte} ${fondClass}`}>
          {/* Bandeau coloré en haut de la carte */}
          <div className={styles.carteBandeau} />
          <div className={styles.carteCorps}>
            {/* Avatar avec icône personnalisable */}
            <div className={styles.avatarWrapper}>
              <AvatarIcon avatarUrl={profil?.avatarActif} cadreStyle={profil?.cadreStyle} taille="xl" nom={nom} />
            </div>

            {/* Nom et rôle */}
            <p className={styles.nomPrincipal}>
              {profil?.pseudo || nom}
            </p>
            {profil?.pseudo && nom !== profil.pseudo && (
              <p style={{ color: "var(--couleur-texte-secondaire, #aaa)", fontSize: "0.85em", marginTop: "-0.3rem", marginBottom: "0.3rem" }}>
                {nom}
              </p>
            )}
            <Badge texte={role} variante={varianteRole[role] ?? "defaut"} />

            {/* Streak de connexion */}
            {profil?.streakConnexion > 0 && (
              <div className={styles.streakBadge}>
                <span className={styles.streakFlamme}>🔥</span>
                <span className={styles.streakCount}>{profil.streakConnexion}</span>
                <span className={styles.streakLabel}>jours de streak</span>
              </div>
            )}

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
            
            {/* Tags de l'utilisateur */}
            {profil?.tags?.length > 0 && (
              <div className={styles.tagsListe} style={{ marginTop: "1.5rem", justifyContent: "center" }}>
                {profil.tags.map((t) => (
                  <span key={t._id} className={styles.tag} style={{ backgroundColor: t.couleur }}>
                    {t.nom}
                  </span>
                ))}
              </div>
            )}

            {/* Bouton Carte de Joueur */}
            <button className={styles.btnPlayerCard} onClick={() => setShowPlayerCard(true)}>
              🃏 Ma Carte de Joueur
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            Section : Stats Visuelles (remplace les anciennes sections XP/FM)
            ══════════════════════════════════════════════ */}
        {role !== "utilisateur" && (
          <div className={styles.sectionXP}>
            <h2 className={styles.sectionTitre}>📊 Statistiques & Progression</h2>
            <StatsVisuelles profil={profil} historique={historique} />
          </div>
        )}

        {/* Rang & Progression (conservé pour la jauge visuelle) */}
        {role !== "utilisateur" &&
          (() => {
            const points = profil?.points ?? 0;
            const rang = calculerRang(points);
            return (
              <div className={styles.sectionXP}>
                <h2 className={styles.sectionTitre}>Rang & Progression</h2>
                
                <div className={styles.progressionGrid}>
                  <div className={styles.rangBloc}>
                    <div
                      className={styles.rangNom}
                      style={{ color: rang.couleur }}>
                      {rang.nom} {rang.division}
                    </div>
                    <div className={styles.rangPoints}>{points} XP Total</div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${rang.progression}%`,
                          background: rang.couleur,
                        }}
                      />
                    </div>
                    {rang.pointsSuivant !== null ? (
                      <p className={styles.progressLabel}>
                        {rang.pointsSuivant - points} XP avant {rang.nomSuivant || "le prochain rang"}
                      </p>
                    ) : (
                      <p className={styles.progressLabel}>
                        Rang maximum atteint 🏆
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

        <PanneauQuetes />

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

        {role !== "utilisateur" && profil?.participationsTournois?.length > 0 && (
          <div className={styles.sectionTournois}>
            <h2 className={styles.sectionTitre}>Tournois joués</h2>
            <div className={styles.tournoiListe}>
              {profil.participationsTournois.map((p, i) => (
                <div key={i} className={styles.tournoiItem}>
                  <span className={styles.tournoiTitre}>{p.titreTournoi}</span>
                  {p.position && <span className={styles.tournoiPosition}>{p.position}</span>}
                  <span className={styles.tournoiPoints}>+{p.pointsGagnes} pts</span>
                  <span className={styles.tournoiDate}>
                    {new Date(p.dateParticipation).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profil?.badges?.length > 0 && (
          <div className={styles.sectionBadges}>
            <h2 className={styles.sectionTitre}>Badges</h2>
            <div className={styles.badgesGrille}>
              {profil.badges.map((b) => (
                <div key={b._id} className={styles.badgeItem} title={b.description}>
                  <span className={styles.badgeIcone}>{b.icone}</span>
                  <span className={styles.badgeNom}>{b.nom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {historique.length > 0 && (
          <div className={styles.sectionHistorique}>
            <h2 className={styles.sectionTitre}>Historique XP</h2>
            <div className={styles.historiqueList}>
              {historique.map((h, i) => (
                <div key={i} className={styles.historiqueItem}>
                  <span className={styles.historiqueType}>
                    {{ mission: "🎯", article: "📝", commentaire: "💬", evenement: "📅", tournoi: "⚔️", bonus: "⭐" }[h.type] || "📌"}
                  </span>
                  <span className={styles.historiqueRaison}>{h.raison}</span>
                  <span className={styles.historiquePoints}>+{h.points} pts</span>
                  <span className={styles.historiqueDate}>
                    {new Date(h.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* PlayerCard Modal */}
        {showPlayerCard && (
          <PlayerCard profil={profil} onClose={() => setShowPlayerCard(false)} />
        )}
        </>)}

        {ongletActif === "securite" && (
        <div className={styles.sectionMdp}>
          <h2 className={styles.sectionTitre}>Changer le mot de passe</h2>
          <form onSubmit={handleSoumettreNewMdp} className={styles.formMdp}>
            <div className={styles.champ}>
              <label className={styles.label}>Ancien mot de passe</label>
              <input className={styles.input} type="password" name="ancien" value={formMdp.ancien} onChange={handleChangeMdp} placeholder="••••••••" required />
            </div>
            <div className={styles.champ}>
              <label className={styles.label}>Nouveau mot de passe</label>
              <input className={styles.input} type="password" name="nouveau" value={formMdp.nouveau} onChange={handleChangeMdp} placeholder="••••••••" required />
            </div>
            <div className={styles.champ}>
              <label className={styles.label}>Confirmer le nouveau mot de passe</label>
              <input className={styles.input} type="password" name="confirmation" value={formMdp.confirmation} onChange={handleChangeMdp} placeholder="••••••••" required />
            </div>
            <button type="submit" className={styles.btnMdp} disabled={envoiEnCours}>
              {envoiEnCours ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>

          {/* ── Changement de pseudo ── */}
          <h2 className={styles.sectionTitre} style={{ marginTop: "2.5rem" }}>Changer mon pseudo</h2>
          <p style={{ color: "var(--couleur-texte-secondaire, #aaa)", fontSize: "0.9em", marginBottom: "1rem" }}>
            Pseudo actuel&nbsp;:{" "}
            <strong style={{ color: "var(--theme-primaire, #fff)" }}>
              {profil?.pseudo || <em>non défini</em>}
            </strong>
          </p>
          {erreurPseudo && <div className={styles.erreur}>{erreurPseudo}</div>}
          {successPseudo && <div className={styles.succes}>{successPseudo}</div>}
          <form onSubmit={handleSoumettreNouveauPseudo} className={styles.formMdp}>
            <div className={styles.champ}>
              <label className={styles.label}>Nouveau pseudo</label>
              <input
                className={styles.input}
                type="text"
                value={nouveauPseudo}
                onChange={e => setNouveauPseudo(e.target.value)}
                placeholder="ex: ShadowFox42"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_\-\.]+"
                title="Lettres, chiffres, _, - ou . uniquement"
                required
              />
              <small style={{ color: "#888", marginTop: "0.3rem", display: "block" }}>
                3–20 caractères — lettres, chiffres, _, - ou . uniquement
              </small>
            </div>
            <button type="submit" className={styles.btnMdp} disabled={pseudoEnCours}>
              {pseudoEnCours ? "Vérification..." : "Changer le pseudo"}
            </button>
          </form>
        </div>
        )}

      </div>
    </div>
    </div>
  );
}

export default ProfilPage;

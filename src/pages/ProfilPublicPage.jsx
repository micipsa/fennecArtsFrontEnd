import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import styles from "./ProfilPublicPage.module.css";

function ProfilPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [membre, setMembre] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`/api/users/profil-public/${id}`)
      .then((r) => setMembre(r.data.data))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <Spinner />;
  if (!membre) return <div className="container"><p>Membre introuvable.</p><Link to="/communaute">← Communauté</Link></div>;

  // Profil privé
  if (membre.profilPublic === false) {
    const rang = calculerRang(membre.points || 0);
    return (
      <div className="container">
        <div className={styles.page}>
          <button onClick={() => navigate(-1)} className={styles.retourBtn}>← Retour</button>
          <div className={styles.carte}>
            <div className={styles.avatar} style={{ background: rang.couleur }}>
              {(membre.nom || "?")[0].toUpperCase()}
            </div>
            <h1 className={styles.nom}>{membre.nom}</h1>
            <div className={styles.prive}>🔒 Ce profil est privé</div>
          </div>
        </div>
      </div>
    );
  }

  const rang = calculerRang(membre.points || 0);
  const initiale = (membre.nom || "?")[0].toUpperCase();
  const dateInscription = new Date(membre.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const badgesEquipes = membre.badgesEquipes || [];
  const jeuxPreferes = (membre.jeuxPreferes || []).filter(j => j.jeu || j.nomLibre);
  const reseaux = membre.reseauxSociaux || {};
  const setup = membre.setupGaming || {};
  const hasReseaux = Object.values(reseaux).some(v => v);
  const hasSetup = Object.values(setup).some(v => v);

  const RESEAUX_CONFIG = [
    { key: "twitter", icon: "𝕏", prefix: "https://twitter.com/" },
    { key: "twitch", icon: "📺", prefix: "https://twitch.tv/" },
    { key: "youtube", icon: "▶️", prefix: "https://youtube.com/" },
    { key: "instagram", icon: "📷", prefix: "https://instagram.com/" },
    { key: "tiktok", icon: "🎵", prefix: "https://tiktok.com/@" },
    { key: "facebook", icon: "👤", prefix: "https://facebook.com/" },
  ];

  return (
    <div className="container">
      <div className={styles.page}>
        <button onClick={() => navigate(-1)} className={styles.retourBtn}>← Retour</button>

        {/* ── Bannière + Avatar ── */}
        <div className={styles.carte}>
          <div
            className={styles.banniere}
            style={membre.banniereUrl ? { backgroundImage: `url(${membre.banniereUrl})` } : { background: `linear-gradient(135deg, ${rang.couleur}44, ${rang.couleur}11)` }}
          >
            <div className={styles.banniereOverlay} />
          </div>

          <div className={styles.carteCorps}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar} style={{ background: rang.couleur, borderColor: rang.couleur }}>
                {initiale}
              </div>
            </div>

            {/* Nom + Titre + Statut */}
            <h1 className={styles.nom} style={membre.couleurPseudoActive ? { color: membre.couleurPseudoActive } : {}}>
              {membre.nom}
            </h1>
            {membre.titreActif && <div className={styles.titreActif}>{membre.titreActif}</div>}
            
            <div className={styles.badgesInline}>
              <div className={styles.rangNom} style={{ color: rang.couleur }}>{rang.affichage}</div>
            </div>

            {membre.statutPersonnalise && <p className={styles.statut}>"{membre.statutPersonnalise}"</p>}
            <p className={styles.meta}>Membre depuis {dateInscription} · {membre.points || 0} XP Total</p>

            {/* Bio */}
            {membre.bio && (
              <div className={styles.bioSection}>
                <p className={styles.bio}>{membre.bio}</p>
              </div>
            )}

            {/* Badges équipés */}
            {badgesEquipes.length > 0 && (
              <div className={styles.badgesEquipes}>
                {badgesEquipes.map((b) => (
                  <div key={b._id} className={styles.badgeItem} title={b.description || b.nom}>
                    <span className={styles.badgeIcone}>{b.icone || "🏆"}</span>
                    <span className={styles.badgeNom}>{b.nom}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {membre.tags?.length > 0 && (
              <div className={styles.tagsListe}>
                {membre.tags.map((t) => (
                  <span key={t._id} className={styles.tag} style={{ backgroundColor: t.couleur }}>{t.nom}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Jeux préférés ── */}
        {jeuxPreferes.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🎮 Jeux préférés</h3>
            <div className={styles.jeuxGrille}>
              {jeuxPreferes.map((jp, i) => (
                <div key={i} className={styles.jeuCard}>
                  <div className={styles.jeuNom} style={jp.jeu?.couleur ? { color: jp.jeu.couleur } : {}}>
                    {jp.jeu?.nom || jp.nomLibre}
                  </div>
                  {jp.niveau && <span className={styles.jeuDetail}>Niveau: {jp.niveau}</span>}
                  {jp.rangIngame && <span className={styles.jeuDetail}>Rang: {jp.rangIngame}</span>}
                  {jp.pseudoIngame && <span className={styles.jeuDetail}>Pseudo: {jp.pseudoIngame}</span>}
                  {jp.mains?.length > 0 && <span className={styles.jeuDetail}>Mains: {jp.mains.join(", ")}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Setup Gaming ── */}
        {hasSetup && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🖥️ Setup Gaming</h3>
            <div className={styles.setupGrille}>
              {setup.plateforme && <div className={styles.setupItem}><span className={styles.setupLabel}>Plateforme</span><span>{setup.plateforme}</span></div>}
              {setup.clavier && <div className={styles.setupItem}><span className={styles.setupLabel}>Clavier</span><span>{setup.clavier}</span></div>}
              {setup.souris && <div className={styles.setupItem}><span className={styles.setupLabel}>Souris</span><span>{setup.souris}</span></div>}
              {setup.casque && <div className={styles.setupItem}><span className={styles.setupLabel}>Casque</span><span>{setup.casque}</span></div>}
              {setup.ecran && <div className={styles.setupItem}><span className={styles.setupLabel}>Écran</span><span>{setup.ecran}</span></div>}
              {setup.notes && <div className={styles.setupItem}><span className={styles.setupLabel}>Notes</span><span>{setup.notes}</span></div>}
            </div>
          </div>
        )}

        {/* ── Réseaux sociaux ── */}
        {hasReseaux && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🌐 Réseaux</h3>
            <div className={styles.reseauxGrille}>
              {RESEAUX_CONFIG.map(r => reseaux[r.key] ? (
                <a key={r.key} href={r.prefix + reseaux[r.key]} target="_blank" rel="noopener noreferrer" className={styles.reseauLink}>
                  <span>{r.icon}</span> {r.key}
                </a>
              ) : null)}
            </div>
          </div>
        )}

        {/* ── Culture (Animés, Mangas, Films) ── */}
        {(membre.animesFavoris?.length > 0 || membre.mangasFavoris?.length > 0 || membre.filmsSeriesFavoris?.length > 0) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🍿 Culture</h3>
            {membre.animesFavoris?.length > 0 && (
              <div className={styles.cultureBloc}>
                <span className={styles.cultureLabel}>Animés :</span>
                <span>{membre.animesFavoris.join(", ")}</span>
              </div>
            )}
            {membre.mangasFavoris?.length > 0 && (
              <div className={styles.cultureBloc}>
                <span className={styles.cultureLabel}>Mangas :</span>
                <span>{membre.mangasFavoris.join(", ")}</span>
              </div>
            )}
            {membre.filmsSeriesFavoris?.length > 0 && (
              <div className={styles.cultureBloc}>
                <span className={styles.cultureLabel}>Films/Séries :</span>
                <span>{membre.filmsSeriesFavoris.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Badges complets ── */}
        {membre.badges?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🏅 Tous les badges ({membre.badges.length})</h3>
            <div className={styles.badgesGrille}>
              {membre.badges.map((b) => (
                <div key={b._id} className={styles.badgeItemFull} title={b.description}>
                  <span className={styles.badgeIcone}>{b.icone || "🏆"}</span>
                  <span className={styles.badgeNom}>{b.nom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tournois ── */}
        {membre.participationsTournois?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>⚔️ Tournois ({membre.participationsTournois.length})</h3>
            <div className={styles.tournoisListe}>
              {membre.participationsTournois.map((p, i) => (
                <div key={i} className={styles.tournoiItem}>
                  <span className={styles.tournoiTitre}>{p.titreTournoi}</span>
                  {p.position && <span className={styles.position}>{p.position}</span>}
                  {p.pointsGagnes > 0 && <span className={styles.tournoiPts}>+{p.pointsGagnes} XP</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pseudos externes ── */}
        {membre.pseudosExternes && Object.values(membre.pseudosExternes).some(v => v) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitre}>🆔 Pseudos in-game</h3>
            <div className={styles.setupGrille}>
              {Object.entries(membre.pseudosExternes).filter(([,v]) => v).map(([k, v]) => (
                <div key={k} className={styles.setupItem}>
                  <span className={styles.setupLabel}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilPublicPage;

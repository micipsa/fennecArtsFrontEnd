import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { calculerRang } from "../utils/rangs";
import Spinner from "../components/UI/Spinner";
import AvatarIcon from "../components/UI/AvatarIcon";
import styles from "./CommunautePage.module.css";

const RANGS = [
  { code: "fer", nom: "Fer" }, { code: "bronze", nom: "Bronze" },
  { code: "argent", nom: "Argent" }, { code: "or", nom: "Or" },
  { code: "platine", nom: "Platine" }, { code: "emeraude", nom: "Émeraude" },
  { code: "diamant", nom: "Diamant" }, { code: "maitre", nom: "Maître" },
  { code: "grand_maitre", nom: "Grand Maître" }, { code: "challenger", nom: "Challenger" },
];

export default function CommunautePage() {
  const [membres, setMembres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filtres
  const [recherche, setRecherche] = useState("");
  const [filtreJeu, setFiltreJeu] = useState("");
  const [filtreTag, setFiltreTag] = useState("");
  const [filtreRang, setFiltreRang] = useState("");

  // Options de filtres (chargées depuis l'API)
  const [jeuxDispo, setJeuxDispo] = useState([]);
  const [tagsDispo, setTagsDispo] = useState([]);

  const charger = async (p = 1) => {
    setChargement(true);
    try {
      const params = new URLSearchParams();
      params.set("page", p);
      params.set("limit", "24");
      if (recherche) params.set("q", recherche);
      if (filtreJeu) params.set("jeu", filtreJeu);
      if (filtreTag) params.set("tag", filtreTag);
      if (filtreRang) params.set("rang", filtreRang);

      const res = await api.get(`/api/users/communaute?${params.toString()}`);
      setMembres(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);

      if (res.data.filtres) {
        setJeuxDispo(res.data.filtres.jeux || []);
        setTagsDispo(res.data.filtres.tags || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(1); }, [filtreJeu, filtreTag, filtreRang]);

  const handleSearch = (e) => {
    e.preventDefault();
    charger(1);
  };

  const resetFiltres = () => {
    setRecherche("");
    setFiltreJeu("");
    setFiltreTag("");
    setFiltreRang("");
  };

  const hasFilters = recherche || filtreJeu || filtreTag || filtreRang;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>COMMUNAUTÉ</h1>
        <p className={styles.pageSousTitre}>Fennec's Clan</p>
      </div>

      <div className={styles.contenu}>
        {/* ── Barre de recherche ── */}
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 Rechercher un membre..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Rechercher</button>
        </form>

        {/* ── Filtres ── */}
        <div className={styles.filtres}>
          <select
            className={styles.filtre}
            value={filtreJeu}
            onChange={(e) => setFiltreJeu(e.target.value)}
          >
            <option value="">🎮 Tous les jeux</option>
            {jeuxDispo.map((j) => (
              <option key={j._id} value={j._id}>{j.nom}</option>
            ))}
          </select>

          <select
            className={styles.filtre}
            value={filtreTag}
            onChange={(e) => setFiltreTag(e.target.value)}
          >
            <option value="">🏷️ Tous les tags</option>
            {tagsDispo.map((t) => (
              <option key={t._id} value={t._id}>{t.nom}</option>
            ))}
          </select>

          <select
            className={styles.filtre}
            value={filtreRang}
            onChange={(e) => setFiltreRang(e.target.value)}
          >
            <option value="">🏅 Tous les rangs</option>
            {RANGS.map((r) => (
              <option key={r.code} value={r.code}>{r.nom}</option>
            ))}
          </select>

          {hasFilters && (
            <button className={styles.resetBtn} onClick={resetFiltres}>✕ Réinitialiser</button>
          )}
        </div>

        {/* ── Compteur ── */}
        <div className={styles.compteur}>
          <span>{total} membre{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</span>
        </div>

        {/* ── Grille de membres ── */}
        {chargement ? (
          <Spinner />
        ) : membres.length === 0 ? (
          <div className={styles.vide}>
            <span className={styles.videIcone}>🦊</span>
            <p>Aucun membre trouvé avec ces critères.</p>
          </div>
        ) : (
          <div className={styles.grille}>
            {membres.map((m) => {
              const rang = calculerRang(m.points || 0);
              const jeux = (m.jeuxPreferes || []).filter(j => j.jeu).slice(0, 3);

              return (
                <Link to={`/membres/${m._id}`} key={m._id} className={styles.carte}>
                  {/* Mini bannière */}
                  <div
                    className={styles.carteBanniere}
                    style={m.banniereUrl ? { backgroundImage: `url(${m.banniereUrl})` } : { background: `linear-gradient(135deg, ${rang.couleur}33, transparent)` }}
                  />

                    <div className={styles.carteCorps}>
                    <AvatarIcon avatarUrl={m.avatarActif} cadreStyle={m.cadreStyle} taille="md" nom={m.nom} />
                    <h3
                      className={styles.carteNom}
                      style={m.couleurPseudoActive ? { color: m.couleurPseudoActive } : {}}
                    >
                      {m.nom}
                    </h3>
                    <span className={styles.carteRang} style={{ color: rang.couleur }}>{rang.affichage}</span>
                    <span className={styles.carteXP}>{m.points || 0} XP</span>

                    {/* Badges équipés */}
                    {m.badgesEquipes?.length > 0 && (
                      <div className={styles.carteBadges}>
                        {m.badgesEquipes.map((b) => (
                          <span key={b._id} title={b.nom}>{b.icone || "🏆"}</span>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {m.tags?.length > 0 && (
                      <div className={styles.carteTags}>
                        {m.tags.slice(0, 3).map((t) => (
                          <span key={t._id} className={styles.carteTag} style={{ background: t.couleur }}>{t.nom}</span>
                        ))}
                      </div>
                    )}

                    {/* Jeux */}
                    {jeux.length > 0 && (
                      <div className={styles.carteJeux}>
                        {jeux.map((jp, i) => (
                          <span key={i} className={styles.carteJeu} style={jp.jeu?.couleur ? { borderColor: jp.jeu.couleur, color: jp.jeu.couleur } : {}}>
                            {jp.jeu?.nom}
                          </span>
                        ))}
                      </div>
                    )}

                    {m.bio && <p className={styles.carteBio}>{m.bio.slice(0, 60)}{m.bio.length > 60 ? "..." : ""}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => charger(page - 1)}
              className={styles.pageBtn}
            >← Précédent</button>
            <span className={styles.pageInfo}>Page {page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => charger(page + 1)}
              className={styles.pageBtn}
            >Suivant →</button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import styles from "./RechercheGlobale.module.css";

function RechercheGlobale() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [articles, setArticles] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setChargement(true);
    Promise.all([
      api.get(`/api/articles?search=${encodeURIComponent(q)}&limit=5`),
      api.get(`/api/events?search=${encodeURIComponent(q)}&limit=5`),
      api.get(`/api/tournaments?search=${encodeURIComponent(q)}&limit=5`),
    ])
      .then(([resA, resE, resT]) => {
        setArticles(resA.data.data || []);
        setEvenements(resE.data.data || []);
        setTournois(resT.data.data || []);
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [q]);

  const total = articles.length + evenements.length + tournois.length;

  return (
    <div className="container">
      <div className={styles.entete}>
        <h1 className={styles.titre}>Résultats pour « {q} »</h1>
        {!chargement && <p className={styles.sousTitre}>{total} résultat(s) trouvé(s)</p>}
      </div>

      {chargement && <Spinner />}

      {!chargement && total === 0 && q && (
        <p className={styles.vide}>Aucun résultat pour cette recherche.</p>
      )}

      {!chargement && articles.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitre}>Articles</h2>
          <div className={styles.liste}>
            {articles.map((a) => (
              <Link key={a._id} to={`/articles/${a._id}`} className={styles.item}>
                {a.imageUrl && <img src={a.imageUrl} alt={a.titre} className={styles.itemImg} />}
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitre}>{a.titre}</span>
                  <span className={styles.itemMeta}>{a.categorie} · {new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!chargement && evenements.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitre}>Événements</h2>
          <div className={styles.liste}>
            {evenements.map((e) => (
              <Link key={e._id} to={`/events/${e._id}`} className={styles.item}>
                {e.imageUrl && <img src={e.imageUrl} alt={e.titre} className={styles.itemImg} />}
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitre}>{e.titre}</span>
                  <span className={styles.itemMeta}>{e.lieu} · {new Date(e.dateDebut).toLocaleDateString("fr-FR")}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!chargement && tournois.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitre}>Tournois</h2>
          <div className={styles.liste}>
            {tournois.map((t) => (
              <Link key={t._id} to={`/tournaments/${t._id}`} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitre}>{t.titre}</span>
                  <span className={styles.itemMeta}>{t.statut} · {t.typeBracket}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default RechercheGlobale;

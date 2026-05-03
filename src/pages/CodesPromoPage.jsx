import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import styles from "./CodesPromoPage.module.css";

export default function CodesPromoPage() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    api.get("/api/codes/mes-codes").then(r => setHistorique(r.data.data || [])).catch(() => {});
    if (params.get("code")) utiliser(params.get("code"));
  }, []);

  const utiliser = async (codeAUtiliser = null) => {
    const codeFinal = codeAUtiliser || code;
    if (!codeFinal.trim()) return;
    setChargement(true);
    setResultat(null);
    setErreur(null);
    try {
      const res = await api.post("/api/codes/utiliser", { code: codeFinal });
      setResultat(res.data);
      setCode("");
      const h = await api.get("/api/codes/mes-codes");
      setHistorique(h.data.data || []);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contenu}>
        <h1 className={styles.titre}>🎟️ Codes Promo</h1>
        <p className={styles.sousTitre}>Utilise tes codes pour débloquer XP, FM, items et badges</p>

        <div className={styles.formulaire}>
          <input
            type="text"
            placeholder="ENTRE TON CODE..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={styles.input}
            onKeyDown={(e) => e.key === "Enter" && utiliser()}
          />
          <button
            onClick={() => utiliser()}
            disabled={chargement || !code.trim()}
            className={styles.btnUtiliser}
          >
            {chargement ? "..." : "Utiliser"}
          </button>
        </div>

        {resultat && (
          <div className={styles.succes}>
            <span className={styles.succesIcone}>🎉</span>
            <div>
              <strong>{resultat.message}</strong>
              <div className={styles.recompenses}>
                {resultat.recompenses?.map((r, i) => (<span key={i}>{r}</span>))}
              </div>
            </div>
          </div>
        )}

        {erreur && (
          <div className={styles.erreur}>
            <span>❌</span> {erreur}
          </div>
        )}

        <h2 className={styles.titreHistorique}>📜 Historique</h2>
        {historique.length === 0 ? (
          <p className={styles.vide}>Tu n'as encore utilisé aucun code</p>
        ) : (
          <div className={styles.historique}>
            {historique.map(h => (
              <div key={h._id} className={styles.historiqueItem}>
                <span className={styles.codeBadge}>{h.code}</span>
                <span className={styles.codeDesc}>{h.description}</span>
                <span className={styles.codeRecomp}>
                  {h.recompenseXP > 0 && `+${h.recompenseXP} XP `}
                  {h.recompenseFM > 0 && `+${h.recompenseFM} FM`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import api from "../services/api";
import styles from "./DashboardCodesPromo.module.css";

export default function DashboardCodesPromo() {
  const [codes, setCodes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalCreer, setModalCreer] = useState(false);
  const [modalMasse, setModalMasse] = useState(false);
  const [modalQR, setModalQR] = useState(null);
  const [filtre, setFiltre] = useState("tous");

  const [form, setForm] = useState({
    code: "", type: "xp", description: "",
    recompenseXP: 0, recompenseFM: 0,
    reutilisable: true, utilisateursMaximum: -1, dateExpiration: "",
  });
  const [formMasse, setFormMasse] = useState({ quantite: 10, prefix: "FNK", type: "xp", description: "", recompenseXP: 50, recompenseFM: 0 });

  const charger = async () => {
    try {
      const res = await api.get("/api/codes");
      setCodes(res.data.data || []);
    } catch (e) {} finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const creer = async () => {
    try {
      await api.post("/api/codes", form);
      setModalCreer(false);
      setForm({ code: "", type: "xp", description: "", recompenseXP: 0, recompenseFM: 0, reutilisable: true, utilisateursMaximum: -1, dateExpiration: "" });
      charger();
    } catch (e) { alert(e.response?.data?.message || "Erreur"); }
  };

  const genererMasse = async () => {
    try {
      await api.post("/api/codes/generer-masse", formMasse);
      setModalMasse(false);
      charger();
    } catch (e) { alert(e.response?.data?.message || "Erreur"); }
  };

  const toggleActif = async (id, actif) => {
    await api.patch(`/api/codes/${id}`, { actif: !actif });
    charger();
  };

  const supprimer = async (id) => {
    if (!confirm("Supprimer ce code ?")) return;
    await api.delete(`/api/codes/${id}`);
    charger();
  };

  const codesFiltres = codes.filter(c => {
    if (filtre === "actifs") return c.actif;
    if (filtre === "inactifs") return !c.actif;
    return true;
  });

  const qrUrl = (code) => `${window.location.origin}/codes?code=${encodeURIComponent(code)}`;

  if (chargement) return <div className={styles.page}><p>Chargement...</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <h1 className={styles.titre}>🎟️ Codes Promo</h1>
        <div className={styles.actions}>
          <button className={styles.btnCreer} onClick={() => setModalCreer(true)}>+ Créer un code</button>
          <button className={styles.btnMasse} onClick={() => setModalMasse(true)}>⚡ Générer en masse</button>
        </div>
      </div>

      <div className={styles.filtres}>
        {["tous", "actifs", "inactifs"].map(f => (
          <button key={f} className={`${styles.filtreBouton} ${filtre === f ? styles.filtreActif : ""}`} onClick={() => setFiltre(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className={styles.compteur}>{codesFiltres.length} codes</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Description</th>
              <th>Récompenses</th>
              <th>Utilisations</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codesFiltres.map(c => (
              <tr key={c._id}>
                <td className={styles.codeCell}>{c.code}</td>
                <td><span className={styles.typeBadge}>{c.type}</span></td>
                <td className={styles.descCell}>{c.description}</td>
                <td>
                  {c.recompenseXP > 0 && <span className={styles.recompXP}>+{c.recompenseXP} XP</span>}
                  {c.recompenseFM > 0 && <span className={styles.recompFM}>+{c.recompenseFM} FM</span>}
                </td>
                <td>{c.utilisations?.length || 0}{c.utilisateursMaximum > 0 ? `/${c.utilisateursMaximum}` : ""}</td>
                <td>
                  <span className={c.actif ? styles.statutActif : styles.statutInactif}>
                    {c.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.btnQR} onClick={() => setModalQR(c.code)} title="QR Code">📱</button>
                  <button className={styles.btnToggle} onClick={() => toggleActif(c._id, c.actif)} title={c.actif ? "Désactiver" : "Activer"}>
                    {c.actif ? "⏸" : "▶"}
                  </button>
                  <button className={styles.btnSupp} onClick={() => supprimer(c._id)} title="Supprimer">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalCreer && (
        <div className={styles.modalOverlay} onClick={() => setModalCreer(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Créer un code</h2>
            <div className={styles.formGrid}>
              <label>Code (vide = auto)<input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="FNK-XXXX" /></label>
              <label>Type
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="xp">XP</option><option value="fm">FM</option><option value="item">Item</option><option value="badge">Badge</option><option value="combo">Combo</option>
                </select>
              </label>
              <label>Description<input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></label>
              <label>XP<input type="number" value={form.recompenseXP} onChange={e => setForm({...form, recompenseXP: +e.target.value})} /></label>
              <label>FM<input type="number" value={form.recompenseFM} onChange={e => setForm({...form, recompenseFM: +e.target.value})} /></label>
              <label>Max utilisateurs (-1 = illimité)<input type="number" value={form.utilisateursMaximum} onChange={e => setForm({...form, utilisateursMaximum: +e.target.value})} /></label>
              <label>Expiration<input type="datetime-local" value={form.dateExpiration} onChange={e => setForm({...form, dateExpiration: e.target.value})} /></label>
              <label className={styles.checkLabel}><input type="checkbox" checked={form.reutilisable} onChange={e => setForm({...form, reutilisable: e.target.checked})} /> Réutilisable</label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCreer} onClick={creer}>Créer</button>
              <button className={styles.btnAnnuler} onClick={() => setModalCreer(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {modalMasse && (
        <div className={styles.modalOverlay} onClick={() => setModalMasse(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Générer en masse</h2>
            <div className={styles.formGrid}>
              <label>Quantité (1-100)<input type="number" min="1" max="100" value={formMasse.quantite} onChange={e => setFormMasse({...formMasse, quantite: +e.target.value})} /></label>
              <label>Préfixe<input value={formMasse.prefix} onChange={e => setFormMasse({...formMasse, prefix: e.target.value.toUpperCase()})} /></label>
              <label>Type
                <select value={formMasse.type} onChange={e => setFormMasse({...formMasse, type: e.target.value})}>
                  <option value="xp">XP</option><option value="fm">FM</option><option value="combo">Combo</option>
                </select>
              </label>
              <label>Description<input value={formMasse.description} onChange={e => setFormMasse({...formMasse, description: e.target.value})} /></label>
              <label>XP par code<input type="number" value={formMasse.recompenseXP} onChange={e => setFormMasse({...formMasse, recompenseXP: +e.target.value})} /></label>
              <label>FM par code<input type="number" value={formMasse.recompenseFM} onChange={e => setFormMasse({...formMasse, recompenseFM: +e.target.value})} /></label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCreer} onClick={genererMasse}>Générer {formMasse.quantite} codes</button>
              <button className={styles.btnAnnuler} onClick={() => setModalMasse(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {modalQR && (
        <div className={styles.modalOverlay} onClick={() => setModalQR(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>QR Code</h2>
            <div className={styles.qrContent}>
              <div className={styles.qrPlaceholder}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrUrl(modalQR))}`} alt="QR Code" className={styles.qrImage} />
              </div>
              <p className={styles.qrCode}>{modalQR}</p>
              <p className={styles.qrUrl}>{qrUrl(modalQR)}</p>
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrUrl(modalQR))}&format=png`} download={`qr-${modalQR}.png`} className={styles.btnCreer}>
                💾 Télécharger
              </a>
            </div>
            <button className={styles.btnAnnuler} onClick={() => setModalQR(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

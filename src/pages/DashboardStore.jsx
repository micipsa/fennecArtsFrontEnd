import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useToast } from "../components/UI/Toast";
import styles from "./DashboardStore.module.css";

const TYPES_ARTICLE = [
  { value: "avatar_icon", label: "Avatar (Icône)" },
  { value: "cadre_profil", label: "Cadre Profil" },
  { value: "titre_custom", label: "Titre Custom" },
  { value: "couleur_pseudo", label: "Couleur Pseudo" },
  { value: "ticket_tournoi", label: "Ticket Tournoi" },
  { value: "goodies", label: "Goodies" },
  { value: "boost_xp", label: "Boost XP" }
];

export default function DashboardStore() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const [form, setForm] = useState({ nom: "", description: "", type: "cadre_profil", prix: 0, stock: -1, imageUrl: "", donnees: {} });
  const [isEditing, setIsEditing] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/store");
      setArticles(res.data.data);
    } catch (err) {
      addToast("Erreur chargement articles", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        fetchArticles();
      }
    };
    run();
    return () => {
      actif = false;
    };
  }, [fetchArticles]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.patch(`/api/store/${isEditing}`, form);
        addToast("Article modifié !", "success");
      } else {
        await api.post("/api/store", form);
        addToast("Article créé !", "success");
      }
      setForm({ nom: "", description: "", type: "cadre_profil", prix: 0, stock: -1, imageUrl: "", donnees: {} });
      setIsEditing(null);
      fetchArticles();
    } catch (err) {
      addToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleEdit = (article) => {
    setIsEditing(article._id);
    setForm({
      nom: article.nom, description: article.description,
      type: article.type, prix: article.prix, stock: article.stock, imageUrl: article.imageUrl || "",
      donnees: article.donnees || {}
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await api.delete(`/api/store/${id}`);
      addToast("Article supprimé", "success");
      fetchArticles();
    } catch (err) {
      addToast("Erreur de suppression", "error");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>Gestion Boutique (Store)</h1>

      <div className={styles.layout}>
        <div className={styles.formPanel}>
          <h2>{isEditing ? "Modifier l'article" : "Nouvel article"}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Nom</label>
              <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows="3"></textarea>
            </div>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {TYPES_ARTICLE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Prix (FM)</label>
                <input type="number" min="0" value={form.prix} onChange={e => setForm({...form, prix: Number(e.target.value)})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Stock (-1 = illimité)</label>
                <input type="number" min="-1" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>URL Image</label>
              <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
            </div>

            {/* ── Champs donnees dynamiques selon le type ── */}
            {form.type === "couleur_pseudo" && (
              <div className={styles.formGroup}>
                <label>Couleur (HEX)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="color" value={form.donnees?.couleur || "#e63946"}
                    onChange={e => setForm({...form, donnees: { ...form.donnees, couleur: e.target.value }})} 
                    style={{ width: "48px", height: "36px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  />
                  <input type="text" value={form.donnees?.couleur || ""} placeholder="#e63946"
                    onChange={e => setForm({...form, donnees: { ...form.donnees, couleur: e.target.value }})} />
                </div>
              </div>
            )}

            {form.type === "titre_custom" && (
              <div className={styles.formGroup}>
                <label>Texte du titre</label>
                <input type="text" placeholder="Ex: Le Fennec Suprême" value={form.donnees?.titre || ""}
                  onChange={e => setForm({...form, donnees: { ...form.donnees, titre: e.target.value }})} />
              </div>
            )}

            {form.type === "boost_xp" && (
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Multiplicateur XP</label>
                  <input type="number" step="0.1" min="1" placeholder="1.5" value={form.donnees?.multiplicateur || ""}
                    onChange={e => setForm({...form, donnees: { ...form.donnees, multiplicateur: Number(e.target.value) }})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Durée (heures)</label>
                  <input type="number" min="1" placeholder="24" value={form.donnees?.dureeHeures || ""}
                    onChange={e => setForm({...form, donnees: { ...form.donnees, dureeHeures: Number(e.target.value) }})} />
                </div>
              </div>
            )}

            {form.type === "cadre_profil" && (
              <div className={styles.formGroup}>
                <label>CSS Classe ou style du cadre</label>
                <input type="text" placeholder="Ex: border-gold, gradient-fire" value={form.donnees?.style || ""}
                  onChange={e => setForm({...form, donnees: { ...form.donnees, style: e.target.value }})} />
              </div>
            )}

            <div className={styles.actions}>
              {isEditing && <button type="button" onClick={() => { setIsEditing(null); setForm({ nom: "", description: "", type: "cadre_profil", prix: 0, stock: -1, imageUrl: "", donnees: {} }); }} className={styles.btnCancel}>Annuler</button>}
              <button type="submit" className={styles.btnSubmit}>{isEditing ? "Enregistrer" : "Créer l'article"}</button>
            </div>
          </form>
        </div>

        <div className={styles.listPanel}>
          <h2>Articles existants</h2>
          {loading ? <p>Chargement...</p> : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a._id}>
                      <td>{a.nom}</td>
                      <td>{TYPES_ARTICLE.find(t => t.value === a.type)?.label}</td>
                      <td>{a.prix} FM</td>
                      <td>{a.stock === -1 ? "∞" : a.stock}</td>
                      <td className={styles.tdActions}>
                        <button onClick={() => handleEdit(a)} className={styles.btnEdit}>✏️</button>
                        <button onClick={() => handleDelete(a._id)} className={styles.btnDelete}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

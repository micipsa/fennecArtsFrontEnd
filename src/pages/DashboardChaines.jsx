import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./DashboardChaines.module.css";

const FORM_INITIAL = {
  nom: "",
  channelId: "",
  handle: "",
  type: "adherent",
  actif: true,
};

function DashboardChaines() {
  const [chaines, setChaines] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [modaleEditionOuverte, setModaleEditionOuverte] = useState(false);
  const [chaineEnEdition, setChaineEnEdition] = useState(null);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);
  const [modaleBlacklistOuverte, setModaleBlacklistOuverte] = useState(false);
  const [chaineBlacklist, setChaineBlacklist] = useState(null);
  const [videoIdInput, setVideoIdInput] = useState("");

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      const res = await api.get("/api/chaines/admin");
      setChaines(res.data);
    } catch (err) {
      setErreur("Impossible de charger les chaînes.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    let actif = true;
    const run = async () => {
      await Promise.resolve();
      if (actif) {
        charger();
      }
    };
    run();
    return () => {
      actif = false;
    };
  }, [charger]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/chaines", formData);
      setChaines((prev) => [...prev, res.data]);
      setModaleOuverte(false);
      setFormData(FORM_INITIAL);
    } catch (err) {
      setErreurForm(
        err.response?.data?.message || "Erreur lors de la création.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleOuvrirEdition = (chaine) => {
    setChaineEnEdition(chaine._id);
    setFormData({
      nom: chaine.nom,
      channelId: chaine.channelId,
      handle: chaine.handle || "",
      type: chaine.type,
      actif: chaine.actif,
    });
    setModaleEditionOuverte(true);
  };

  const handleModifier = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.put(`/api/chaines/${chaineEnEdition}`, formData);
      setChaines((prev) =>
        prev.map((c) => (c._id === chaineEnEdition ? res.data : c)),
      );
      setModaleEditionOuverte(false);
      setChaineEnEdition(null);
      setFormData(FORM_INITIAL);
    } catch (err) {
      setErreurForm(
        err.response?.data?.message || "Erreur lors de la modification.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cette chaîne ?")) return;
    try {
      await api.delete(`/api/chaines/${id}`);
      setChaines((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleOuvrirBlacklist = (chaine) => {
    setChaineBlacklist(chaine);
    setVideoIdInput("");
    setModaleBlacklistOuverte(true);
  };

  const handleExclure = async () => {
    if (!videoIdInput.trim()) return;
    try {
      const res = await api.patch(
        `/api/chaines/${chaineBlacklist._id}/exclure`,
        { videoId: videoIdInput.trim() },
      );
      setChaines((prev) =>
        prev.map((c) => (c._id === chaineBlacklist._id ? res.data : c)),
      );
      setChaineBlacklist(res.data);
      setVideoIdInput("");
    } catch (err) {
      alert("Erreur lors du blacklist.");
    }
  };

  const handleInclure = async (videoId) => {
    try {
      const res = await api.patch(
        `/api/chaines/${chaineBlacklist._id}/inclure`,
        { videoId },
      );
      setChaines((prev) =>
        prev.map((c) => (c._id === chaineBlacklist._id ? res.data : c)),
      );
      setChaineBlacklist(res.data);
    } catch (err) {
      alert("Erreur lors du retrait du blacklist.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  const formulaireContenu = (
    <>
      <div className={styles.champ}>
        <label className={styles.label}>Nom de la chaîne</label>
        <input
          className={styles.input}
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          placeholder="Ex: Fennec Arts eSports"
          required
        />
      </div>
      <div className={styles.champ}>
        <label className={styles.label}>Channel ID YouTube</label>
        <input
          className={styles.input}
          type="text"
          name="channelId"
          value={formData.channelId}
          onChange={handleChange}
          placeholder="Ex: UCaJ0NSWdENJvXbW_BL_uBqg"
          required
        />
        <span className={styles.aide}>
          Trouvable dans l'URL de la chaîne YouTube
        </span>
      </div>
      <div className={styles.champ}>
        <label className={styles.label}>Handle (optionnel)</label>
        <input
          className={styles.input}
          type="text"
          name="handle"
          value={formData.handle}
          onChange={handleChange}
          placeholder="Ex: @FennecArtseSports"
        />
      </div>
      <div className={styles.champ}>
        <label className={styles.label}>Type</label>
        <select
          className={styles.input}
          name="type"
          value={formData.type}
          onChange={handleChange}>
          <option value="officiel">Officiel</option>
          <option value="adherent">Adhérent</option>
        </select>
      </div>
      <div className={styles.champCheckbox}>
        <input
          type="checkbox"
          id="actif"
          name="actif"
          checked={formData.actif}
          onChange={handleChange}
          className={styles.checkbox}
        />
        <label htmlFor="actif" className={styles.labelCheckbox}>
          Chaîne active (visible sur la WebTV)
        </label>
      </div>
    </>
  );

  return (
    <div>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Chaînes WebTV</h1>
          <p className={styles.sousTitre}>
            {chaines.length} chaîne(s) enregistrée(s)
          </p>
        </div>
        <button
          className={styles.btnCreer}
          onClick={() => setModaleOuverte(true)}>
          + Nouvelle chaîne
        </button>
      </div>

      {/* ── Liste des chaînes ── */}
      <div className={styles.liste}>
        {chaines.length === 0 && (
          <p className={styles.vide}>Aucune chaîne enregistrée.</p>
        )}
        {chaines.map((chaine) => (
          <div key={chaine._id} className={styles.carte}>
            <div className={styles.carteEntete}>
              <div className={styles.carteInfo}>
                <div className={styles.carteNomLigne}>
                  <span className={styles.carteNom}>{chaine.nom}</span>
                  <span
                    className={`${styles.badgeType} ${chaine.type === "officiel" ? styles.officiel : styles.adherent}`}>
                    {chaine.type}
                  </span>
                  <span
                    className={`${styles.badgeActif} ${chaine.actif ? styles.actif : styles.inactif}`}>
                    {chaine.actif ? "Actif" : "Inactif"}
                  </span>
                </div>
                <span className={styles.carteId}>{chaine.channelId}</span>
                {chaine.handle && (
                  <span className={styles.carteHandle}>{chaine.handle}</span>
                )}
                {chaine.videosExclues.length > 0 && (
                  <span className={styles.blacklistCount}>
                    🚫 {chaine.videosExclues.length} vidéo(s) blacklistée(s)
                  </span>
                )}
              </div>
              <div className={styles.carteActions}>
                <button
                  className={styles.btnBlacklist}
                  onClick={() => handleOuvrirBlacklist(chaine)}>
                  Blacklist
                </button>
                <button
                  className={styles.btnModifier}
                  onClick={() => handleOuvrirEdition(chaine)}>
                  Modifier
                </button>
                <button
                  className={styles.btnSupprimer}
                  onClick={() => handleSupprimer(chaine._id)}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modale création ── */}
      {modaleOuverte && (
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouvelle chaîne</h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleOuverte(false)}>
                ✕
              </button>
            </div>
            {erreurForm && (
              <div className={styles.erreurForm}>{erreurForm}</div>
            )}
            <form className={styles.formulaire} onSubmit={handleCreer}>
              {formulaireContenu}
              <div className={styles.modaleActions}>
                <button
                  type="button"
                  className={styles.btnAnnuler}
                  onClick={() => setModaleOuverte(false)}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSoumettre}
                  disabled={envoiEnCours}>
                  {envoiEnCours ? "Création..." : "Créer la chaîne"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale édition ── */}
      {modaleEditionOuverte && (
        <div
          className={styles.overlay}
          onClick={() => setModaleEditionOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Modifier la chaîne</h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleEditionOuverte(false)}>
                ✕
              </button>
            </div>
            {erreurForm && (
              <div className={styles.erreurForm}>{erreurForm}</div>
            )}
            <form className={styles.formulaire} onSubmit={handleModifier}>
              {formulaireContenu}
              <div className={styles.modaleActions}>
                <button
                  type="button"
                  className={styles.btnAnnuler}
                  onClick={() => setModaleEditionOuverte(false)}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnSoumettre}
                  disabled={envoiEnCours}>
                  {envoiEnCours ? "Modification..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale blacklist ── */}
      {modaleBlacklistOuverte && chaineBlacklist && (
        <div
          className={styles.overlay}
          onClick={() => setModaleBlacklistOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>
                Blacklist — {chaineBlacklist.nom}
              </h2>
              <button
                className={styles.modaleFermer}
                onClick={() => setModaleBlacklistOuverte(false)}>
                ✕
              </button>
            </div>

            <div className={styles.blacklistAjout}>
              <label className={styles.label}>
                Ajouter un videoId à blacklister
              </label>
              <div className={styles.blacklistLigne}>
                <input
                  className={styles.input}
                  type="text"
                  value={videoIdInput}
                  onChange={(e) => setVideoIdInput(e.target.value)}
                  placeholder="Ex: DuktX7lu7ic"
                />
                <button
                  type="button"
                  className={styles.btnSoumettre}
                  onClick={handleExclure}>
                  Blacklister
                </button>
              </div>
              <span className={styles.aide}>
                Le videoId se trouve dans l'URL YouTube : youtube.com/watch?v=
                <strong>videoId</strong>
              </span>
            </div>

            <div className={styles.blacklistListe}>
              <p className={styles.label}>
                Vidéos blacklistées ({chaineBlacklist.videosExclues.length})
              </p>
              {chaineBlacklist.videosExclues.length === 0 && (
                <p className={styles.vide}>Aucune vidéo blacklistée.</p>
              )}
              {chaineBlacklist.videosExclues.map((videoId) => (
                <div key={videoId} className={styles.blacklistItem}>
                  <span className={styles.blacklistVideoId}>{videoId}</span>
                  <button
                    type="button"
                    className={styles.btnRetirer}
                    onClick={() => handleInclure(videoId)}>
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardChaines;

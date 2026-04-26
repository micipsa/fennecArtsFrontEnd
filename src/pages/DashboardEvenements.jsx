import { useState, useEffect } from "react";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import Badge from "../components/UI/Badge";
import styles from "./DashboardEvenements.module.css";

const FORM_INITIAL = {
  titre: "",
  description: "",
  categorie: "Exposition",
  lieu: "",
  dateDebut: "",
  dateFin: "",
};

const CATEGORIES = [
  "Exposition",
  "Concert",
  "Atelier",
  "Conférence",
  "Festival",
  "Autre",
];

function DashboardEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [formData, setFormData] = useState(FORM_INITIAL);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurForm, setErreurForm] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const res = await api.get("/api/events");
        setEvenements(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les événements.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    setErreurForm(null);
    setEnvoiEnCours(true);
    try {
      const res = await api.post("/api/events", formData);
      setEvenements((prev) => [res.data.data, ...prev]);
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

  const handleSupprimer = async (id) => {
    if (!window.confirm("Confirmer la suppression de cet événement ?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      setEvenements((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Gestion des événements</h1>
          <p className={styles.sousTitre}>
            {evenements.length} événement(s) au total
          </p>
        </div>
        <button
          className={styles.btnCreer}
          onClick={() => setModaleOuverte(true)}>
          + Nouvel événement
        </button>
      </div>

      <div className={styles.tableau}>
        <div className={styles.tableauEntete}>
          <span>Titre</span>
          <span>Catégorie</span>
          <span>Lieu</span>
          <span>Date début</span>
          <span>Actions</span>
        </div>

        {evenements.length === 0 && (
          <p className={styles.vide}>Aucun événement pour l'instant.</p>
        )}

        {evenements.map((ev) => (
          <div key={ev._id} className={styles.tableauLigne}>
            <span className={styles.titreLigne}>{ev.titre}</span>
            <span>
              <Badge texte={ev.categorie} variante="primaire" />
            </span>
            <span className={styles.cellule}>{ev.lieu}</span>
            <span>{new Date(ev.dateDebut).toLocaleDateString("fr-FR")}</span>
            <span>
              <button
                className={styles.btnSupprimer}
                onClick={() => handleSupprimer(ev._id)}>
                Supprimer
              </button>
            </span>
          </div>
        ))}
      </div>

      {modaleOuverte && (
        <div className={styles.overlay} onClick={() => setModaleOuverte(false)}>
          <div className={styles.modale} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modaleEntete}>
              <h2 className={styles.modaleTitre}>Nouvel événement</h2>
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
              <div className={styles.champ}>
                <label className={styles.label}>Titre</label>
                <input
                  className={styles.input}
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Titre de l'événement"
                  required
                />
              </div>

              <div className={styles.champ}>
                <label className={styles.label}>Catégorie</label>
                <select
                  className={styles.input}
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.champ}>
                <label className={styles.label}>Lieu</label>
                <input
                  className={styles.input}
                  type="text"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleChange}
                  placeholder="Ville, salle..."
                  required
                />
              </div>

              <div className={styles.grilleDates}>
                <div className={styles.champ}>
                  <label className={styles.label}>Date de début</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="dateDebut"
                    value={formData.dateDebut}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.champ}>
                  <label className={styles.label}>Date de fin</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.champ}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'événement..."
                  rows={5}
                  required
                />
              </div>

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
                  {envoiEnCours ? "Création..." : "Créer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardEvenements;

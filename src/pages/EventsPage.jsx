import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import CarteEvenement from "../components/Cards/CarteEvenement";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./EventsPage.module.css";

const STATUTS = [
  { valeur: "tous", label: "Tous" },
  { valeur: "avenir", label: "À venir" },
  { valeur: "passes", label: "Passés" },
];

function EventsPage() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [statut, setStatut] = useState("tous");

  useEffect(() => {
    const chargerEvenements = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const res = await api.get("/api/events");
        setEvenements(res.data.data);
      } catch (err) {
        setErreur(
          err.response?.data?.message ||
            "Impossible de charger les événements.",
        );
      } finally {
        setChargement(false);
      }
    };

    chargerEvenements();
  }, []);

  const evenementsFiltres = useMemo(() => {
    const maintenant = new Date();
    return evenements.filter((ev) => {
      if (statut === "avenir") return new Date(ev.dateDebut) > maintenant;
      if (statut === "passes") return new Date(ev.dateDebut) <= maintenant;
      return true;
    });
  }, [evenements, statut]);

  return (
    <div className="container">
      <div className={styles.entete}>
        <h1 className={styles.titre}>Événements</h1>
        <p className={styles.sousTitre}>
          Concerts, expositions, ateliers et bien plus
        </p>
      </div>

      <div className={styles.filtres}>
        {STATUTS.map((s) => (
          <button
            key={s.valeur}
            className={`${styles.filtreBouton} ${statut === s.valeur ? styles.filtreActif : ""}`}
            onClick={() => setStatut(s.valeur)}>
            {s.label}
          </button>
        ))}
      </div>

      {chargement && <Spinner />}

      {erreur && (
        <MessageErreur
          message={erreur}
          onReessayer={() => {
            setErreur(null);
            setChargement(true);
          }}
        />
      )}

      {!chargement && !erreur && evenementsFiltres.length === 0 && (
        <p className={styles.vide}>Aucun événement trouvé.</p>
      )}

      {!chargement && !erreur && evenementsFiltres.length > 0 && (
        <div className={styles.grille}>
          {evenementsFiltres.map((evenement) => (
            <CarteEvenement key={evenement._id} evenement={evenement} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsPage;

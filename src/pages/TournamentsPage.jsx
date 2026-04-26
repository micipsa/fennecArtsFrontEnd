import { useState, useEffect } from "react";
import api from "../services/api";
import CarteTournoi from "../components/Cards/CarteTournoi";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./TournamentsPage.module.css";

const STATUTS = [
  { valeur: "tous", label: "Tous" },
  { valeur: "ouvert", label: "Ouverts" },
  { valeur: "complet", label: "Complets" },
  { valeur: "terminé", label: "Terminés" },
];

function TournamentsPage() {
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [statut, setStatut] = useState("tous");

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const res = await api.get("/api/tournaments");
        setTournois(res.data.data);
      } catch (err) {
        setErreur("Impossible de charger les tournois.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const tournoisFiltres =
    statut === "tous" ? tournois : tournois.filter((t) => t.statut === statut);

  return (
    <div className="container">
      <div className={styles.entete}>
        <div className={styles.enteteTexte}>
          <h1 className={styles.titre}>🏆 Tournois</h1>
          <p className={styles.sousTitre}>
            Inscrivez-vous aux tournois gaming et esport
          </p>
        </div>
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
          onReessayer={() => window.location.reload()}
        />
      )}

      {!chargement && !erreur && tournoisFiltres.length === 0 && (
        <p className={styles.vide}>Aucun tournoi trouvé.</p>
      )}

      {!chargement && !erreur && tournoisFiltres.length > 0 && (
        <div className={styles.grille}>
          {tournoisFiltres.map((tournoi) => (
            <CarteTournoi key={tournoi._id} tournoi={tournoi} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentsPage;

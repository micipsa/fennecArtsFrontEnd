/**
 * TournamentsPage — page listant tous les tournois avec filtre par statut.
 *
 * Fonctionnalités :
 * - Chargement de tous les tournois au montage
 * - Filtrage côté client par statut : "Tous", "Ouverts", "Complets", "Terminés"
 * - Gestion des états : chargement, erreur, liste vide
 *
 * Le filtrage est simple (pas de useMemo) car il s'agit d'une comparaison
 * directe entre le statut du tournoi et le filtre sélectionné.
 */
import { useState, useEffect } from "react";
import api from "../services/api";
import CarteTournoi from "../components/Cards/CarteTournoi";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./TournamentsPage.module.css";

// Options de filtrage par statut de tournoi
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
  const [statut, setStatut] = useState("tous"); // Filtre actif

  // ── Chargement de tous les tournois au montage ──
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

  // Filtrage côté client : si "tous" → tous les tournois, sinon on filtre par statut
  const tournoisFiltres =
    statut === "tous" ? tournois : tournois.filter((t) => t.statut === statut);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>ARENA</h1>
        <p className={styles.pageSousTitre}>Tournament Hub</p>
      </div>

      <div className={styles.contenu}>
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
    </div>
  );
}

export default TournamentsPage;

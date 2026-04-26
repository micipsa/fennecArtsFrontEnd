/**
 * EventsPage — page listant tous les événements avec filtre par statut.
 *
 * Fonctionnalités :
 * - Filtrage côté client par statut : "Tous", "À venir", "Passés"
 *   - Le filtre utilise useMemo() pour ne recalculer la liste filtrée
 *     QUE quand les événements ou le filtre changent (optimisation performance).
 * - Chargement unique de tous les événements au montage.
 * - Gestion des états : chargement, erreur, liste vide.
 *
 * Différence avec ArticlesPage :
 * - Pas de pagination (tous les événements sont chargés d'un coup).
 * - Le filtrage est côté client (pas de requête API à chaque changement de filtre).
 */
import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import CarteEvenement from "../components/Cards/CarteEvenement";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./EventsPage.module.css";

// Options de filtrage par statut temporel
const STATUTS = [
  { valeur: "tous", label: "Tous" },
  { valeur: "avenir", label: "À venir" },
  { valeur: "passes", label: "Passés" },
];

function EventsPage() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [statut, setStatut] = useState("tous"); // Filtre actif

  // ── Chargement de tous les événements au montage ──
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

  /**
   * Liste filtrée des événements — calculée via useMemo.
   * useMemo mémorise le résultat et ne recalcule que si `evenements` ou `statut` changent.
   * Cela évite un refiltering inutile à chaque re-render.
   */
  const evenementsFiltres = useMemo(() => {
    const maintenant = new Date();
    return evenements.filter((ev) => {
      if (statut === "avenir") return new Date(ev.dateDebut) > maintenant;
      if (statut === "passes") return new Date(ev.dateDebut) <= maintenant;
      return true; // "tous" → pas de filtre
    });
  }, [evenements, statut]);

  return (
    <div className="container">
      {/* ── En-tête ── */}
      <div className={styles.entete}>
        <h1 className={styles.titre}>Événements</h1>
        <p className={styles.sousTitre}>
          Concerts, expositions, ateliers et bien plus
        </p>
      </div>

      {/* ── Boutons de filtre par statut ── */}
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

      {/* ── États conditionnels ── */}
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

      {/* ── Grille des événements filtrés ── */}
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

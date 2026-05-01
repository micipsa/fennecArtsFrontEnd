import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./AgendaPage.module.css";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

function memeJour(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function cellulesDuMois(annee, mois) {
  const premier = new Date(annee, mois, 1);
  const dernier = new Date(annee, mois + 1, 0);
  // lundi = 0 … dimanche = 6
  const offset = (premier.getDay() + 6) % 7;
  const cellules = [];
  for (let i = 0; i < offset; i++) cellules.push(null);
  for (let j = 1; j <= dernier.getDate(); j++)
    cellules.push(new Date(annee, mois, j));
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}

function AgendaPage() {
  const [events, setEvents] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const aujourd = new Date();
  const [moisCourant, setMoisCourant] = useState(
    new Date(aujourd.getFullYear(), aujourd.getMonth(), 1)
  );
  const [jourSelectionne, setJourSelectionne] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        setChargement(true);
        const [resE, resT] = await Promise.all([
          api.get("/api/events?limit=200"),
          api.get("/api/tournaments?limit=200"),
        ]);
        setEvents(resE.data.data || []);
        setTournois(resT.data.data || []);
      } catch {
        setErreur("Impossible de charger l'agenda.");
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const annee = moisCourant.getFullYear();
  const mois = moisCourant.getMonth();
  const cellules = useMemo(() => cellulesDuMois(annee, mois), [annee, mois]);

  const eventsParJour = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const d = new Date(ev.dateDebut);
      const cle = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[cle]) map[cle] = [];
      map[cle].push({ ...ev, _type: "event" });
    });
    return map;
  }, [events]);

  const tournoisParJour = useMemo(() => {
    const map = {};
    tournois.forEach((t) => {
      const d = new Date(t.dateDebut || t.date);
      if (isNaN(d)) return;
      const cle = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[cle]) map[cle] = [];
      map[cle].push({ ...t, _type: "tournoi" });
    });
    return map;
  }, [tournois]);

  const cleJour = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const itemsDuJour = useMemo(() => {
    if (!jourSelectionne) return [];
    const cle = cleJour(jourSelectionne);
    return [
      ...(eventsParJour[cle] || []),
      ...(tournoisParJour[cle] || []),
    ];
  }, [jourSelectionne, eventsParJour, tournoisParJour]);

  const moisPrecedent = () =>
    setMoisCourant(new Date(annee, mois - 1, 1));
  const moisSuivant = () =>
    setMoisCourant(new Date(annee, mois + 1, 1));

  if (chargement) return <Spinner />;
  if (erreur) return <MessageErreur message={erreur} />;

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.titre}>Agenda</h1>

        <div className={styles.legende}>
          <span className={styles.legendeItem}>
            <span className={styles.dotEvent} /> Événements
          </span>
          <span className={styles.legendeItem}>
            <span className={styles.dotTournoi} /> Tournois
          </span>
        </div>

        {/* Navigation mois */}
        <div className={styles.navigation}>
          <button className={styles.btnNav} onClick={moisPrecedent}>‹</button>
          <span className={styles.moisLabel}>
            {MOIS_FR[mois]} {annee}
          </span>
          <button className={styles.btnNav} onClick={moisSuivant}>›</button>
        </div>

        {/* Grille calendrier */}
        <div className={styles.grille}>
          {JOURS.map((j) => (
            <div key={j} className={styles.enteteJour}>{j}</div>
          ))}

          {cellules.map((date, i) => {
            if (!date) return <div key={`vide-${i}`} className={styles.celluleVide} />;

            const cle = cleJour(date);
            const aEvents = !!(eventsParJour[cle]?.length);
            const aTournois = !!(tournoisParJour[cle]?.length);
            const estAujourd = memeJour(date, aujourd);
            const estSelectionne = jourSelectionne && memeJour(date, jourSelectionne);

            return (
              <button
                key={cle}
                className={[
                  styles.cellule,
                  estAujourd ? styles.aujourd : "",
                  estSelectionne ? styles.selectionne : "",
                ].join(" ")}
                onClick={() =>
                  setJourSelectionne(
                    estSelectionne ? null : date
                  )
                }>
                <span className={styles.numJour}>{date.getDate()}</span>
                <span className={styles.dots}>
                  {aEvents && <span className={styles.dotEvent} />}
                  {aTournois && <span className={styles.dotTournoi} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Liste du jour sélectionné */}
        {jourSelectionne && (
          <div className={styles.panneauJour}>
            <h2 className={styles.panneauTitre}>
              {jourSelectionne.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>

            {itemsDuJour.length === 0 ? (
              <p className={styles.vide}>Aucun événement ce jour.</p>
            ) : (
              <ul className={styles.listeItems}>
                {itemsDuJour.map((item) => (
                  <li key={item._id} className={styles.item}>
                    <span
                      className={styles.itemBadge}
                      data-type={item._type}>
                      {item._type === "event" ? "Événement" : "Tournoi"}
                    </span>
                    <Link
                      className={styles.itemLien}
                      to={
                        item._type === "event"
                          ? `/events/${item._id}`
                          : `/tournaments/${item._id}`
                      }>
                      {item.titre || item.nom}
                    </Link>
                    {item.lieu && (
                      <span className={styles.itemLieu}>— {item.lieu}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgendaPage;

import CarteEvenement from "../components/Cards/CarteEvenement";
import styles from "./EventsPage.module.css";

const EVENEMENTS_FICTIFS = [
  {
    _id: "1",
    titre: "Exposition nationale de calligraphie",
    description:
      "Une exposition réunissant les plus grands calligraphes algériens contemporains autour de l'art de l'écriture arabe et amazighe.",
    categorie: "Exposition",
    lieu: "Musée des Beaux-Arts, Alger",
    dateDebut: "2025-07-15T09:00:00.000Z",
    dateFin: "2025-07-20T18:00:00.000Z",
    organisateur: { nom: "Société des Arts" },
    adherents: ["id1", "id2", "id3"],
  },
  {
    _id: "2",
    titre: "Concert de musique andalouse",
    description:
      "Une soirée exceptionnelle dédiée à la musique andalouse algérienne, patrimoine immatériel de l'humanité reconnu par l'UNESCO.",
    categorie: "Concert",
    lieu: "Salle Ibn Khaldoun, Alger",
    dateDebut: "2025-08-05T20:00:00.000Z",
    dateFin: "2025-08-05T23:00:00.000Z",
    organisateur: { nom: "Office National de la Culture" },
    adherents: ["id1", "id2", "id3", "id4", "id5"],
  },
  {
    _id: "3",
    titre: "Atelier de poterie traditionnelle",
    description:
      "Venez apprendre les techniques ancestrales de la poterie kabyle avec des artisans locaux dans une ambiance chaleureuse et conviviale.",
    categorie: "Atelier",
    lieu: "Maison de la Culture, Tizi Ouzou",
    dateDebut: "2024-03-10T10:00:00.000Z",
    dateFin: "2024-03-10T17:00:00.000Z",
    organisateur: { nom: "Association Izuran" },
    adherents: ["id1"],
  },
];

function EventsPage() {
  return (
    <div className="container">
      <div className={styles.entete}>
        <h1 className={styles.titre}>Événements</h1>
        <p className={styles.sousTitre}>
          Concerts, expositions, ateliers et bien plus
        </p>
      </div>

      <div className={styles.grille}>
        {EVENEMENTS_FICTIFS.map((evenement) => (
          <CarteEvenement key={evenement._id} evenement={evenement} />
        ))}
      </div>
    </div>
  );
}

export default EventsPage;

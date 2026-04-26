import CarteArticle from "../components/Cards/CarteArticle";
import styles from "./ArticlesPage.module.css";

const ARTICLES_FICTIFS = [
  {
    _id: "1",
    titre: "La peinture moderne en Algérie",
    contenu:
      "Le mouvement pictural algérien contemporain puise ses racines dans une tradition ancestrale tout en embrassant les courants internationaux les plus audacieux.",
    categorie: "Peinture",
    auteur: { nom: "Karim Benali" },
    createdAt: "2024-06-10T14:32:00.000Z",
  },
  {
    _id: "2",
    titre: "La musique chaâbi : entre tradition et modernité",
    contenu:
      "Le chaâbi algérien, né dans les ruelles d'Alger, continue de fasciner les nouvelles générations qui lui insufflent des sonorités contemporaines.",
    categorie: "Musique",
    auteur: { nom: "Nadia Amrani" },
    createdAt: "2024-05-22T09:15:00.000Z",
  },
  {
    _id: "3",
    titre: "Le théâtre algérien à l'ère du numérique",
    contenu:
      "Depuis la pandémie, les troupes théâtrales algériennes ont investi les plateformes numériques pour toucher un public plus large et rajeunir leur audience.",
    categorie: "Théâtre",
    auteur: { nom: "Sofiane Merad" },
    createdAt: "2024-04-03T18:00:00.000Z",
  },
];

function ArticlesPage() {
  return (
    <div className="container">
      <div className={styles.entete}>
        <h1 className={styles.titre}>Articles</h1>
        <p className={styles.sousTitre}>
          Explorez nos publications culturelles
        </p>
      </div>

      <div className={styles.grille}>
        {ARTICLES_FICTIFS.map((article) => (
          <CarteArticle key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}

export default ArticlesPage;

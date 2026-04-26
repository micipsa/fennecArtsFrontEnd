import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./ArticleDetailPage.module.css";

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const chargerArticle = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const res = await api.get(`/api/articles/${id}`);
        setArticle(res.data.data);
      } catch (err) {
        setErreur(err.response?.data?.message || "Article introuvable.");
      } finally {
        setChargement(false);
      }
    };

    chargerArticle();
  }, [id]);

  if (chargement) return <Spinner />;

  if (erreur)
    return (
      <div className="container">
        <MessageErreur message={erreur} />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/articles" className="btn btn-outline">
            Retour aux articles
          </Link>
        </div>
      </div>
    );

  if (!article) return null;

  const dateFormatee = new Date(article.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container">
      <div className={styles.page}>
        <Link to="/articles" className={styles.retour}>
          ← Retour aux articles
        </Link>

        <div className={styles.entete}>
          <div className={styles.meta}>
            <Badge texte={article.categorie} variante="primaire" />
            <span className={styles.date}>{dateFormatee}</span>
          </div>
          <h1 className={styles.titre}>{article.titre}</h1>
          <p className={styles.auteur}>
            Par <strong>{article.auteur?.nom ?? "Auteur inconnu"}</strong>
          </p>
        </div>

        <div className={styles.contenu}>
          {article.contenu
            .split("\n")
            .map(
              (paragraphe, index) =>
                paragraphe.trim() && <p key={index}>{paragraphe}</p>,
            )}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetailPage;

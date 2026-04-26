import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./EvenementDetailPage.module.css";

function EvenementDetailPage() {
  const { id } = useParams();
  const [evenement, setEvenement] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const chargerEvenement = async () => {
      try {
        setChargement(true);
        setErreur(null);
        const res = await api.get(`/api/events/${id}`);
        setEvenement(res.data.data);
      } catch (err) {
        setErreur(err.response?.data?.message || "Événement introuvable.");
      } finally {
        setChargement(false);
      }
    };

    chargerEvenement();
  }, [id]);

  if (chargement) return <Spinner />;

  if (erreur)
    return (
      <div className="container">
        <MessageErreur message={erreur} />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/events" className="btn btn-outline">
            Retour aux événements
          </Link>
        </div>
      </div>
    );

  if (!evenement) return null;

  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const estFutur = new Date(evenement.dateDebut) > new Date();

  return (
    <div className="container">
      <div className={styles.page}>
        <Link to="/events" className={styles.retour}>
          ← Retour aux événements
        </Link>

        <div className={styles.entete}>
          <div className={styles.meta}>
            <Badge texte={evenement.categorie} variante="primaire" />
            <Badge
              texte={estFutur ? "À venir" : "Passé"}
              variante={estFutur ? "succes" : "defaut"}
            />
          </div>

          <h1 className={styles.titre}>{evenement.titre}</h1>

          <div className={styles.infos}>
            <div className={styles.infoLigne}>
              <span>📍</span>
              <span>{evenement.lieu}</span>
            </div>
            <div className={styles.infoLigne}>
              <span>📅</span>
              <span>
                Du {formatDate(evenement.dateDebut)} au{" "}
                {formatDate(evenement.dateFin)}
              </span>
            </div>
            <div className={styles.infoLigne}>
              <span>👥</span>
              <span>{evenement.adherents?.length ?? 0} participant(s)</span>
            </div>
            {evenement.organisateur && (
              <div className={styles.infoLigne}>
                <span>🎭</span>
                <span>
                  Organisé par <strong>{evenement.organisateur.nom}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contenu}>
          {evenement.description
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

export default EvenementDetailPage;

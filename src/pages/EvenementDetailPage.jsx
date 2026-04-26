/**
 * EvenementDetailPage — page de détail d'un événement individuel.
 *
 * Affiche les informations complètes d'un événement :
 * - Catégorie + statut (à venir / passé) via des Badges
 * - Titre de l'événement
 * - Cartes d'information : lieu, participants, date de début, date de fin, organisateur
 * - Description complète (découpée en paragraphes)
 *
 * L'identifiant est récupéré depuis l'URL via useParams().
 * Les dates sont formatées en français avec l'heure incluse.
 */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Badge from "../components/UI/Badge";
import Spinner from "../components/UI/Spinner";
import MessageErreur from "../components/UI/MessageErreur";
import styles from "./EvenementDetailPage.module.css";

function EvenementDetailPage() {
  // Récupération de l'id depuis l'URL (ex: /events/abc123)
  const { id } = useParams();

  const [evenement, setEvenement] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // ── Chargement de l'événement au montage ──
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

  // Spinner pendant le chargement
  if (chargement) return <Spinner />;

  // Affichage d'erreur avec lien de retour
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

  /**
   * Fonction utilitaire pour formater une date ISO en français,
   * avec l'heure incluse (ex: "15 avril 2026 à 14:30").
   */
  const formatDate = (dateISO) =>
    new Date(dateISO).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Détermination du statut : à venir ou passé
  const estFutur = new Date(evenement.dateDebut) > new Date();

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Lien de retour */}
        <Link to="/events" className={styles.retour}>
          ← Retour aux événements
        </Link>

        {/* ── En-tête de l'événement ── */}
        <div className={styles.entete}>
          {/* Badges : catégorie + statut */}
          <div className={styles.meta}>
            <Badge texte={evenement.categorie} variante="primaire" />
            <Badge
              texte={estFutur ? "À venir" : "Passé"}
              variante={estFutur ? "succes" : "defaut"}
            />
          </div>

          <h1 className={styles.titre}>{evenement.titre}</h1>

          {/* ── Cartes d'informations pratiques ── */}
          <div className={styles.infos}>
            {/* Lieu */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📍</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Lieu</span>
                <span className={styles.infoValeur}>{evenement.lieu}</span>
              </div>
            </div>

            {/* Nombre de participants */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>👥</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Participants</span>
                <span className={styles.infoValeur}>
                  {evenement.adherents?.length ?? 0} inscrit(s)
                </span>
              </div>
            </div>

            {/* Date de début */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>📅</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Début</span>
                <span className={styles.infoValeur}>
                  {formatDate(evenement.dateDebut)}
                </span>
              </div>
            </div>

            {/* Date de fin */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcone}>🏁</span>
              <div className={styles.infoTexte}>
                <span className={styles.infoLabel}>Fin</span>
                <span className={styles.infoValeur}>
                  {formatDate(evenement.dateFin)}
                </span>
              </div>
            </div>

            {/* Organisateur (affiché seulement si présent) */}
            {evenement.organisateur && (
              <div className={styles.infoCard}>
                <span className={styles.infoIcone}>🎭</span>
                <div className={styles.infoTexte}>
                  <span className={styles.infoLabel}>Organisateur</span>
                  <span className={styles.infoValeur}>
                    {evenement.organisateur.nom}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.separateur} />

        {/* ── Description complète ── */}
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

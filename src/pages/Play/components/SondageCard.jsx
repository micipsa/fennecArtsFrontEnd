import { useState } from "react";
import api from "../../../services/api";
import styles from "./SondageCard.module.css";
import { toast } from "react-hot-toast";

export default function SondageCard({ sondage, onFinish }) {
  const [loading, setLoading] = useState(false);

  const voter = async (option) => {
    setLoading(true);
    try {
      await api.post(`/api/animations/${sondage._id}/participer`, {
        reponses: { choix: option }
      });
      toast.success("Vote pris en compte ! Merci pour ton avis.");
      onFinish();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sondage}>
      <h2 className={styles.question}>{sondage.config.question}</h2>
      <div className={styles.options}>
        {(sondage.config.options || []).map((opt, i) => (
          <button 
            key={i} 
            className={styles.optionBtn}
            onClick={() => voter(opt)}
            disabled={loading}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

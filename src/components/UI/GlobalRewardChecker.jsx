import { useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { useXPPopup } from "./XPPopup";
import toast from "react-hot-toast";

export default function GlobalRewardChecker() {
  const { utilisateur } = useAuth();
  const { showXP, XPPopupContainer } = useXPPopup();

  useEffect(() => {
    if (utilisateur) {
      // Check for daily reward
      api.post("/api/users/recompense-quotidienne")
        .then((res) => {
          const data = res.data.data;
          if (data) {
            // Un gain a été reçu
            setTimeout(() => {
              showXP(data.xpGagne, data.fmGagne);
              toast.success(`Bonus quotidien ! Streak : ${data.streak} 🔥`);
            }, 1000); // Petit délai pour laisser la page charger
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la vérification de la récompense quotidienne", err);
        });
    }
  }, [utilisateur, showXP]);

  return <XPPopupContainer />;
}

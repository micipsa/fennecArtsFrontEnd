import { useState, useCallback } from "react";
import styles from "./XPPopup.module.css";

let popupId = 0;

export function useXPPopup() {
  const [popups, setPopups] = useState([]);

  const showXP = useCallback((xp, fm = 0) => {
    const id = ++popupId;
    setPopups(prev => [...prev, { id, xp, fm }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 2200);
  }, []);

  const XPPopupContainer = () => (
    <div className={styles.container}>
      {popups.map(p => (
        <div key={p.id} className={styles.popup}>
          {p.xp > 0 && <span className={styles.xp}>+{p.xp} XP ⚡</span>}
          {p.fm > 0 && <span className={styles.fm}>+{p.fm} FM 💰</span>}
        </div>
      ))}
    </div>
  );

  return { showXP, XPPopupContainer };
}

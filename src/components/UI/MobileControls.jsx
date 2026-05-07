import { useEffect, useState } from "react";
import styles from "./MobileControls.module.css";

export default function MobileControls() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleKey = (keys, isDown) => {
    // Prevent default touch behaviors like scrolling
    keys.forEach(key => {
      const event = new KeyboardEvent(isDown ? "keydown" : "keyup", {
        key: key,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
  };

  return (
    <div className={styles.controlsWrapper}>
      <div className={styles.dpad}>
        <button
          className={`${styles.dpadBtn} ${styles.up}`}
          onPointerDown={(e) => { e.preventDefault(); handleKey(["ArrowUp", "w"], true); }}
          onPointerUp={(e) => { e.preventDefault(); handleKey(["ArrowUp", "w"], false); }}
          onPointerLeave={() => handleKey(["ArrowUp", "w"], false)}
        >
          ▲
        </button>
        <button
          className={`${styles.dpadBtn} ${styles.left}`}
          onPointerDown={(e) => { e.preventDefault(); handleKey(["ArrowLeft", "a"], true); }}
          onPointerUp={(e) => { e.preventDefault(); handleKey(["ArrowLeft", "a"], false); }}
          onPointerLeave={() => handleKey(["ArrowLeft", "a"], false)}
        >
          ◀
        </button>
        <button
          className={`${styles.dpadBtn} ${styles.right}`}
          onPointerDown={(e) => { e.preventDefault(); handleKey(["ArrowRight", "d"], true); }}
          onPointerUp={(e) => { e.preventDefault(); handleKey(["ArrowRight", "d"], false); }}
          onPointerLeave={() => handleKey(["ArrowRight", "d"], false)}
        >
          ▶
        </button>
        <button
          className={`${styles.dpadBtn} ${styles.down}`}
          onPointerDown={(e) => { e.preventDefault(); handleKey(["ArrowDown", "s"], true); }}
          onPointerUp={(e) => { e.preventDefault(); handleKey(["ArrowDown", "s"], false); }}
          onPointerLeave={() => handleKey(["ArrowDown", "s"], false)}
        >
          ▼
        </button>
      </div>
    </div>
  );
}

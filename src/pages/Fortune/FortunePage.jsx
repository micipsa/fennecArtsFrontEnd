/**
 * FortunePage — Page du Ticket à Gratter (remplace la Roue).
 * Un ticket gratuit quotidien.
 */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../components/UI/Toast";
import styles from "./FortunePage.module.css";

export default function FortunePage() {
  const { utilisateur } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [disponible, setDisponible] = useState(true);
  const [resultat, setResultat] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [ticketState, setTicketState] = useState("initial"); // initial, scratching, revealed
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      api.get("/api/fortune/status")
        .then(res => setDisponible(res.data.data.disponible))
        .catch(() => {});
    }
  }, [utilisateur]);

  const handleGetTicket = async () => {
    if (!disponible || ticketState !== "initial") return;

    try {
      // On conserve l'API "/api/fortune/spin"
      const res = await api.post("/api/fortune/spin");
      setResultat(res.data.data.recompense);
      setTicketState("scratching");
      setDisponible(false);
      
      // Initialize Canvas after render
      setTimeout(initCanvas, 100);
    } catch (err) {
      addToast(err.response?.data?.message || "Erreur lors de l'obtention du ticket", "error");
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Fill with silver gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#8e9eab");
    gradient.addColorStop(0.5, "#eef2f3");
    gradient.addColorStop(1, "#8e9eab");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add pattern or text
    ctx.font = "bold 22px var(--font-manga)";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GRATTEZ ICI", width / 2, height / 2);
  };

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculer les coordonnées relatives au canvas (en tenant compte de son redimensionnement CSS)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startScratch = (e) => {
    if (ticketState !== "scratching") return;
    setIsDrawing(true);
    handleScratch(e);
  };

  const stopScratch = () => {
    setIsDrawing(false);
    checkReveal();
  };

  const scratchMove = (e) => {
    if (!isDrawing || ticketState !== "scratching") return;
    handleScratch(e);
  };

  const handleScratch = (e) => {
    // Prevent default scrolling on touch
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const pos = getPointerPos(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI); // Radius 25
    ctx.fill();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    // On vérifie le canal alpha
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
    }
    
    const percent = transparent / (canvas.width * canvas.height);
    if (percent > 0.5) {
      setTicketState("revealed");
      setShowResult(true);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageEntete}>
        <h1 className={styles.pageTitre}>TICKET À GRATTER</h1>
        <p className={styles.pageSousTitre}>Gagne des récompenses gratuitement, 1 fois par jour !</p>
      </div>

      <div className={styles.container}>
        <div className={styles.wheelSection}>
          
          {ticketState === "initial" && (
            <div className={styles.ticketInitial}>
              <div className={styles.ticketVisual}>🎫</div>
              <button
                className={`${styles.btnSpin} ${!disponible ? styles.btnDisabled : ""}`}
                onClick={handleGetTicket}
                disabled={!disponible || !utilisateur}
              >
                {!utilisateur ? "Connecte-toi pour jouer" :
                 !disponible ? "Reviens demain ! ⏰" :
                 "OBTENIR MON TICKET"}
              </button>
            </div>
          )}

          {ticketState !== "initial" && resultat && (
            <div className={styles.scratchContainer}>
              <div className={styles.scratchResult} style={{ color: resultat.couleur || "#fff" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{resultat.icone}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{resultat.label}</div>
              </div>
              
              {ticketState === "scratching" && (
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  className={styles.scratchCanvas}
                  onMouseDown={startScratch}
                  onMouseUp={stopScratch}
                  onMouseLeave={stopScratch}
                  onMouseMove={scratchMove}
                  onTouchStart={startScratch}
                  onTouchEnd={stopScratch}
                  onTouchCancel={stopScratch}
                  onTouchMove={scratchMove}
                />
              )}
            </div>
          )}

          {/* Bouton retour */}
          <button className={styles.btnBack} onClick={() => navigate("/store")} style={{ marginTop: "2rem" }}>
            ← Retour à la boutique
          </button>
        </div>

        {/* Résultat (Modale) */}
        {showResult && resultat && createPortal(
          <div className={styles.resultOverlay} onClick={() => setShowResult(false)}>
            <div className={styles.resultCard} onClick={e => e.stopPropagation()}>
              <div className={styles.resultIcone}>{resultat.icone}</div>
              <h2 className={styles.resultTitre}>Félicitations !</h2>
              <div className={styles.resultRecompense} style={{ color: resultat.couleur }}>
                {resultat.label}
              </div>
              <p className={styles.resultDesc}>
                {resultat.type === "xp" && "De l'expérience pour progresser !"}
                {resultat.type === "fm" && "Des Fennec Money en plus !"}
                {resultat.type === "cosmetic" && "Un objet cosmétique rare ! 🎉"}
              </p>
              <button className={styles.resultBtn} onClick={() => setShowResult(false)}>
                Super ! 🎮
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

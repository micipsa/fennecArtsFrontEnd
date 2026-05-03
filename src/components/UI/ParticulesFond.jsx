import { useEffect, useRef } from "react";

export default function ParticulesFond({ couleur = "#ffffff", densite = 50, vitesse = 0.5, taille = 2 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    const particules = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < densite; i++) {
      particules.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * vitesse,
        vy: (Math.random() - 0.5) * vitesse,
        r: Math.random() * taille + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const animer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particules.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = couleur + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      animationId = requestAnimationFrame(animer);
    };
    animer();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [couleur, densite, vitesse, taille]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

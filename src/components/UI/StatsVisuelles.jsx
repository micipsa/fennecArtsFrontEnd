/**
 * StatsVisuelles — Composant de statistiques visuelles pour le profil.
 * 
 * Inclut :
 * - Compteurs animés (XP, FM, Tournois, Badges, Streak)
 * - Graphique radar SVG (stats gaming)
 * - Heatmap d'activité (style GitHub contributions)
 */
import { useState, useEffect, useRef } from "react";
import styles from "./StatsVisuelles.module.css";

// ── Hook : compteur animé ──
function useAnimatedCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

// ── Compteur individuel ──
function AnimatedStat({ icon, value, label, color, suffix = "" }) {
  const [count, ref] = useAnimatedCounter(value);
  return (
    <div ref={ref} className={styles.statCard} style={{ "--stat-color": color }}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>
        {count.toLocaleString("fr-FR")}{suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ── Graphique Radar SVG ──
function RadarChart({ data }) {
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const axes = data.length;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / axes - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={styles.radarSvg}>
      {/* Lignes de grille */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={data
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
              const r = level * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
        return (
          <g key={i}>
            <line
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={center + (radius + 18) * Math.cos(angle)}
              y={center + (radius + 18) * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="8"
              fontWeight="600"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Zone de données */}
      <polygon
        points={data.map((d, i) => {
          const p = getPoint(i, d.value);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="rgba(255,100,0,0.15)"
        stroke="#ff6400"
        strokeWidth="2"
        className={styles.radarArea}
      />

      {/* Points */}
      {data.map((d, i) => {
        const p = getPoint(i, d.value);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#ff6400"
            stroke="#fff"
            strokeWidth="1.5"
            className={styles.radarDot}
          />
        );
      })}
    </svg>
  );
}

// ── Heatmap d'activité ──
function ActivityHeatmap({ historique }) {
  // Générer les 90 derniers jours
  const jours = [];
  const maintenant = new Date();
  const compteurParJour = {};

  // Compter les entrées par jour
  (historique || []).forEach((h) => {
    const d = new Date(h.createdAt).toISOString().split("T")[0];
    compteurParJour[d] = (compteurParJour[d] || 0) + 1;
  });

  for (let i = 89; i >= 0; i--) {
    const date = new Date(maintenant);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    jours.push({
      date: key,
      count: compteurParJour[key] || 0,
      jourSemaine: date.getDay(),
      jour: date.getDate(),
    });
  }

  const maxCount = Math.max(...jours.map((j) => j.count), 1);

  const getColor = (count) => {
    if (count === 0) return "rgba(255,255,255,0.04)";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "rgba(255,100,0,0.2)";
    if (intensity < 0.5)  return "rgba(255,100,0,0.4)";
    if (intensity < 0.75) return "rgba(255,100,0,0.6)";
    return "rgba(255,100,0,0.9)";
  };

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.heatmapGrid}>
        {jours.map((j) => (
          <div
            key={j.date}
            className={styles.heatmapCell}
            style={{ backgroundColor: getColor(j.count) }}
            title={`${j.date}: ${j.count} activité${j.count > 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className={styles.heatmapLegend}>
        <span>Moins</span>
        <div className={styles.heatmapLegendCells}>
          {[0, 0.2, 0.4, 0.6, 0.9].map((opacity, i) => (
            <div
              key={i}
              className={styles.heatmapCell}
              style={{ backgroundColor: opacity === 0 ? "rgba(255,255,255,0.04)" : `rgba(255,100,0,${opacity})` }}
            />
          ))}
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}

// ── Composant principal ──
export default function StatsVisuelles({ profil, historique }) {
  const points = profil?.points || 0;
  const fm = profil?.fm || 0;
  const tournois = profil?.participationsTournois?.length || 0;
  const badges = profil?.badges?.length || 0;
  const streak = profil?.streakConnexion || 0;
  const missionsCompletes = (historique || []).filter(h => h.type === "mission").length;

  // Données pour le radar (normalisées sur 100)
  const maxXP = 5000;
  const radarData = [
    { label: "XP", value: Math.min((points / maxXP) * 100, 100) },
    { label: "FM", value: Math.min((fm / 2000) * 100, 100) },
    { label: "Tournois", value: Math.min((tournois / 20) * 100, 100) },
    { label: "Badges", value: Math.min((badges / 15) * 100, 100) },
    { label: "Streak", value: Math.min((streak / 30) * 100, 100) },
    { label: "Missions", value: Math.min((missionsCompletes / 30) * 100, 100) },
  ];

  return (
    <div className={styles.container}>
      {/* ── Compteurs animés ── */}
      <div className={styles.statsRow}>
        <AnimatedStat icon="⚡" value={points} label="XP Total" color="#ffa500" />
        <AnimatedStat icon="💰" value={fm} label="Fennec Money" color="#ffd700" />
        <AnimatedStat icon="⚔️" value={tournois} label="Tournois" color="#e74c3c" />
        <AnimatedStat icon="🏅" value={badges} label="Badges" color="#9b59b6" />
        <AnimatedStat icon="🔥" value={streak} label="Streak" color="#ff4500" suffix="j" />
      </div>

      {/* ── Radar & Heatmap ── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Profil de compétences</h3>
          <RadarChart data={radarData} />
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Activité (90 derniers jours)</h3>
          <ActivityHeatmap historique={historique} />
        </div>
      </div>
    </div>
  );
}

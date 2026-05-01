export const RANGS = [
  { nom: "Fer",          division: true,  min: 0,    max: 99   },
  { nom: "Bronze",       division: true,  min: 100,  max: 299  },
  { nom: "Argent",       division: true,  min: 300,  max: 599  },
  { nom: "Or",           division: true,  min: 600,  max: 999  },
  { nom: "Platine",      division: true,  min: 1000, max: 1499 },
  { nom: "Émeraude",     division: true,  min: 1500, max: 1999 },
  { nom: "Diamant",      division: true,  min: 2000, max: 2999 },
  { nom: "Maître",       division: false, min: 3000, max: 3999 },
  { nom: "Grand Maître", division: false, min: 4000, max: 4999 },
  { nom: "Challenger",   division: false, min: 5000, max: Infinity },
];

export const DIVISIONS = ["IV", "III", "II", "I"];

export const COULEURS_RANG = {
  "Fer":           "#8c8c8c",
  "Bronze":        "#cd7f32",
  "Argent":        "#c0c0c0",
  "Or":            "#ffd700",
  "Platine":       "#4fc3a1",
  "Émeraude":      "#50c878",
  "Diamant":       "#a8d8f0",
  "Maître":        "#9b59b6",
  "Grand Maître":  "#e74c3c",
  "Challenger":    "#f4a261",
};

export const calculerRang = (points) => {
  const rang = RANGS.find((r) => points >= r.min && points <= r.max) || RANGS[0];
  let division = "";
  if (rang.division) {
    const tranche = rang.max - rang.min + 1;
    const parDivision = Math.floor(tranche / 4);
    const index = Math.min(Math.floor((points - rang.min) / parDivision), 3);
    division = DIVISIONS[index];
  }
  const min = rang.min;
  const max = rang.max === Infinity ? points + 1 : rang.max;
  const progression = Math.round(((points - min) / (max - min)) * 100);
  return {
    nom: rang.nom,
    division,
    couleur: COULEURS_RANG[rang.nom],
    progression: Math.min(progression, 100),
    pointsSuivant: rang.max === Infinity ? null : rang.max + 1 - points,
    affichage: rang.division ? `${rang.nom} ${division}` : rang.nom,
  };
};

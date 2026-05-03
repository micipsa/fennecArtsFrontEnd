export const THEMES_PROFIL = {
  fer: {
    nom: "Forge",
    description: "Métal brut, étincelles, marteau",
    couleurPrimaire: "#8c8c8c",
    couleurSecondaire: "#5a5a5a",
    couleurAccent: "#d4a574",
    fond: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
    texture: "metal",
    police: "var(--font-tech)",
    icone: "⚒️",
  },
  bronze: {
    nom: "Antique",
    description: "Bronze patiné, parchemin",
    couleurPrimaire: "#cd7f32",
    couleurSecondaire: "#8b5a2b",
    couleurAccent: "#daa520",
    fond: "linear-gradient(135deg, #2a1f15 0%, #1a1410 100%)",
    texture: "parchemin",
    police: "var(--font-medieval)",
    icone: "🏺",
  },
  argent: {
    nom: "Lunar",
    description: "Argent, lune, cristaux",
    couleurPrimaire: "#c0c0c0",
    couleurSecondaire: "#9a9a9a",
    couleurAccent: "#e8e8ff",
    fond: "linear-gradient(135deg, #0f0f1f 0%, #1a1a2e 100%)",
    texture: "lunaire",
    police: "var(--font-elegant)",
    icone: "🌙",
  },
  or: {
    nom: "Royal",
    description: "Or pur, couronne, lumière dorée",
    couleurPrimaire: "#ffd700",
    couleurSecondaire: "#daa520",
    couleurAccent: "#fff8dc",
    fond: "linear-gradient(135deg, #1a1410 0%, #2a200a 100%)",
    texture: "royal",
    police: "var(--font-medieval)",
    icone: "👑",
  },
  platine: {
    nom: "Glacier",
    description: "Bleu glace, aurore boréale",
    couleurPrimaire: "#4fc3a1",
    couleurSecondaire: "#2c8275",
    couleurAccent: "#a8e6e6",
    fond: "linear-gradient(135deg, #051820 0%, #0a2a3a 100%)",
    texture: "glace",
    police: "var(--font-cyber)",
    icone: "❄️",
  },
  emeraude: {
    nom: "Forest",
    description: "Émeraude, forêt mystique",
    couleurPrimaire: "#50c878",
    couleurSecondaire: "#2e7d4f",
    couleurAccent: "#90ee90",
    fond: "linear-gradient(135deg, #0a1f0a 0%, #1a2f1a 100%)",
    texture: "forest",
    police: "var(--font-elegant)",
    icone: "🌿",
  },
  diamant: {
    nom: "Prism",
    description: "Diamant, prismes, reflets",
    couleurPrimaire: "#a8d8f0",
    couleurSecondaire: "#5a9fc0",
    couleurAccent: "#ffffff",
    fond: "linear-gradient(135deg, #0a1228 0%, #1a2840 100%)",
    texture: "prism",
    police: "var(--font-cyber)",
    icone: "💎",
  },
  maitre: {
    nom: "Shadow Master",
    description: "Violet sombre, ombres mystiques",
    couleurPrimaire: "#9b59b6",
    couleurSecondaire: "#6a3d80",
    couleurAccent: "#d8b4f0",
    fond: "linear-gradient(135deg, #0a0518 0%, #1a0a2a 100%)",
    texture: "shadow",
    police: "var(--font-medieval)",
    icone: "🌑",
  },
  grand_maitre: {
    nom: "Phoenix",
    description: "Flammes, plumes ardentes",
    couleurPrimaire: "#e74c3c",
    couleurSecondaire: "#c0392b",
    couleurAccent: "#ff8c00",
    fond: "linear-gradient(135deg, #1a0505 0%, #2a0a0a 100%)",
    texture: "flammes",
    police: "var(--font-manga)",
    icone: "🔥",
  },
  challenger: {
    nom: "Cosmic",
    description: "Galaxie, étoiles filantes",
    couleurPrimaire: "#f4a261",
    couleurSecondaire: "#8a4f00",
    couleurAccent: "#ff6b9d",
    fond: "linear-gradient(135deg, #0a0a18 0%, #1a0a28 50%, #2a0a18 100%)",
    texture: "cosmic",
    police: "var(--font-cyber)",
    icone: "🌌",
  },
};

const RANG_VERS_THEME = {
  "Fer": "fer", "Bronze": "bronze", "Argent": "argent", "Or": "or",
  "Platine": "platine", "Émeraude": "emeraude", "Diamant": "diamant",
  "Maître": "maitre", "Grand Maître": "grand_maitre", "Challenger": "challenger",
};

export const getThemeUtilisateur = (utilisateur) => {
  if (!utilisateur) return THEMES_PROFIL.fer;
  if (utilisateur.themeProfilActif && utilisateur.themeProfilActif !== "auto") {
    return THEMES_PROFIL[utilisateur.themeProfilActif] || THEMES_PROFIL.fer;
  }
  const rangNom = utilisateur.rangCalcule?.nom;
  const themeCode = RANG_VERS_THEME[rangNom] || "fer";
  return THEMES_PROFIL[themeCode];
};

export const getThemesDebloquesPour = (points) => {
  const debloques = [];
  if (points >= 0) debloques.push("fer");
  if (points >= 100) debloques.push("bronze");
  if (points >= 300) debloques.push("argent");
  if (points >= 600) debloques.push("or");
  if (points >= 1000) debloques.push("platine");
  if (points >= 1500) debloques.push("emeraude");
  if (points >= 2000) debloques.push("diamant");
  if (points >= 3000) debloques.push("maitre");
  if (points >= 4000) debloques.push("grand_maitre");
  if (points >= 5000) debloques.push("challenger");
  return debloques;
};

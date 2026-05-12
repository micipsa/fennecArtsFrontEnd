// Dictionnaire Fennec Word
// Contient les mots français et anglais de 5 lettres (sans accents)

export const DICTIONNAIRE_FR = [
  "PIXEL", "MARIO", "ZELDA", "MANGA", "ANIME", "OTAKU", "NINJA", "TITAN",
  "RETRO", "MAGIC", "VADOR", "ROBOT", "MECHA", "ALIEN", "SONIC", "COMIC",
  "CYBER", "CLOUD", "MAGIE", "QUETE", "ARENE", "GEEKS", "NOOBS", "MAGES",
  "ELFES", "ORQUE", "GOULE", "LOOTS", "EPEES", "SABRE", "KAIJU"
];

export const DICTIONNAIRE_EN = [
  "PIXEL", "MARIO", "ZELDA", "MANGA", "ANIME", "OTAKU", "NINJA", "TITAN",
  "RETRO", "MAGIC", "VADER", "ROBOT", "MECHA", "ALIEN", "SONIC", "COMIC",
  "CYBER", "CLOUD", "SPELL", "QUEST", "ARENA", "GEEKS", "NOOBS", "MAGES",
  "ELVES", "DEMON", "GHOUL", "LOOTS", "SWORD", "ROGUE", "KAIJU"
];

// Graine fixe pour le Fennec Word
const EPOCH_DATE = new Date("2026-01-01T00:00:00Z");

export const getDailyWordInfo = (language = "FR") => {
  const dict = language === "FR" ? DICTIONNAIRE_FR : DICTIONNAIRE_EN;
  
  // Date du jour UTC pour que tout le monde ait le même mot
  const now = new Date();
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  // Différence en jours depuis la date d'origine (Edition Number)
  const diffTime = Math.abs(utcNow - EPOCH_DATE);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const editionNumber = diffDays + 1; // "Fennec Word #1" le 1er Janvier 2026

  // PRNG simple basé sur l'index de jour pour sélectionner le mot de façon déterministe
  // On utilise un multiplicateur premier pour s'assurer d'une distribution pseudo-aléatoire
  // Différent pour FR et EN pour ne pas avoir des mots du même index
  const offset = language === "FR" ? 17 : 43;
  const index = (diffDays * 9301 + 49297 + offset) % dict.length;
  
  return {
    mot: dict[index],
    editionNumber: editionNumber
  };
};

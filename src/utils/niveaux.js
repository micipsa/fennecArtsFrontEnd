/**
 * Utilitaire pour le calcul du système de niveaux basé sur l'XP
 */

// Formule : Niveau = Math.floor(Math.sqrt(XP / 100)) + 1
// Lvl 1 : 0 XP
// Lvl 2 : 100 XP
// Lvl 3 : 400 XP
// Lvl 4 : 900 XP
// Lvl 10 : 8100 XP

export function calculerNiveau(xp) {
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpRequisPourNiveau(niveau) {
  if (niveau <= 1) return 0;
  return Math.pow(niveau - 1, 2) * 100;
}

export function calculerProgressionNiveau(xp) {
  const niveauActuel = calculerNiveau(xp);
  const xpBaseNiveau = xpRequisPourNiveau(niveauActuel);
  const xpProchainNiveau = xpRequisPourNiveau(niveauActuel + 1);
  
  const xpGagneDansNiveau = xp - xpBaseNiveau;
  const xpNiveauTotal = xpProchainNiveau - xpBaseNiveau;
  
  let pourcentage = (xpGagneDansNiveau / xpNiveauTotal) * 100;
  if (pourcentage < 0) pourcentage = 0;
  if (pourcentage > 100) pourcentage = 100;
  
  return {
    niveau: niveauActuel,
    xpBase: xpBaseNiveau,
    xpProchain: xpProchainNiveau,
    xpProgression: xpGagneDansNiveau,
    xpRequis: xpNiveauTotal,
    pourcentage: Math.round(pourcentage)
  };
}

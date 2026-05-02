# CONTEXT — Fennec's Clan
## Fichier pour antigravty — Features engagement, social, UX & technique

---

## DIRECTIVES TOKENS (priorité absolue)

- `str_replace` pour toute modification ciblée — jamais réécrire un fichier entier
- `view` avec `view_range` — jamais lire plus de 30 lignes si la cible est connue
- Ne jamais relire un fichier déjà lu dans la session
- Ne jamais lire un fichier si l'info est dans ce MD
- Grouper les commandes bash : `mkdir -p x && touch x/y` en une commande
- Zéro commentaire dans le code généré
- Zéro explication entre étapes — récap final uniquement
- Ne jamais générer tests, README, .env.example
- Ne jamais afficher le contenu d'un fichier après l'avoir écrit
- Ne pas demander confirmation — enchaîner directement

Format récap final autorisé :
```
✅ Créés : fichier1, fichier2
✅ Modifiés : fichier3, fichier4
⚠️ À vérifier : [si applicable]
```

---

## STACK & CONVENTIONS

- MERN — MongoDB, Express, React 18 + Vite, Node.js
- Backend port : 8080
- Middlewares : `protect` et `authorize` dans `backend/middlewares/protect.js`
- Axios : toujours `import api from "../services/api"` — jamais axios direct
- CSS : Modules uniquement `.module.css`
- MongoDB : toujours `$inc`, `$push`, `$set` — jamais lire-modifier-écrire
- Mongoose : `{ returnDocument: 'after' }` — jamais `{ new: true }`
- `frontend/.npmrc` : `legacy-peer-deps=true`
- `AuthContext.jsx` : export default
- Chemins toujours depuis racine projet

---

## VARIABLES CSS
```css
--couleur-primaire: #e63946
--couleur-sombre: #1a1a2e
--couleur-sombre-2: #16213e
--couleur-accent: #f4a261
--font-principale: 'Inter'
--font-titre: 'Oxanium'
```

---

## MODÈLES EXISTANTS

### User
```
nom, email, password, role, estOrganisateur,
points, tags: [ObjectId ref Tag],
derniereRecompenseCommentaire: Date,
participationsTournois: [{ tournoiId, titreTournoi, dateParticipation, position, pointsGagnes }]
```
Rôles : `utilisateur` | `adherent` | `redacteur` | `organisateur` | `admin`

### Article
```
titre, contenu, auteur: ObjectId ref User, statut: brouillon|publie,
vues, imageUrl, categorie, enVedette: Boolean, tags: [String]
```

### Event
```
titre, description, dateDebut, dateFin, lieu, imageUrl,
statut: ouvert|en_cours|termine, participants: [ObjectId ref User]
```

### Tournoi
```
titre, statut: ouvert|en_cours|termine, typeBracket: simple|double,
matchs, winnersMatchs, losersMatchs, grandeFinale, champion,
participants: [ObjectId ref User]
```

### Mission
```
titre, statut: brouillon|ouverte|fermee|terminee,
postes, pointsRecompense
```

### Tag
```
nom, couleur
```

---

## ROUTES API EXISTANTES
```
/api/auth        /api/articles     /api/events
/api/users       /api/tournaments  /api/missions
/api/tags        /api/chaines      /api/upload
/api/commentaires
```

---

## UTILITAIRE RANGS (déjà créé)
Fichier : `frontend/src/utils/rangs.js`
Exporte : `calculerRang(points)` → `{ nom, division, couleur, progression, pointsSuivant, affichage }`
Rangs : Fer(0) → Bronze(100) → Argent(300) → Or(600) → Platine(1000) → Émeraude(1500) → Diamant(2000) → Maître(3000) → Grand Maître(4000) → Challenger(5000+)

---

## POINTS PAR ACTION (déjà implémenté)
| Action | Points |
|---|---|
| Mission terminée | `pointsRecompense` |
| Article publié | 50 |
| Commentaire | 5 (max 1/24h) |
| Participation événement | 25 |
| Tournoi rejoint | 10 |
| Champion tournoi | +50 bonus |
| Bonus manuel admin | libre |

---

## TÂCHES — À exécuter dans l'ordre

---

### TÂCHE 1 — Historique XP

**Backend — nouveau modèle** `backend/models/HistoriqueXP.js` :
```js
const mongoose = require("mongoose");
const historiqueXPSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, required: true },
  raison: { type: String, required: true },
  type: { type: String, enum: ["mission", "article", "commentaire", "evenement", "tournoi", "bonus"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });
module.exports = mongoose.model("HistoriqueXP", historiqueXPSchema);
```

**Backend — utilitaire** `backend/utils/ajouterXP.js` :
```js
const User = require("../models/User");
const HistoriqueXP = require("../models/HistoriqueXP");

const ajouterXP = async (utilisateurId, points, raison, type, refId = null) => {
  await Promise.all([
    User.findByIdAndUpdate(utilisateurId, { $inc: { points } }),
    HistoriqueXP.create({ utilisateur: utilisateurId, points, raison, type, refId }),
  ]);
};
module.exports = ajouterXP;
```

**Backend — remplacer tous les `$inc: { points: X }`** dans les controllers existants par des appels à `ajouterXP` :
- `missionController.js` : `ajouterXP(userId, mission.pointsRecompense, "Mission: " + mission.titre, "mission", mission._id)`
- `articleController.js` : `ajouterXP(article.auteur, 50, "Article publié: " + article.titre, "article", article._id)`
- `tournoiController.js` : `ajouterXP(userId, 10, "Tournoi: " + tournoi.titre, "tournoi", tournoi._id)`
- `userController.js` (bonus manuel) : `ajouterXP(userId, points, raison, "bonus")`

**Backend — route** dans `backend/routes/userRoutes.js` (avant `/:id`) :
```js
router.get("/historique-xp", protect, async (req, res) => {
  const HistoriqueXP = require("../models/HistoriqueXP");
  const historique = await HistoriqueXP.find({ utilisateur: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: historique });
});
```

**Frontend — section dans** `frontend/src/pages/ProfilPage.jsx` :
- Appel GET `/api/users/historique-xp` au montage
- Section après la section XP existante :
```jsx
<div className={styles.sectionHistorique}>
  <h2 className={styles.sectionTitre}>Historique XP</h2>
  <div className={styles.historiqueList}>
    {historique.map((h, i) => (
      <div key={i} className={styles.historiqueItem}>
        <span className={styles.historiqueType}>{ICONES_TYPE[h.type]}</span>
        <span className={styles.historiqueRaison}>{h.raison}</span>
        <span className={styles.historiquePoints}>+{h.points} pts</span>
        <span className={styles.historiqueDate}>
          {new Date(h.createdAt).toLocaleDateString("fr-FR")}
        </span>
      </div>
    ))}
  </div>
</div>
```
Avec `const ICONES_TYPE = { mission: "🎯", article: "📝", commentaire: "💬", evenement: "📅", tournoi: "⚔️", bonus: "⭐" }`

CSS dans `ProfilPage.module.css` :
```css
.sectionHistorique { margin-top: 2rem; background: var(--couleur-blanc); border-radius: var(--border-radius-lg); padding: 2rem; border: 1px solid var(--couleur-bordure); }
.historiqueList { display: flex; flex-direction: column; gap: 0.4rem; max-height: 320px; overflow-y: auto; }
.historiqueItem { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: var(--border-radius); background: var(--couleur-fond); font-size: 0.85rem; }
.historiqueType { font-size: 1rem; }
.historiqueRaison { flex: 1; color: var(--couleur-texte); }
.historiquePoints { color: #28a745; font-weight: 700; font-family: var(--font-titre); white-space: nowrap; }
.historiqueDate { color: var(--couleur-texte-clair); font-size: 0.75rem; white-space: nowrap; }
```

---

### TÂCHE 2 — Notifications in-app

**Backend — modèle** `backend/models/Notification.js` :
```js
const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["tournoi", "mission", "rang", "badge", "commentaire", "evenement"], required: true },
  titre: { type: String, required: true },
  message: { type: String, required: true },
  lien: { type: String, default: null },
  lu: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model("Notification", notificationSchema);
```

**Backend — utilitaire** `backend/utils/notifier.js` :
```js
const Notification = require("../models/Notification");
const notifier = async (destinataireId, type, titre, message, lien = null) => {
  await Notification.create({ destinataire: destinataireId, type, titre, message, lien });
};
module.exports = notifier;
```

**Backend — routes** `backend/routes/notificationRoutes.js` :
```js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middlewares/protect");

router.get("/", protect, async (req, res) => {
  const notifs = await Notification.find({ destinataire: req.user._id })
    .sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, data: notifs });
});

router.patch("/lire-tout", protect, async (req, res) => {
  await Notification.updateMany({ destinataire: req.user._id, lu: false }, { lu: true });
  res.json({ success: true });
});

router.patch("/:id/lire", protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { lu: true });
  res.json({ success: true });
});

module.exports = router;
```

Brancher dans `server.js` : `app.use("/api/notifications", notificationRoutes)`

**Backend — déclencher des notifications** dans les controllers existants :
- Nouveau tournoi ouvert → notifier tous les adhérents
- Nouvelle mission ouverte → notifier tous les adhérents
- Passage de rang → notifier l'utilisateur concerné (détecter dans `ajouterXP` si le rang change)

**Frontend — icône cloche dans** `frontend/src/components/layout/Navbar.jsx` :
- Ajouter dans la zone `actions` (connecté uniquement) avant le nom utilisateur :
```jsx
<NotifCloche />
```

**Frontend — composant** `frontend/src/components/UI/NotifCloche.jsx` :
- Appel GET `/api/notifications` au montage + polling toutes les 60s
- Badge rouge avec compteur non lus si > 0
- Dropdown au clic : liste des 10 dernières notifs
- Clic sur notif → marquer comme lue + naviguer vers `lien`
- Bouton "Tout marquer comme lu"

**Frontend — page** `frontend/src/pages/NotificationsPage.jsx` :
- Route `/notifications` dans `App.jsx` (protégée, MainLayout)
- Liste complète des notifications avec filtres par type
- Design sombre cohérent

---

### TÂCHE 3 — Badges/Achievements

**Backend — modèle** `backend/models/Badge.js` :
```js
const mongoose = require("mongoose");
const badgeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  description: { type: String, required: true },
  icone: { type: String, required: true },
  couleur: { type: String, default: "#e63946" },
  condition: { type: String, required: true },
});
module.exports = mongoose.model("Badge", badgeSchema);
```

**Ajouter dans User.js** :
```js
badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }]
```

**Backend — utilitaire** `backend/utils/verifierBadges.js` :
```js
const User = require("../models/User");
const Badge = require("../models/Badge");
const notifier = require("./notifier");

const BADGES_DEFINITIONS = [
  { code: "premier_pas",    condition: (u) => u.points >= 1 },
  { code: "guerrier",       condition: (u) => u.participationsTournois?.length >= 1 },
  { code: "veteran",        condition: (u) => u.participationsTournois?.length >= 5 },
  { code: "champion",       condition: (u) => u.participationsTournois?.some(p => p.position === "1er") },
  { code: "contributeur",   condition: (u) => u.points >= 100 },
  { code: "elite",          condition: (u) => u.points >= 500 },
  { code: "legende",        condition: (u) => u.points >= 2000 },
];

const verifierBadges = async (utilisateurId) => {
  const user = await User.findById(utilisateurId).populate("badges");
  const codesActuels = user.badges.map(b => b.code);
  const badgesBDD = await Badge.find();
  const badgesMap = Object.fromEntries(badgesBDD.map(b => [b.code, b]));

  for (const def of BADGES_DEFINITIONS) {
    if (!codesActuels.includes(def.code) && def.condition(user) && badgesMap[def.code]) {
      await User.findByIdAndUpdate(utilisateurId, { $push: { badges: badgesMap[def.code]._id } });
      await notifier(utilisateurId, "badge", "Nouveau badge débloqué !", badgesMap[def.code].nom, "/profil");
    }
  }
};
module.exports = verifierBadges;
```

**Appeler `verifierBadges`** à la fin de `ajouterXP` :
```js
const verifierBadges = require("./verifierBadges");
// À la fin de ajouterXP :
await verifierBadges(utilisateurId);
```

**Backend — seeder badges** `backend/seeders/seedBadges.js` :
```js
const mongoose = require("mongoose");
const Badge = require("../models/Badge");
require("dotenv").config();

const badges = [
  { code: "premier_pas",  nom: "Premier Pas",   description: "Premiers points gagnés",           icone: "👣", couleur: "#8c8c8c" },
  { code: "guerrier",     nom: "Guerrier",       description: "Premier tournoi joué",             icone: "⚔️", couleur: "#cd7f32" },
  { code: "veteran",      nom: "Vétéran",        description: "5 tournois joués",                 icone: "🛡️", couleur: "#c0c0c0" },
  { code: "champion",     nom: "Champion",       description: "Premier tournoi remporté",         icone: "🏆", couleur: "#ffd700" },
  { code: "contributeur", nom: "Contributeur",   description: "100 points accumulés",             icone: "⭐", couleur: "#4fc3a1" },
  { code: "elite",        nom: "Élite",          description: "500 points accumulés",             icone: "💎", couleur: "#a8d8f0" },
  { code: "legende",      nom: "Légende",        description: "2000 points accumulés",            icone: "👑", couleur: "#f4a261" },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Badge.deleteMany({});
  await Badge.insertMany(badges);
  console.log("Badges seedés");
  process.exit();
});
```

**Ajouter dans `package.json` backend** sous `scripts` :
```json
"seed:badges": "node seeders/seedBadges.js"
```

**Backend — route** dans `userRoutes.js` :
```js
router.get("/badges", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("badges");
  res.json({ success: true, data: user.badges });
});
```

**Frontend — section badges dans** `ProfilPage.jsx` (après tags) :
```jsx
{profil?.badges?.length > 0 && (
  <div className={styles.sectionBadges}>
    <h2 className={styles.sectionTitre}>Badges</h2>
    <div className={styles.badgesGrille}>
      {profil.badges.map((b) => (
        <div key={b._id} className={styles.badgeItem} title={b.description}>
          <span className={styles.badgeIcone}>{b.icone}</span>
          <span className={styles.badgeNom}>{b.nom}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

CSS dans `ProfilPage.module.css` :
```css
.sectionBadges { margin-top: 2rem; background: var(--couleur-blanc); border-radius: var(--border-radius-lg); padding: 2rem; border: 1px solid var(--couleur-bordure); }
.badgesGrille { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.badgeItem { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.75rem 1rem; border-radius: var(--border-radius); background: var(--couleur-fond); border: 1px solid var(--couleur-bordure); min-width: 80px; cursor: default; transition: transform 0.2s; }
.badgeItem:hover { transform: translateY(-2px); }
.badgeIcone { font-size: 1.6rem; }
.badgeNom { font-size: 0.72rem; font-family: var(--font-titre); color: var(--couleur-texte-clair); text-align: center; }
```

---

### TÂCHE 4 — Page "Mon Activité"

**Frontend — page** `frontend/src/pages/MonActivitePage.jsx` :
- Route `/mon-activite` protégée dans `App.jsx` (MainLayout)
- Lien dans Navbar (connecté uniquement) ou dans le menu profil

Sections de la page :
1. **Stats résumé** — 4 cards : Points totaux, Rang actuel, Tournois joués, Badges obtenus
2. **Prochains événements** — GET `/api/events?statut=ouvert&limit=3` — mini-liste
3. **Prochains tournois** — GET `/api/tournaments?statut=ouvert&limit=3` — mini-liste
4. **Dernières missions ouvertes** — GET `/api/missions?statut=ouverte&limit=3`
5. **Historique XP récent** — GET `/api/users/historique-xp` (10 derniers)

Design : fond sombre `--couleur-sombre`, cards en `--couleur-sombre-2`, accents `--couleur-primaire`

---

### TÂCHE 5 — Profils publics

**Backend — route** dans `userRoutes.js` (avant `/:id` admin) :
```js
router.get("/profil-public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("nom role points tags badges participationsTournois createdAt")
      .populate("tags", "nom couleur")
      .populate("badges", "nom icone couleur description");
    if (!user) return res.status(404).json({ success: false, message: "Membre introuvable" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

**Frontend — page** `frontend/src/pages/ProfilPublicPage.jsx` :
- Route `/membres/:id` dans `App.jsx` (MainLayout, public)
- Appel GET `/api/users/profil-public/:id`
- Afficher : avatar initiale, nom, rang LoL (via `calculerRang`), tags, badges, tournois joués, date d'inscription
- NE PAS afficher : email, points exacts, historique XP détaillé

---

### TÂCHE 6 — Page "Communauté"

**Frontend — page** `frontend/src/pages/CommunautePage.jsx` :
- Route `/communaute` dans `App.jsx` (MainLayout, public)
- Lien dans Navbar après Classement

Sections :
1. **Top contributeurs** — GET `/api/users/classement` (top 10 avec rang et badges)
2. **Membres actifs** — même endpoint, affichage en grille de cards cliquables → `/membres/:id`
3. **Filtres** : par rang (dropdown) + recherche par nom

Chaque card membre :
- Avatar (initiale + couleur rang)
- Nom + rang LoL
- Points
- 3 premiers badges
- Lien vers profil public

---

### TÂCHE 7 — Dark/Light mode

**Frontend — utilitaire** `frontend/src/utils/theme.js` :
```js
export const getTheme = () => localStorage.getItem("theme") || "dark";
export const setTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};
export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");
```

**Frontend — `frontend/src/index.css`** :
Ajouter après les variables dark existantes :
```css
[data-theme="light"] {
  --couleur-sombre: #f8f9fa;
  --couleur-sombre-2: #e9ecef;
  --couleur-texte: #1a1a2e;
  --couleur-texte-clair: #6c757d;
  --couleur-blanc: #ffffff;
  --couleur-fond: #f1f3f5;
  --couleur-bordure: #dee2e6;
}
```

**Frontend — initialisation dans** `frontend/src/main.jsx` :
Ajouter avant `ReactDOM.createRoot` :
```js
import { getTheme } from "./utils/theme";
document.documentElement.setAttribute("data-theme", getTheme());
```

**Frontend — toggle dans** `Navbar.jsx` :
Ajouter dans la zone actions (toujours visible) :
```jsx
<button className={styles.toggleTheme} onClick={toggleTheme} aria-label="Changer le thème">
  {theme === "dark" ? "☀️" : "🌙"}
</button>
```
Utiliser un state local `theme` initialisé avec `getTheme()`, mis à jour au clic.

---

### TÂCHE 8 — Pagination serveur

**Backend — vérifier** que la route GET `/api/articles` supporte déjà `?page=1&limit=10`.
Si non, dans `articleController.js` dans `getArticles` :
```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
const total = await Article.countDocuments(filtre);
const articles = await Article.find(filtre).skip(skip).limit(limit).sort({ createdAt: -1 });
res.json({ success: true, data: articles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
```

**Frontend — composant** `frontend/src/components/UI/Pagination.jsx` :
```jsx
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>←</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} className={p === page ? styles.actif : ""} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}>→</button>
    </div>
  );
}
```

CSS `frontend/src/components/UI/Pagination.module.css` :
```css
.pagination { display: flex; align-items: center; gap: 0.4rem; justify-content: center; margin-top: 2rem; }
.pagination button { padding: 0.4rem 0.8rem; border-radius: var(--border-radius); border: 1px solid var(--couleur-bordure); background: var(--couleur-fond); color: var(--couleur-texte); cursor: pointer; font-family: var(--font-titre); transition: 0.2s; }
.pagination button:hover:not(:disabled) { border-color: var(--couleur-primaire); color: var(--couleur-primaire); }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.actif { background: var(--couleur-primaire) !important; color: white !important; border-color: var(--couleur-primaire) !important; }
```

Intégrer dans `ArticlesPage.jsx` : remplacer l'appel statique par pagination dynamique avec state `page`.

---

### TÂCHE 9 — PWA

**Frontend — `frontend/public/manifest.json`** :
```json
{
  "name": "Fennec's Clan",
  "short_name": "FennecClan",
  "description": "Le clan du Fennekage — geeks, otakus et gamers d'Algérie",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#e63946",
  "icons": [
    { "src": "/fennekagelogo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/fennekagelogo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Frontend — `frontend/public/sw.js`** (service worker minimal) :
```js
const CACHE = "fennec-clan-v1";
const ASSETS = ["/", "/index.html"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener("fetch", e => e.respondWith(
  caches.match(e.request).then(r => r || fetch(e.request))
));
```

**Frontend — enregistrement dans** `frontend/src/main.jsx` :
```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
```

**Frontend — `frontend/index.html`** dans `<head>` :
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#e63946" />
<meta name="mobile-web-app-capable" content="yes" />
```

---

### TÂCHE 10 — Sécurité API

**Backend — installer les packages** :
```bash
cd fennec-arts-backend && npm install helmet express-rate-limit express-validator
```

**Backend — `backend/server.js`** — ajouter après les imports existants :
```js
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());

const limiterGeneral = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: "Trop de requêtes, réessayez plus tard." } });
const limiterAuth = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: "Trop de tentatives de connexion." } });

app.use("/api/", limiterGeneral);
app.use("/api/auth/login", limiterAuth);
app.use("/api/auth/register", limiterAuth);
```

**Backend — validation dans** `backend/controllers/authController.js` :
Dans `register`, ajouter validation avant création :
```js
if (nom.length < 2 || nom.length > 50) return next(new ApiError("Nom invalide (2-50 caractères).", 400));
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return next(new ApiError("Email invalide.", 400));
if (password.length < 6) return next(new ApiError("Mot de passe trop court (min 6 chars).", 400));
```

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

**Lot 1 — Backend fondations (tâches 1, 2, 3)** : HistoriqueXP + Notifications + Badges — interdépendants
**Lot 2 — Frontend profil enrichi (tâches 1, 3, 4)** : sections historique + badges + Mon Activité
**Lot 3 — Social (tâches 5, 6)** : profils publics + communauté
**Lot 4 — UX (tâche 7)** : dark/light mode
**Lot 5 — Technique (tâches 8, 9, 10)** : pagination + PWA + sécurité

---

## INTERDICTIONS STRICTES
- Jamais `{ new: true }` — toujours `{ returnDocument: 'after' }`
- Jamais réécrire un fichier CSS entier — `str_replace` ciblé
- Jamais `import axios from 'axios'` — toujours `import api from "../services/api"`
- Jamais modifier `DashboardLayout.jsx` pour les routes organisateur
- Jamais toucher aux fichiers de déploiement (`vercel.json`, `render.yaml`)
- Jamais appeler `verifierBadges` directement dans une route HTTP — uniquement via `ajouterXP`

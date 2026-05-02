/**
 * Composant racine de l'application — définit l'arbre de routing.
 *
 * Utilise React Router v6 pour gérer la navigation côté client (SPA).
 * Deux layouts principaux structurent l'application :
 *
 * 1. MainLayout  — layout public (Navbar + Footer + <Outlet />)
 *    ├── /              → page d'accueil
 *    ├── /articles      → liste des articles
 *    ├── /articles/:id  → détail d'un article (route dynamique)
 *    ├── /events        → liste des événements
 *    ├── /events/:id    → détail d'un événement
 *    ├── /tournaments   → liste des tournois
 *    ├── /tournaments/:id → détail d'un tournoi
 *    ├── /login         → page de connexion
 *    ├── /register      → page d'inscription
 *    └── /profil        → page profil (protégée : utilisateur connecté requis)
 *
 * 2. DashboardLayout — layout admin (sidebar + <Outlet />)
 *    Protégé par <RouteAdmin> (role === "admin" requis).
 *    ├── /dashboard             → vue d'ensemble
 *    ├── /dashboard/articles    → gestion CRUD des articles
 *    ├── /dashboard/evenements  → gestion CRUD des événements
 *    ├── /dashboard/utilisateurs→ gestion des utilisateurs
 *    └── /dashboard/tournois    → gestion CRUD des tournois
 *
 * 3. Route catch-all  → page 404 (NotFoundPage)
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ── Layouts ──
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdherentLayout from "./layouts/AdherentLayout";

// ── Guards (routes protégées) ──
import RouteProtegee from "./components/RoutesProtegees/RouteProtegee";
import RouteAdmin from "./components/RoutesProtegees/RouteAdmin";

// ── Pages publiques ──
import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import EventsPage from "./pages/EventsPage";
import EvenementDetailPage from "./pages/EvenementDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilPage from "./pages/ProfilPage";
import MissionsAdherent from "./pages/MissionsAdherent";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentDetail from "./pages/TournamentDetail";
import ClassementPage from "./pages/ClassementPage";
import RechercheGlobale from "./pages/RechercheGlobale";
import AgendaPage from "./pages/AgendaPage";
import ProfilPublicPage from "./pages/ProfilPublicPage";
import StorePage from "./pages/StorePage";
import InventairePage from "./pages/InventairePage";
import DefisPage from "./pages/DefisPage";
import EnConstruction from "./pages/EnConstruction";

// ── Pages dashboard (admin) ──
import DashboardAccueil from "./pages/DashboardAccueil";
import DashboardArticles from "./pages/DashboardArticles";
import DashboardStore from "./pages/DashboardStore";
import DashboardEvenements from "./pages/DashboardEvenements";
import DashboardUtilisateurs from "./pages/DashboardUtilisateurs";
import DashboardTournois from "./pages/DashboardTournois";
import DashboardChaines from "./pages/DashboardChaines";
import DashboardMissions from "./pages/DashboardMissions";
import DashboardQuetes from "./pages/DashboardQuetes";

// ── Page 404 ──
import NotFoundPage from "./pages/NotFoundPage";

// ── Routes redacteur ──
import RouteRedacteur from "./components/RoutesProtegees/RouteRedacteur";
import RedacteurLayout from "./layouts/RedacteurLayout";
import RedacteurArticles from "./pages/RedacteurArticles";
// ── Route WebTV ──
import WebTVPage from "./pages/WebTVPage/WebTVPage";
import RouteOrganisateur from "./components/RoutesProtegees/RouteOrganisateur";
function App() {
  return (
    // BrowserRouter utilise l'API History du navigateur pour gérer les URL.
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* ════════════════════════════════════════════
            ROUTES PUBLIQUES — MainLayout (Navbar + Footer)
            ════════════════════════════════════════════ */}
        <Route path="/" element={<MainLayout />}>
          {/* index = route par défaut quand le path est exactement "/" */}
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          {/* :id = paramètre dynamique récupéré via useParams() */}
          <Route path="articles/:id" element={<ArticleDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EvenementDetailPage />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="tournaments/:id" element={<TournamentDetail />} />
          <Route path="classement" element={<ClassementPage />} />
          <Route path="recherche" element={<RechercheGlobale />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="membres/:id" element={<ProfilPublicPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="/webtv" element={<WebTVPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/inventaire" element={<RouteProtegee><InventairePage /></RouteProtegee>} />
          <Route path="/defis" element={<RouteProtegee><DefisPage /></RouteProtegee>} />
          <Route path="/mon-activite" element={<RouteProtegee><EnConstruction titre="Mon activité" /></RouteProtegee>} />
          <Route path="/notifications" element={<RouteProtegee><EnConstruction titre="Notifications" /></RouteProtegee>} />
          <Route path="/communaute" element={<EnConstruction titre="Communauté" />} />
          <Route path="/saisons" element={<EnConstruction titre="Saisons" />} />
          {/* Route protégée : redirige vers /login si non connecté */}
          <Route
            path="profil"
            element={
              <RouteProtegee>
                <ProfilPage />
              </RouteProtegee>
            }
          />
        </Route>

        {/* ════════════════════════════════════════════
            ROUTES ADMIN — DashboardLayout (sidebar)
            Protégé par <RouteAdmin> : redirige si non admin.
            ════════════════════════════════════════════ */}
        <Route
          path="/dashboard"
          element={
            <RouteAdmin>
              <DashboardLayout />
            </RouteAdmin>
          }>
          <Route index element={<DashboardAccueil />} />
          <Route path="articles" element={<DashboardArticles />} />
          <Route path="evenements" element={<DashboardEvenements />} />
          <Route path="utilisateurs" element={<DashboardUtilisateurs />} />
          <Route path="tournois" element={<DashboardTournois />} />
          <Route path="chaines" element={<DashboardChaines />} />
          <Route path="store" element={<DashboardStore />} />
          <Route path="quetes" element={<DashboardQuetes />} />
        </Route>

        {/* ════════════════════════════════════════════
            ROUTES REDACTEUR — RedacteurLayout (sidebar)
            Protégé par <RouteRedacteur> : redirige si non redacteur.
            ════════════════════════════════════════════ */}
        <Route
          path="/redacteur"
          element={
            <RouteRedacteur>
              <RedacteurLayout />
            </RouteRedacteur>
          }>
          <Route index element={<RedacteurArticles />} />
        </Route>

        {/* ════════════════════════════════════════════
            ROUTES ADHÉRENT — AdherentLayout (sidebar adhérent)
            ════════════════════════════════════════════ */}
        <Route
          path="/missions"
          element={
            <RouteProtegee>
              <AdherentLayout />
            </RouteProtegee>
          }>
          <Route index element={<MissionsAdherent />} />
        </Route>
        {/* Missions — admin + organisateur */}
        <Route
          path="/dashboard/missions"
          element={
            <RouteOrganisateur>
              <DashboardLayout />
            </RouteOrganisateur>
          }>
          <Route index element={<DashboardMissions />} />
        </Route>

        {/* Route catch-all : affiche 404 pour toute URL non définie */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

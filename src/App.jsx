import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RouteProtegee from "./components/RoutesProtegees/RouteProtegee";
import RouteAdmin from "./components/RoutesProtegees/RouteAdmin";
import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import EventsPage from "./pages/EventsPage";
import EvenementDetailPage from "./pages/EvenementDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilPage from "./pages/ProfilPage";
import DashboardAccueil from "./pages/DashboardAccueil";
import DashboardArticles from "./pages/DashboardArticles";
import DashboardEvenements from "./pages/DashboardEvenements";
import DashboardUtilisateurs from "./pages/DashboardUtilisateurs";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:id" element={<ArticleDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EvenementDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="profil"
            element={
              <RouteProtegee>
                <ProfilPage />
              </RouteProtegee>
            }
          />
        </Route>

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
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

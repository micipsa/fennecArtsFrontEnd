import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Toutes ces routes utilisent MainLayout (header + footer) */}
        <Route path="/" element={<MainLayout />}>
          {/* index = route par défaut quand l'URL est exactement "/" */}
          <Route index element={<HomePage />} />

          <Route path="articles" element={<ArticlesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Route catch-all : tout ce qui ne correspond à rien affiche 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

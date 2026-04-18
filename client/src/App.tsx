import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CampaignsPage from "./pages/campaigns/CampaignsPage";
import CampaignPage from "./pages/campaigns/CampaignPage";
import { CampaignsProvider } from "./context/campaignsContext/CampaignsProvider";
import InvitePage from "./pages/InvitePage";
import NotFoundRedirect from "./components/NotFoundRedirect";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<CampaignsProvider />}>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignPage />} />
        </Route>
      </Route>

      <Route path="/auth" element={<AuthPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      {/* Catch-all guard for unknown routes */}
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}

export default App;

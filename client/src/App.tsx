import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CampaignsPage from "./pages/campaigns/CampaignsPage";
import CampaignPage from "./pages/campaigns/CampaignPage";
import { CampaignsRealtimeSync } from "./queries/CampaignsRealtimeSync";
import InvitePage from "./pages/InvitePage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<CampaignsRealtimeSync />}>
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignPage />} />
        </Route>
      </Route>

      <Route path="/auth" element={<AuthPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

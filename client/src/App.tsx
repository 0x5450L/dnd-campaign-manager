import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CampaignsPage from "./pages/CampaignsPage";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute/>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
      </Route>
      
      <Route path="/auth" element={<AuthPage />} />
      {/* TODO: Phase 1 routes */}
      {/* <Route path="/campaigns" element={<CampaignsPage />} /> */}
      {/* <Route path="/campaigns/:id" element={<CampaignDetailPage />} /> */}
    </Routes>
  );
}

export default App;

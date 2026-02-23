import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* TODO: Phase 1 routes */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/campaigns" element={<CampaignsPage />} /> */}
      {/* <Route path="/campaigns/:id" element={<CampaignDetailPage />} /> */}
    </Routes>
  );
}

export default App;

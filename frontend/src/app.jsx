import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/landingpage/landingpage.jsx';
import AuthPage from './pages/authentication/authpage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* One AuthPage for both addresses, so the panel can glide */}
      <Route element={<AuthPage />}>
        <Route path="/login" element={null} />
        <Route path="/signup" element={null} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
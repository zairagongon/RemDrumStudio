import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/landingpage/landingpage.jsx';
import AuthPage from './pages/authentication/authpage.jsx';
import AdminLayout from './pages/admin/adminlayout.jsx';
import OverviewPage from './pages/admin/overview/overviewpage.jsx';
import RequireRole from './components/RequireRole.jsx';
import ComingSoon from './components/ComingSoon.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* One AuthPage for both addresses, so the panel can glide */}
      <Route element={<AuthPage />}>
        <Route path="/login" element={null} />
        <Route path="/signup" element={null} />
      </Route>

      {/* Admin area (admins only) */}
      <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="band-bookings" element={<ComingSoon title="Band bookings" />} />
        <Route path="schedules" element={<ComingSoon title="Coach schedules" />} />
        <Route path="payments" element={<ComingSoon title="Payments" />} />
        <Route path="analytics" element={<ComingSoon title="Analytics" />} />
        <Route path="coaches" element={<ComingSoon title="Coaches" />} />
        <Route path="people" element={<ComingSoon title="Parents & Students" />} />
      </Route>

      {/* Other dashboards: not built yet */}
      <Route path="/coach" element={<RequireRole role="coach"><ComingSoon standalone title="Coach dashboard" /></RequireRole>} />
      <Route path="/parent" element={<RequireRole role="parent"><ComingSoon standalone title="Parent dashboard" /></RequireRole>} />
      <Route path="/student" element={<RequireRole role="student"><ComingSoon standalone title="Student dashboard" /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

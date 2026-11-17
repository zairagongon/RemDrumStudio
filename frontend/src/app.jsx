import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/landingpage/landingpage.jsx';
import AuthPage from './pages/authentication/authpage.jsx';
import AdminLayout from './pages/admin/adminlayout.jsx';
import OverviewPage from './pages/admin/overview/overviewpage.jsx';
import BandBookingsPage from './pages/admin/bandbookingpage/bandbooking.jsx';
import CoachLayout from './pages/coach/coachlayout.jsx';
import CoachDashboard from './pages/coach/dashboard/coachDashboard.jsx';
import CoachSchedule from './pages/coach/schedule/coachSchedule.jsx';
import CoachStudents from './pages/coach/students/coachStudents.jsx';
import CoachBookings from './pages/coach/bookings/coachBookings.jsx';
import CoachPayments from './pages/coach/payments/coachPayments.jsx';
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
        <Route path="band-bookings" element={<BandBookingsPage />} />
        <Route path="schedules" element={<ComingSoon title="Coach schedules" />} />
        <Route path="payments" element={<ComingSoon title="Payments" />} />
        <Route path="analytics" element={<ComingSoon title="Analytics" />} />
        <Route path="coaches" element={<ComingSoon title="Coaches" />} />
        <Route path="people" element={<ComingSoon title="Parents & Students" />} />
      </Route>

      {/* Coach area (coaches only) */}
      <Route path="/coach" element={<RequireRole role="coach"><CoachLayout /></RequireRole>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CoachDashboard />} />
        <Route path="schedule" element={<CoachSchedule />} />
        <Route path="students" element={<CoachStudents />} />
        <Route path="bookings" element={<CoachBookings />} />
        <Route path="payments" element={<CoachPayments />} />
      </Route>

      {/* Other dashboards: not built yet */}
      <Route path="/parent" element={<RequireRole role="parent"><ComingSoon standalone title="Parent dashboard" /></RequireRole>} />
      <Route path="/student" element={<RequireRole role="student"><ComingSoon standalone title="Student dashboard" /></RequireRole>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
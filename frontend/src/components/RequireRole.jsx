import { Navigate } from 'react-router-dom';
import { getSession } from '../services/auth.js';

// Only lets the right kind of user see a page. (The backend also checks, this just saves a wrong turn.)
export default function RequireRole({ role, children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.role !== role) return <Navigate to="/" replace />;
  return children;
}

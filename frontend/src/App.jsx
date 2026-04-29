import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/auth/LandingPage';
import ProfessorLayout from './layouts/professor/ProfessorLayout';
import { ROUTE_MAP } from './config/routeMap';
import { ROLE_NAMES } from './config/roleMap';
import ApproverLayout from './layouts/approvers/ApproverLayout';
import ApproverProjects from './pages/approvers/ApproverProjects';
import ApproverEquipment from './pages/approvers/ApproverEquipment';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/auth/ProtectedRoutes';


export function getRoleName(designation) {
  return ROLE_NAMES[designation?.toLowerCase()] || 'User';
}

const APPROVER_ROUTES = [
  { path: '/hod-dashboard', allowedRoles: ['hod'] },
  { path: '/dean-dashboard', allowedRoles: ['dean'] },
  { path: '/rnd-helper-dashboard', allowedRoles: ['rnd_helper'] },
  { path: '/rnd-main-dashboard', allowedRoles: ['rnd_main'] },
  { path: '/academic-integrity-officer-dashboard', allowedRoles: ['aio'] },
  { path: '/finance-officer-helper-dashboard', allowedRoles: ['finance_officer_helper'] },
  { path: '/finance-officer-main-dashboard', allowedRoles: ['finance_officer_main'] },
  { path: '/registrar-dashboard', allowedRoles: ['registrar'] },
  { path: '/vc-office-dashboard', allowedRoles: ['vc_office'] },
  { path: '/vice-chancellor-dashboard', allowedRoles: ['vice_chancellor'] },
];

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth()
  }, []);
  if (isCheckingAuth) {

  }

  const getDashboardRoute = () => {
    if (!authUser) return '/';
    return ROUTE_MAP[authUser.designation?.toLowerCase()] || "/";
  };

  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={authUser ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />}
        />

        {/* Professor */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["professor"]}>
              <ProfessorLayout />
            </ProtectedRoute>
          }
        />

        {/* Approver Dashboards */}
        {APPROVER_ROUTES.map(({ path, allowedRoles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <ApproverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<ApproverProjects />} />
            <Route path="equipment" element={<ApproverEquipment />} />
          </Route>
        ))}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/auth/LandingPage';
import ProfessorLayout from './layouts/professor/ProfessorLayout';
import DeanDashboard from './pages/approvers/DeanDashboard';
import RndHelperDashboard from './pages/approvers/RndHelperDashboard';
import RndMainDashboard from './pages/approvers/RndMainDashboard';
import AcademicIntegrityOfficerDashboard from './pages/approvers/AcademicIntegrityOfficerDashboard';
import FinanceOfficerHelperDashboard from './pages/approvers/FinanceOfficerHelperDashboard';
import FinanceOfficerMainDashboard from './pages/approvers/FinanceOfficerMainDashboard';
import RegistrarDashboard from './pages/approvers/RegistrarDashboard';
import VcOfficeDashboard from './pages/approvers/VcOfficeDashboard';
import ViceChancellorDashboard from './pages/approvers/ViceChancellorDashboard';
import { ROUTE_MAP } from './config/routeMap';
import { ROLE_NAMES } from './config/roleMap';
import ApproverLayout from './layouts/approvers/ApproverLayout';
import ApproverProjects from './pages/approvers/ApproverProjects';
import ApproverEquipment from './pages/approvers/ApproverEquipment';
import { useAuthStore } from './store/useAuthStore';


export function getRoleName(designation) {
  return ROLE_NAMES[designation?.toLowerCase()] || 'User';
}

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    checkAuth()
  }, []);


  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [notification]);


  const getDashboardRoute = () => {
    if (!authUser) return '/';
    const key = authUser.designation?.toLowerCase();
    const route = ROUTE_MAP[key];
    if (!route) {
      console.warn('[getDashboardRoute] unrecognised designation:', key);
    }
    return route || '/';
  };

  const canAccess = (allowedDesignations) => {
    if (!authUser) return false;
    return allowedDesignations.includes(authUser.designation?.toLowerCase());
  };

  if (isCheckingAuth && !authUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#555' }}>
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={authUser ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />}
        />

        <Route
          path="/dashboard/*"
          element={
            canAccess(['professor']) ? (
              <ProfessorLayout user={authUser} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route path="/hod-dashboard" element={
          canAccess(['hod']) ?
            (<ApproverLayout
              user={authUser}
              onLogout={handleLogout}
              notification={notification}
              showNotification={showNotification}
            />) : <Navigate to="/" replace />
        }>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path='projects' element={<ApproverProjects />} />
          <Route path='equipment' element={<ApproverEquipment />} />
        </Route>

        <Route
          path="/dean-dashboard/*"
          element={
            canAccess(['dean']) ? (
              <DeanDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/rnd-helper-dashboard/*"
          element={
            canAccess(['rnd_helper']) ? (
              <RndHelperDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/rnd-main-dashboard/*"
          element={
            canAccess(['rnd_main']) ? (
              <RndMainDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/academic-integrity-officer-dashboard/*"
          element={
            canAccess(['aio']) ? (
              <AcademicIntegrityOfficerDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/finance-officer-helper-dashboard/*"
          element={
            canAccess(['finance_officer_helper']) ? (
              <FinanceOfficerHelperDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/finance-officer-main-dashboard/*"
          element={
            canAccess(['finance_officer_main']) ? (
              <FinanceOfficerMainDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/registrar-dashboard/*"
          element={
            canAccess(['registrar']) ? (
              <RegistrarDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/vc-office-dashboard/*"
          element={
            canAccess(['vc_office']) ? (
              <VcOfficeDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/vice-chancellor-dashboard/*"
          element={
            canAccess(['vice_chancellor']) ? (
              <ViceChancellorDashboard user={authUser} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
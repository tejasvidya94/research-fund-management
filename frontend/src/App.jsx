import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/auth/Landing';
import ProfessorLayout from './layouts/professor/ProfessorLayout';
import HodDashboard from './pages/approvers/HodDashboard';
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
import { getCurrentUser } from './services/authService';


export function getRoleName(designation) {
  return ROLE_NAMES[designation?.toLowerCase()] || 'User';
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const token = sessionStorage.getItem('token');   // ← sessionStorage
      if (token) {
        try {
          const data = await getCurrentUser();
          setUser({
            ...data.user,
            role: getRoleName(data.user.designation)
          });
        } catch (err) {
          console.error('Session restore failed', err);
          sessionStorage.removeItem('token');           // ← sessionStorage
          setUser(null)
        }
      }
      setAuthLoading(false);
    };
    checkUser();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showNotification('Welcome to CURAJ Research Portal!');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');                 // ← sessionStorage
    setUser(null);
    showNotification('Logged out successfully');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    const key = user.designation?.toLowerCase();
    const route = ROUTE_MAP[key];
    if (!route) {
      console.warn('[getDashboardRoute] unrecognised designation:', key);
    }
    return route || '/';
  };

  const canAccess = (allowedDesignations) => {
    if (!user) return false;
    return allowedDesignations.includes(user.designation?.toLowerCase());
  };

  if (authLoading) {
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
          element={user ? <Navigate to={getDashboardRoute()} replace /> : <Landing onLogin={handleLogin} />}
        />

        <Route
          path="/dashboard/*"
          element={
            canAccess(['professor']) ? (
              <ProfessorLayout user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/hod-dashboard/*"
          element={
            canAccess(['hod',
              // 'rnd',
              // 'fund'
            ]) ? (
              <HodDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/dean-dashboard/*"
          element={
            canAccess(['dean']) ? (
              <DeanDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/rnd-helper-dashboard/*"
          element={
            canAccess([
              // 'r&d_helper',
              'rnd_helper']) ? (
              <RndHelperDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/rnd-main-dashboard/*"
          element={
            canAccess([
              // 'r&d_main',
              'rnd_main']) ? (
              <RndMainDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/academic-integrity-officer-dashboard/*"
          element={
            canAccess([
              // 'academic_integrity_officer', 
              'aio']) ? (
              <AcademicIntegrityOfficerDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/finance-officer-helper-dashboard/*"
          element={
            canAccess(['finance_officer_helper']) ? (
              <FinanceOfficerHelperDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/finance-officer-main-dashboard/*"
          element={
            canAccess(['finance_officer_main']) ? (
              <FinanceOfficerMainDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/registrar-dashboard/*"
          element={
            canAccess(['registrar']) ? (
              <RegistrarDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/vc-office-dashboard/*"
          element={
            canAccess(['vc_office']) ? (
              <VcOfficeDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route
          path="/vice-chancellor-dashboard/*"
          element={
            canAccess([
              'vice_chancellor',
              // 'vc'
            ]) ? (
              <ViceChancellorDashboard user={user} onLogout={handleLogout} notification={notification} showNotification={showNotification} />
            ) : <Navigate to="/" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
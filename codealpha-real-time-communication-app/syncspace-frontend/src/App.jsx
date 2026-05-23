import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/ui/Spinner';

const LandingPage       = lazy(() => import('./pages/LandingPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const MeetingPage       = lazy(() => import('./pages/MeetingPage'));
const MeetingsPage      = lazy(() => import('./pages/MeetingsPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function WithLayout({ children }) {
  return (
    <PrivateRoute>
      <AppLayout>{children}</AppLayout>
    </PrivateRoute>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Meeting — fullscreen, no sidebar */}
        <Route path="/meeting/:roomId" element={<PrivateRoute><MeetingPage /></PrivateRoute>} />

        {/* App with sidebar */}
        <Route path="/dashboard"     element={<WithLayout><DashboardPage /></WithLayout>} />
        <Route path="/meetings"      element={<WithLayout><MeetingsPage /></WithLayout>} />
        <Route path="/profile"       element={<WithLayout><ProfilePage /></WithLayout>} />
        <Route path="/notifications" element={<WithLayout><NotificationsPage /></WithLayout>} />
        <Route path="/whiteboard"    element={<WithLayout><PlaceholderPage icon="✏️" msg="Open a meeting to use the whiteboard." /></WithLayout>} />
        <Route path="/files"         element={<WithLayout><PlaceholderPage icon="📁" msg="Open a meeting to access shared files." /></WithLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function PlaceholderPage({ icon, msg }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:'60vh', gap:16 }}>
      <span style={{ fontSize:48 }}>{icon}</span>
      <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:15, margin:0 }}>{msg}</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

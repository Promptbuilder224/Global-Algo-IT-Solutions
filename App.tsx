
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoadingScreen from './components/ui/LoadingScreen';
import { ROUTES, REDIRECTS, ROLES } from './constants';
import { Role } from './types';

// Lazy Load Pages for Performance
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardLayout = React.lazy(() => import('./components/layouts/DashboardLayout'));

// Lazy Load Dashboards
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard'));
const BranchManagerDashboard = React.lazy(() => import('./pages/dashboards/BranchManagerDashboard'));
const TeamLeadDashboard = React.lazy(() => import('./pages/dashboards/TeamLeadDashboard'));
const AgentDashboard = React.lazy(() => import('./pages/dashboards/AgentDashboard'));

// Lazy Load Tools Pages
const AdminToolsPage = React.lazy(() => import('./pages/AdminToolsPage'));
const BranchManagerToolsPage = React.lazy(() => import('./pages/BranchManagerToolsPage'));
const TeamLeadToolsPage = React.lazy(() => import('./pages/TeamLeadToolsPage'));
const AgentToolsPage = React.lazy(() => import('./pages/AgentToolsPage'));

/**
 * Handles redirection for authenticated users to their specific dashboard.
 */
const NavigateToDashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
    return <Navigate to={REDIRECTS[user.role]} replace />;
};

/**
 * Robust Protected Route Component.
 * Checks authentication status and role permissions.
 */
interface ProtectedRouteProps {
    allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // Show loading screen while session is being restored
    if (loading) {
        return <LoadingScreen />;
    }

    // Not authenticated -> Redirect to Login
    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    // Authenticated but unauthorized role -> Redirect to their allowed dashboard
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={REDIRECTS[user.role]} replace />;
    }

    // Authorized -> Render content
    return <Outlet />;
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            {/* Public Route: Login */}
            <Route 
                path={ROUTES.LOGIN} 
                element={user ? <Navigate to={REDIRECTS[user.role]} replace /> : <LoginPage />} 
            />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute allowedRoles={Object.values(Role)} />}>
                <Route element={<DashboardLayout />}>
                    
                    {/* Default Route -> Redirect to Role Dashboard */}
                    <Route index element={<NavigateToDashboard />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.Admin]} />}>
                        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
                        <Route path={`${ROUTES.ADMIN}/:page`} element={<AdminToolsPage />} />
                    </Route>

                    {/* Branch Manager Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.BranchManager]} />}>
                        <Route path={ROUTES.BRANCH_MANAGER} element={<BranchManagerDashboard />} />
                        <Route path={`${ROUTES.BRANCH_MANAGER}/:page`} element={<BranchManagerToolsPage />} />
                    </Route>

                    {/* Team Lead Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.TeamLead]} />}>
                        <Route path={ROUTES.TEAM_LEAD} element={<TeamLeadDashboard />} />
                        <Route path={`${ROUTES.TEAM_LEAD}/:page`} element={<TeamLeadToolsPage />} />
                    </Route>

                    {/* Agent Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.Agent]} />}>
                        <Route path={ROUTES.AGENT} element={<AgentDashboard />} />
                        <Route path={`${ROUTES.AGENT}/:page`} element={<AgentToolsPage />} />
                    </Route>

                </Route>
            </Route>

            {/* Catch-all -> Redirect to Root (which handles auth redirect) */}
            <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<LoadingScreen />}>
            <AppRoutes />
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;

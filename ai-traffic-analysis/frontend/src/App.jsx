import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import LandingPage         from "./pages/LandingPage";
import LoginPage           from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import ForgotPasswordPage  from "./pages/auth/ForgotPasswordPage";

// Protected pages
import Dashboard           from "./pages/Dashboard";
import LiveTrafficPage     from "./pages/traffic/LiveTrafficPage";
import VehicleDetectionPage from "./pages/detection/VehicleDetectionPage";
import TrafficAnalyticsPage from "./pages/analytics/TrafficAnalyticsPage";
import SignalOptimizationPage from "./pages/signals/SignalOptimizationPage";
import EmergencyVehiclesPage  from "./pages/emergency/EmergencyVehiclesPage";
import RouteIntelligencePage  from "./pages/routes/RouteIntelligencePage";
import ReportsPage         from "./pages/reports/ReportsPage";
import AlertsPage          from "./pages/alerts/AlertsPage";
import SettingsPage        from "./pages/settings/SettingsPage";
import ProfilePage         from "./pages/profile/ProfilePage";
import UserManagementPage  from "./pages/users/UserManagementPage";

// Legacy pages (keep working)
import Upload              from "./pages/Upload";
import Results             from "./pages/Results";
import ResultDetail        from "./pages/ResultDetail";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
            {/* ── Public routes ──────────────────────────────────────── */}
            <Route path="/"                element={<LandingPage />} />
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/demo"            element={<LoginPage />} />

            {/* ── Protected routes ───────────────────────────────────── */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/live-traffic" element={<ProtectedRoute><LiveTrafficPage /></ProtectedRoute>} />

            {/* Vehicle Detection — also accessible via legacy /upload and /vehicle-detection */}
            <Route path="/vehicle-detection" element={<ProtectedRoute><VehicleDetectionPage /></ProtectedRoute>} />
            <Route path="/upload"            element={<ProtectedRoute><VehicleDetectionPage /></ProtectedRoute>} />

            <Route path="/analytics" element={<ProtectedRoute><TrafficAnalyticsPage /></ProtectedRoute>} />
            <Route path="/signals"   element={<ProtectedRoute><SignalOptimizationPage /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencyVehiclesPage /></ProtectedRoute>} />
            <Route path="/routes"    element={<ProtectedRoute><RouteIntelligencePage /></ProtectedRoute>} />
            <Route path="/reports"   element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/alerts"    element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/help"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* User management — admin only */}
            <Route path="/users" element={
              <ProtectedRoute requireRole="administrator">
                <UserManagementPage />
              </ProtectedRoute>
            } />

            {/* Legacy results pages — keep fully working */}
            <Route path="/results"     element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><ResultDetail /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

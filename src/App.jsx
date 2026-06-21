import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Layout from "./Layout";
import Login from "./pages/Login";

// Pages
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import AnalysisDetail from "./pages/AnalysisDetail";
import Premium from "./pages/Premium";
import Tutorial from "./pages/Tutorial";
import Training from "./pages/Training";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/Home" replace />} />
        <Route path="Home" element={<Home />} />
        <Route path="Analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="History" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="AnalysisDetail" element={<ProtectedRoute><AnalysisDetail /></ProtectedRoute>} />
        <Route path="Premium" element={<Premium />} />
        <Route path="Tutorial" element={<Tutorial />} />
        <Route path="Training" element={<Training />} />
        <Route path="AdminDashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

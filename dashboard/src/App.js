import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Servers from './pages/Servers';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import EmbedBuilder from './pages/EmbedBuilder';
import Logs from './pages/Logs';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/servers" element={
              <PrivateRoute>
                <Servers />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/embed-builder" element={
              <PrivateRoute>
                <EmbedBuilder />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/logs" element={
              <PrivateRoute>
                <Logs />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Navigate to="/servers" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
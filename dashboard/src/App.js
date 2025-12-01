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
import Analytics from './pages/Analytics';
import MessageLogs from './pages/MessageLogs';
import VoiceLogs from './pages/VoiceLogs';
import MemberLogs from './pages/MemberLogs';
import RoleLogs from './pages/RoleLogs';
import Tickets from './pages/Tickets';
import ReactionRoles from './pages/ReactionRoles';
import CustomCommands from './pages/CustomCommands';
import Announcements from './pages/Announcements';
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
            
            <Route path="/server/:id/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/logs/messages" element={
              <PrivateRoute>
                <MessageLogs />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/logs/voice" element={
              <PrivateRoute>
                <VoiceLogs />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/logs/members" element={
              <PrivateRoute>
                <MemberLogs />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/logs/roles" element={
              <PrivateRoute>
                <RoleLogs />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/tickets" element={
              <PrivateRoute>
                <Tickets />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/reactionroles" element={
              <PrivateRoute>
                <ReactionRoles />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/customcommands" element={
              <PrivateRoute>
                <CustomCommands />
              </PrivateRoute>
            } />
            
            <Route path="/server/:id/announcements" element={
              <PrivateRoute>
                <Announcements />
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
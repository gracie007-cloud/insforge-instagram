import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import './styles/global.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  return !token ? <>{children}</> : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Home />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="explore" element={<div style={{ padding: '20px', textAlign: 'center' }}>Explore - Coming Soon</div>} />
          <Route path="activity" element={<div style={{ padding: '20px', textAlign: 'center' }}>Activity - Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
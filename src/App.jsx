import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateInvoice from './pages/CreateInvoice.jsx';
import PublicInvoice from './pages/PublicInvoice.jsx'; // 👈 Public Share & QR View

// Inline Protected Route — checks token, redirects to /login if missing
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Create & Edit Routes */}
      <Route
        path="/create-invoice"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-invoice/:id"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      /> {/* Reuse CreateInvoice or Edit Component */}

      {/* Public Shareable Link Route (Assessment Section 8) */}
      <Route path="/invoice/share/:shareId" element={<PublicInvoice />} />
      <Route path="/invoice/:id" element={<PublicInvoice />} />
    </Routes>
  );
}

export default App;
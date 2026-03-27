import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guides from './pages/Guides';
import CreateGuide from './pages/CreateGuide';
import BulkUpload from './pages/BulkUpload';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Senders from './pages/Senders';
import DatabaseConfig from './pages/DatabaseConfig';
import Backups from './pages/Backups';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="guides" element={<Guides />} />
        <Route path="guides/create" element={<CreateGuide />} />
        <Route path="guides/bulk" element={<BulkUpload />} />
        <Route path="senders" element={<Senders />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="config/database" element={<DatabaseConfig />} />
        <Route path="config/backups" element={<Backups />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
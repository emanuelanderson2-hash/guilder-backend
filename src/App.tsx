import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import UsersPage from './pages/Users';
import ClientStore from './pages/ClientStore';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Settings from './pages/Settings';

function AppContent() {
  const { user, token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : 
               user?.role === 'delivery' ? <DeliveryDashboard /> : 
               <ClientStore />}
            </ProtectedRoute>
          } />
          <Route path="/chats" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute allowedRoles={['admin']}><Catalog /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
          
          {/* Placeholders for other routes */}
          <Route path="/broadcast" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8 text-zinc-500">Broadcast em breve...</div></ProtectedRoute>} />
          <Route path="/verifications" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8 text-zinc-500">Verificações em breve...</div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard';
import { Products } from './pages/products';
import { Categories } from './pages/categories';
import { SettingsPage } from './pages/settings';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { Layout } from './components/layout';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout element={<Dashboard />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <Layout element={<Products />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Layout element={<Categories />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout element={<SettingsPage />} />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

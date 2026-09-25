import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import HomePage from './pages/HomePage';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import MyListingsPage from './pages/MyListingsPage';
import MessagesPage from './pages/MessagesPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* auth pages: no sidebar, centered layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* main app: wrapped in sidebar layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            
            <Route element={<ProtectedRoute />}>
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/listings/new" element={<CreateListingPage />} />
          <Route path="/listings/mine" element={<MyListingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinkClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link');

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo">
          Campus Marketplace
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={navLinkClass}>
          Browse
        </NavLink>
        <NavLink to="/favorites" className={navLinkClass}>
          Favorites
        </NavLink>
        <NavLink to="/messages" className={navLinkClass}>
          Messages
        </NavLink>
        {user && (
          <NavLink to="/listings/mine" className={navLinkClass}>
            My Listings
          </NavLink>
        )}
        {user && (
          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <NavLink to="/listings/new" className="button-primary sidebar-new-listing">
              + New listing
            </NavLink>
            <div className="sidebar-user">
              <span className="sidebar-user-name">{user.name}</span>
              <button onClick={handleLogout} className="auth-link-button">
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="sidebar-auth-links">
            <NavLink to="/login" className="sidebar-link">Log in</NavLink>
            <NavLink to="/signup" className="sidebar-link">Sign up</NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <p className="auth-subtext page-container">Loading...</p>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">

        {/* Profile Avatar */}
        <div className="profile-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} />
          ) : (
            <span>{user.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Profile Name and Campus */}
        <div className="profile-name">
          <h2>{user.name}</h2>
          <p>{user.campus || 'Campus not provided'}</p>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="profile-details">
            <div className="profile-field">
              <span className="profile-label">Name</span>
              <span>{user.name}</span>
            </div>

            <div className="profile-field">
              <span className="profile-label">Email</span>
              <span>{user.email}</span>
            </div>

            <div className="profile-field">
              <span className="profile-label">Campus</span>
              <span>{user.campus || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="profile-section">
          <h3>Account Information</h3>

          <div className="profile-details">
            <div className="profile-field">
              <span className="profile-label">Email verification</span>

              <span
                className={
                  user.isVerified ? 'verified' : 'not-verified'
                }
              >
                {user.isVerified ? '✓ Verified' : 'Not verified'}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">Member since</span>

              <span>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Not available'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
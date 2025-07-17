import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  return (
    <div className="user-profile">
      <button 
        className="profile-button"
        onClick={() => setShowProfile(!showProfile)}
        aria-label="User profile menu"
      >
        <span className="user-avatar">{user.avatar}</span>
        <span className="user-name">{user.name}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {showProfile && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-avatar">{user.avatar}</div>
            <div className="profile-details">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
          <hr className="profile-divider" />
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
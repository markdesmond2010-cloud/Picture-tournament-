import React, { useState, useEffect } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import VotePage from './pages/VotePage';
import UploadPage from './pages/UploadPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('duel_token'));
  const [stats, setStats] = useState({ totalPhotos: 0, totalUsers: 0 });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Check if user is already logged in
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      setCurrentPage('vote');
    }
    fetchStats();
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLogin = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('duel_token', authToken);
    setCurrentPage('vote');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('duel_token');
    setCurrentPage('auth');
  };

  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">📸 DUEL</h1>
            <nav className="nav">
              <button 
                className={`nav-btn ${currentPage === 'vote' ? 'active' : ''}`}
                onClick={() => setCurrentPage('vote')}
              >
                🗳️ Vote
              </button>
              <button 
                className={`nav-btn ${currentPage === 'upload' ? 'active' : ''}`}
                onClick={() => setCurrentPage('upload')}
              >
                📸 Upload
              </button>
              <button 
                className={`nav-btn ${currentPage === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('leaderboard')}
              >
                🏆 Top
              </button>
              <button 
                className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentPage('profile')}
              >
                👤 {user?.displayName || user?.username}
              </button>
            </nav>
            <div className="stats">
              <span>📊 {stats.totalPhotos} photos</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {currentPage === 'vote' && <VotePage token={token} />}
        {currentPage === 'upload' && <UploadPage token={token} onUploadSuccess={() => setCurrentPage('vote')} />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
        {currentPage === 'profile' && <ProfilePage token={token} user={user} onLogout={logout} />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>🎯 Vote on photos. Get ranked. Share your results.</p>
      </footer>
    </div>
  );
}

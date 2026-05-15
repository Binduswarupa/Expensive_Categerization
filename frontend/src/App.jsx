import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, PieChart, LayoutDashboard, CreditCard, TrendingUp, LogOut } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState(null); // 'login' or 'signup' or null (landing)

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const userData = { username: savedUser, token: savedToken };
      setUser(userData);
      fetchSavedData(savedToken);
    }
  }, []);

  const fetchSavedData = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.transactions.length > 0) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchSavedData(userData.token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setData(null);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file...', file.name);
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Received data:', response.data);
      setData(response.data);
      setActiveTab('dashboard'); // Switch to dashboard on success
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {user && (
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      
      {!user ? (
        <div className="landing-page fade-in">
          {authView ? (
            <div className="full-page-auth">
              <Auth 
                onLoginSuccess={(data) => { setAuthView(null); handleLoginSuccess(data); }} 
                initialMode={authView}
                onBack={() => setAuthView(null)}
              />
            </div>
          ) : (
            <>
              <section className="hero-section">
                <div className="hero-content">
                  <div className="badge">AI-Powered Finance</div>
                  <h1>Smart Expenses,<br/>Simplified.</h1>
                  <p className="hero-subtitle">
                    The most advanced way to track, categorize, and analyze your spending using artificial intelligence. 
                    Upload your CSV and get instant insights.
                  </p>
                  <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="upload-button" onClick={() => setAuthView('signup')}>
                      Get Started Free
                    </button>
                    <button 
                      className="upload-button" 
                      style={{ background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                      onClick={() => setAuthView('login')}
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </section>

              <section className="features-grid">
                <div className="feature-card glass-card">
                  <div className="feature-icon-wrapper">
                    <TrendingUp size={24} color="var(--primary)" />
                  </div>
                  <h3>AI Categorization</h3>
                  <p>Automatically sorts your transactions into meaningful categories using GPT models.</p>
                </div>
                <div className="feature-card glass-card">
                  <div className="feature-icon-wrapper">
                    <PieChart size={24} color="var(--primary)" />
                  </div>
                  <h3>Visual Insights</h3>
                  <p>Beautiful, interactive charts that reveal your spending habits at a glance.</p>
                </div>
                <div className="feature-card glass-card">
                  <div className="feature-icon-wrapper">
                    <CreditCard size={24} color="var(--primary)" />
                  </div>
                  <h3>Monthly Trends</h3>
                  <p>Track your financial progress over time with smart comparative analysis.</p>
                </div>
              </section>
            </>
          )}

          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
        </div>
      ) : (
        <main>
          {!data ? (
            <section className="upload-section glass-card fade-in">
              <FileUpload onUpload={handleUpload} loading={loading} />
              {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
            </section>
          ) : (
            <>
              {activeTab === 'profile' ? (
                <Profile user={user} data={data} />
              ) : (
                <Dashboard data={data} activeTab={activeTab} onReset={() => setData(null)} />
              )}
            </>
          )}
        </main>
      )}

      <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>&copy; 2026 Expense AI Categorizer. Powered by OpenAI.</p>
      </footer>
    </div>
  );
}

export default App;


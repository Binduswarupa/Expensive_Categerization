import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

const Auth = ({ onLoginSuccess, initialMode = 'login', onBack }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, {
        username,
        password,
      });

      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        onLoginSuccess(response.data);
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <button onClick={onBack} className="back-btn">
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin 
              ? 'Log in to manage your AI-powered expenses' 
              : 'Join us to start categorizing your spending'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="upload-button" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <>
                {isLogin ? 'Log In' : 'Sign Up'}
                <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          position: relative;
          z-index: 20;
        }
        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }
        .back-btn:hover {
          color: var(--primary);
        }
        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        input {
          width: 100%;
          background: #fff;
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          color: var(--text-main);
          outline: none;
          transition: all 0.2s;
        }
        input::placeholder {
          color: #94a3b8;
        }
        input:focus {
          border-color: var(--primary);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }
        .success-message {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Auth;

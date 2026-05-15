import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Calendar, Activity, Database, Clock, FileCheck } from 'lucide-react';

const Profile = ({ user, data }) => {
  const { transactions } = data || { transactions: [] };
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };
    fetchHistory();
  }, [data]);
  
  return (
    <div className="profile-container fade-in">
      <div className="dashboard-grid">
        <div className="glass-card">
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'var(--accent-gradient)', 
              borderRadius: '50%', 
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}>
              <User size={48} color="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{user.username}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Premium Member</p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="info-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} color="var(--primary)" />
                <span>Joined</span>
              </div>
              <span style={{ color: 'var(--text-main)' }}>May 2026</span>
            </div>
            <div className="info-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Database size={18} color="var(--primary)" />
                <span>Total Transactions</span>
              </div>
              <span style={{ color: 'var(--text-main)' }}>{transactions.length}</span>
            </div>
            <div className="info-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={18} color="var(--primary)" />
                <span>Status</span>
              </div>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Clock size={20} color="var(--primary)" />
            <h3>Previous Uploads</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {history.length > 0 ? history.map((h, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: i !== history.length - 1 ? '1px solid var(--glass-border)' : 'none'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '0.75rem' }}>
                    <FileCheck size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{h.filename}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{h.upload_time}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
                  Processed
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No previous uploads found.</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default Profile;

import React from 'react';
import { LayoutDashboard, List, PieChart, Wallet, LogOut, User } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'insights', label: 'AI Insights', icon: PieChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="glass-card" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.8rem 1.5rem', 
      marginBottom: '2rem',
      borderRadius: '1rem',
      position: 'sticky',
      top: '1rem',
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          background: 'var(--accent-gradient)', 
          padding: '0.4rem', 
          borderRadius: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Wallet size={20} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>ExpenseAI</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.3rem', borderRadius: '0.8rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.6rem',
                border: 'none',
                background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                fontSize: '0.9rem'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.3rem', borderRadius: '50%' }}>
            <User size={14} />
          </div>
          <span style={{ fontWeight: 500 }}>{user?.username}</span>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: 'none', 
            color: '#ef4444', 
            padding: '0.5rem', 
            borderRadius: '0.6rem', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


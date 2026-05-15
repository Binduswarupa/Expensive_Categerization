import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { LayoutDashboard, ArrowLeft, Download, TrendingUp, Search, Filter, DollarSign, Target, Bell, RefreshCcw } from 'lucide-react';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement
);

const Dashboard = ({ data, activeTab, onReset }) => {
  const { transactions, summary, monthly_summary, insights } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [budget, setBudget] = useState(0);
  const [newBudget, setNewBudget] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBudget();
    fetchSubscriptions();
  }, []);

  const fetchBudget = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/budget', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudget(res.data.limit);
      setNewBudget(res.data.limit);
    } catch (err) { console.error(err); }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(res.data);
    } catch (err) { console.error(err); }
  };

  const updateBudget = async () => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:5000/budget', { limit: newBudget }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudget(newBudget);
      alert("Budget updated successfully!");
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const totalSpent = Object.values(summary).reduce((a, b) => a + b, 0);
  const budgetProgress = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.Category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const amount = Number(t.Amount) || 0;
    const matchesMin = minAmount === '' || amount >= Number(minAmount);
    const matchesMax = maxAmount === '' || amount <= Number(maxAmount);
    
    return matchesSearch && matchesMin && matchesMax;
  });

  const pieData = {
    labels: Object.keys(summary),
    datasets: [{
      data: Object.values(summary),
      backgroundColor: [
        'rgba(37, 99, 235, 0.7)', // Royal Blue
        'rgba(59, 130, 246, 0.7)', // Bright Blue
        'rgba(96, 165, 250, 0.7)', // Sky Blue
        'rgba(147, 197, 253, 0.7)', // Light Blue
        'rgba(30, 64, 175, 0.7)',  // Dark Blue
        'rgba(100, 116, 139, 0.7)'  // Slate Gray
      ],
      borderColor: ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#94a3b8'],
      borderWidth: 1,
    }]
  };

  const barData = {
    labels: Object.keys(monthly_summary),
    datasets: [{
      label: 'Monthly Spending',
      data: Object.values(monthly_summary),
      backgroundColor: 'rgba(37, 99, 235, 0.7)',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const trendData = {
    labels: Object.keys(monthly_summary),
    datasets: [{
      label: 'Spending Trend',
      data: Object.values(monthly_summary),
      fill: true,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointHoverRadius: 6
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#1e293b', font: { size: 12 } } }
    },
    scales: activeTab === 'dashboard' ? {} : {
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div className="dashboard-container fade-in">
      {activeTab === 'dashboard' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>AI Monthly Insights</h3>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.6', fontStyle: 'italic' }}>"{insights}"</p>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Target size={20} color="var(--primary)" />
                <h3 style={{ margin: 0 }}>Monthly Budget</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Spent: ${totalSpent.toFixed(2)}</span>
                <span style={{ color: 'var(--text-muted)' }}>Limit: ${budget.toFixed(2)}</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ 
                  width: `${Math.min(budgetProgress, 100)}%`, 
                  height: '100%', 
                  background: budgetProgress > 90 ? '#ef4444' : 'var(--primary)',
                  transition: 'width 0.5s ease-out'
                }}></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="Set Limit"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.4rem 0.8rem', color: 'white', fontSize: '0.9rem' }}
                />
                <button 
                  onClick={updateBudget}
                  className="upload-button" 
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="glass-card">
              <h3>Category Breakdown</h3>
              <div className="chart-container">
                <Pie data={pieData} options={commonOptions} />
              </div>
            </div>
            <div className="glass-card">
              <h3>Spending Trend</h3>
              <div className="chart-container">
                <Line data={trendData} options={commonOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="glass-card fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Recent Transactions</h3>
              <button className="upload-button" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <Download size={16} style={{ marginRight: '0.5rem' }} /> Export
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search description or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.6rem 1rem 0.6rem 2.5rem', color: 'white', width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.3rem 0.8rem' }}>
                <DollarSign size={16} color="var(--text-muted)" />
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', width: '70px', outline: 'none' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', width: '70px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, i) => (
                  <tr key={i}>
                    <td>{t.Date}</td>
                    <td style={{ color: 'var(--text-main)' }}>{t.Description}</td>
                    <td><span className={`category-badge category-${t.Category}`}>{t.Category}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>${(Number(t.Amount) || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="dashboard-grid fade-in">
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Budget Breakdown</h3>
              <div className={`badge ${budgetProgress > 100 ? 'danger' : ''}`} style={{ background: budgetProgress > 100 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: budgetProgress > 100 ? '#ef4444' : 'var(--primary)' }}>
                {budgetProgress.toFixed(0)}% Utilized
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(summary).map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{cat}</span>
                    <span>${amt.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((amt / totalSpent) * 100, 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RefreshCcw size={20} color="var(--primary)" />
                <h3 style={{ margin: 0 }}>Detected Subscriptions</h3>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subscriptions.length > 0 ? subscriptions.map((sub, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sub.description}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recurring Monthly</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${sub.amount.toFixed(2)}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No recurring payments detected yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button 
          onClick={onReset}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
        >
          Reset and upload new data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;



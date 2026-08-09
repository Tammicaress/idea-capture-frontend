import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [ideaForm, setIdeaForm] = useState({
    title: '',
    category: '',
    description: '',
    nextAction: '',
  });

  const categoryMap = {
    marketing: '📢 Marketing',
    operations: '⚙️ Operations',
    client: '👥 Client Feedback',
    team: '👨‍💼 Team Development',
    podcast: '🎙️ Podcast/Blog/YouTube',
    kpi: '📊 KPI Ideas',
    financial: '💰 Financial',
    tax: '📋 Tax Strategy',
    experience: '✨ Client Experience',
    strategic: '🎯 Strategic Initiatives',
    technology: '💻 Technology/Systems',
  };

  useEffect(() => {
    if (token) {
      loadIdeas();
    }
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ideas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setFormData({ email: '', password: '' });
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Authentication error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!ideaForm.title || !ideaForm.category) {
      alert('Title and Category are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: ideaForm.title,
          category: ideaForm.category,
          description: ideaForm.description,
          nextAction: ideaForm.nextAction,
        }),
      });

      if (response.ok) {
        setIdeaForm({ title: '', category: '', description: '', nextAction: '' });
        loadIdeas();
      }
    } catch (error) {
      alert('Error adding idea: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIdea = async (id) => {
    if (!confirm('Delete this idea?')) return;

    try {
      const response = await fetch(`${API_URL}/ideas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadIdeas();
      }
    } catch (error) {
      alert('Error deleting idea: ' + error.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setIdeas([]);
  };

  const exportIdeas = () => {
    const dataStr = JSON.stringify(ideas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ideas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredIdeas =
    filter === 'all' ? ideas : ideas.filter((idea) => idea.category === filter);

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>💡 Idea Capture</h1>
          <p>Sync your ideas across all devices</p>

          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-btn"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>💡 Idea Capture</h1>
          <p>Your ideas, synced everywhere</p>
        </div>
        <div className="header-actions">
          <button onClick={exportIdeas} className="btn-secondary">
            📥 Export
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        <div className="input-section">
          <form onSubmit={handleAddIdea}>
            <div className="form-row">
              <input
                type="text"
                placeholder="What's on your mind?"
                value={ideaForm.title}
                onChange={(e) =>
                  setIdeaForm({ ...ideaForm, title: e.target.value })
                }
                required
              />
              <select
                value={ideaForm.category}
                onChange={(e) =>
                  setIdeaForm({ ...ideaForm, category: e.target.value })
                }
                required
              >
                <option value="">Select category</option>
                {Object.entries(categoryMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Add details (optional)"
              value={ideaForm.description}
              onChange={(e) =>
                setIdeaForm({ ...ideaForm, description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Next action (optional)"
              value={ideaForm.nextAction}
              onChange={(e) =>
                setIdeaForm({ ...ideaForm, nextAction: e.target.value })
              }
            />

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : '+ Add Idea'}
            </button>
          </form>
        </div>

        <div className="filters">
          {['all', ...Object.keys(categoryMap)].map

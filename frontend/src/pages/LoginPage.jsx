import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authenticateCandidate } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [testId, setTestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Auto-fill test_id and email from URL query if available
    const searchParams = new URLSearchParams(location.search);
    const testIdParam = searchParams.get('test_id');
    const emailParam = searchParams.get('email');
    
    if (testIdParam) {
      setTestId(testIdParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authenticateCandidate(email, testId);
      localStorage.setItem('candidate_token', data.token);
      localStorage.setItem('candidate_email', email);
      localStorage.setItem('test_id', testId);
      localStorage.setItem('test_title', data.test_title);
      localStorage.setItem('end_time', data.end_time);
      
      // Redirect to Candidate Dashboard (Phase 2)
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Proctor Platform
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Enter your details to join the coding test
          </p>
        </header>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--error)', padding: '1rem', color: 'var(--error)', marginBottom: '1.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Test ID (UUID)
            </label>
            <input
              type="text"
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Your Email Address
            </label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Enter Test Environment'}
          </button>
        </form>

        <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          By entering, you agree to the monitoring and periodic webcam snapshot policy.
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;

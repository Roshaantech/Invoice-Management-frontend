import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-container">
      <div className="split-box">
        
        {/* LEFT SIDE: Branding */}
        <div className="left-branding">
          <div>
            <div className="brand-logo-row">
              {/* Custom Branded SVG Logo */}
              <div className="brand-icon">
                <svg className="brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h1 className="brand-title">Invoice<span>Hub</span></h1>
            </div>

            <h2 className="main-heading">
              Streamline Your Business <br />
              <span className="gradient-text">Invoicing & Billing</span>
            </h2>

            <p className="sub-text">
              Manage clients, generate dynamic invoices, track payments, and export PDFs effortlessly with our smart management system.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <span className="check-badge">✓</span>
                <span>Instant PDF Download & Easy Printing</span>
              </div>
              <div className="feature-item">
                <span className="check-badge">✓</span>
                <span>Automatic QR Code Generation for Public View</span>
              </div>
              <div className="feature-item">
                <span className="check-badge">✓</span>
                <span>Real-time Total, Tax & Discount Calculations</span>
              </div>
            </div>
          </div>

          <div className="security-badge">
            <span>ENTERPRISE GRADE</span>
            <span className="live">
              SYSTEM ONLINE <span className="pulse-dot"></span>
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="right-card-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <h2>SIGN IN</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-container">
                  <span className="input-icon">✉</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="custom-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="custom-input"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Login to Account →'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
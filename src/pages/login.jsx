import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      const res = await axios.post(`${API_URL}/auth/login`, formData);
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
                <svg width="40" height="40" viewBox="0 0 120 120">
                  <defs>
                    <path id="loginTopCirclePath" d="M 15,60 A 45,45 0 0 1 105,60" fill="none" />
                    <path id="loginBottomCirclePath" d="M 105,62 A 45,45 0 0 1 15,62" fill="none" />
                  </defs>

                  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" />

                  <text fill="currentColor" fontSize="12" fontWeight="800" letterSpacing="3">
                    <textPath href="#loginTopCirclePath" startOffset="50%" textAnchor="middle">
                      INVOICE
                    </textPath>
                  </text>

                  <text fill="currentColor" fontSize="12" fontWeight="800" letterSpacing="3">
                    <textPath href="#loginBottomCirclePath" startOffset="50%" textAnchor="middle">
                      INVOICE
                    </textPath>
                  </text>

                  <g transform="rotate(-14 60 60)">
                    <rect x="14" y="50" width="92" height="22" fill="currentColor" />
                    <text
                      x="60"
                      y="66"
                      fill="#0e1420"
                      fontSize="16"
                      fontWeight="900"
                      textAnchor="middle"
                      letterSpacing="1"
                    >
                      INVOICE
                    </text>
                  </g>
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
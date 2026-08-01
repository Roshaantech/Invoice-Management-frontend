import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="split-container">
      <div className="split-box">
        
        {/* LEFT SIDE */}
        <div className="left-branding">
          <div className="brand-logo-row">
            <div className="brand-icon">
              <svg width="40" height="40" viewBox="0 0 120 120">
                <defs>
                  <path id="registerTopCirclePath" d="M 15,60 A 45,45 0 0 1 105,60" fill="none" />
                  <path id="registerBottomCirclePath" d="M 105,62 A 45,45 0 0 1 15,62" fill="none" />
                </defs>

                <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1.2" />

                <text fill="currentColor" fontSize="12" fontWeight="800" letterSpacing="3">
                  <textPath href="#registerTopCirclePath" startOffset="50%" textAnchor="middle">
                    INVOICE
                  </textPath>
                </text>

                <text fill="currentColor" fontSize="12" fontWeight="800" letterSpacing="3">
                  <textPath href="#registerBottomCirclePath" startOffset="50%" textAnchor="middle">
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
            <h1 className="brand-title">InvoiceHub</h1>
          </div>

          <h2 className="main-heading">
            Start Managing Your <br />
            <span>Invoices Like a Pro</span>
          </h2>

          <p className="sub-text">
            Create a free account to generate corporate-grade invoices, organize client billing, and streamline your daily accounting operations.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="check-badge">✓</span>
              <span>Full Secure JWT Protected Workspace</span>
            </div>
            <div className="feature-item">
              <span className="check-badge">✓</span>
              <span>Unlimited Client & Billing Records</span>
            </div>
            <div className="feature-item">
              <span className="check-badge">✓</span>
              <span>Share Public Read-Only Invoices via Link</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-card-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in your credentials to get started.</p>
            </div>

            {error && <div style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="custom-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
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

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="custom-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Register Account
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
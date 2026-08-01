import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, CheckCircle, Clock, FileEdit, Eye, Download, Trash2, Edit, Share2, Link2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Live data fetch on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // JWT token from local storage

      // Assessment API requirement: Protected GET /api/invoices or /api/invoice
      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      }); 

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Invoice Handler (Assessment Section 3 Requirement)
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/invoice/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('Invoice deleted successfully!', 'success');
        setInvoices(prev => prev.filter(inv => (inv._id || inv.id) !== id));
      } else {
        showToast('Failed to delete invoice from server.', 'error');
      }
    } catch (error) {
      console.error('Delete Invoice Error:', error);
      showToast('Error occurred while deleting invoice.', 'error');
    }
  };

  // Public Link Share Handler (Assessment Section 8 Requirement)
  const handleShareLink = (shareId) => {
    const publicUrl = `${window.location.origin}/invoice/share/${shareId}`;
    navigator.clipboard.writeText(publicUrl);
    showToast('Public link copied to clipboard!', 'success');
  };

  // Filtering Logic
  const filteredInvoices = invoices.filter(inv => {
    const clientName = inv.customer?.name || inv.clientName || inv.client || '';
    const clientEmail = inv.customer?.email || inv.clientEmail || inv.email || '';
    const invId = inv.invoiceNumber || inv.id || inv._id || '';

    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const invStatus = (inv.status || 'pending').toLowerCase();
    const matchesFilter = filterStatus === 'ALL' || invStatus === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Calculate Aggregates for Dashboard Cards
  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.amount || 0), 0);
  const paidRevenue = invoices.filter(i => (i.status || '').toLowerCase() === 'paid').reduce((acc, inv) => acc + Number(inv.grandTotal || inv.amount || 0), 0);
  const pendingAmount = invoices.filter(i => (i.status || '').toLowerCase() === 'pending').reduce((acc, inv) => acc + Number(inv.grandTotal || inv.amount || 0), 0);
  const draftCount = invoices.filter(i => (i.status || '').toLowerCase() === 'draft').length;

  return (
    <div className="dashboard-container">
      {/* Custom Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.25rem',
            borderRadius: '12px',
            background: '#121b30',
            border: `1px solid ${toast.type === 'error' ? '#EF4444' : '#3B82F6'}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: '280px',
            maxWidth: '380px',
            animation: 'toastSlideIn 0.25s ease-out'
          }}
        >
          <style>{`
            @keyframes toastSlideIn {
              from { transform: translateX(30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <div
            style={{
              flexShrink: 0,
              height: '32px',
              width: '32px',
              borderRadius: '8px',
              background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: toast.type === 'error' ? '#EF4444' : '#3B82F6'
            }}
          >
            {toast.type === 'error' ? <X size={16} /> : <Link2 size={16} />}
          </div>
          <p style={{ color: '#E2E8F0', fontSize: '0.85rem', margin: 0, flex: 1, wordBreak: 'break-word' }}>
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-title">
          <h1>Invoice Operations</h1>
          <p>Real-time telemetry and ledger metrics for corporate accounts.</p>
        </div>
        <div className="header-actions">
          <button className="btn-create-invoice" onClick={() => navigate('/create-invoice')}>
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Invoices Value</span>
            <h3 className="stat-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="stat-icon-wrapper neutral"><FileText size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Cleared Receipts</span>
            <h3 className="stat-value">${paidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="stat-icon-wrapper success"><CheckCircle size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Pending Receivables</span>
            <h3 className="stat-value">${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="stat-icon-wrapper warning"><Clock size={22} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Draft Records</span>
            <h3 className="stat-value">{draftCount} Active</h3>
          </div>
          <div className="stat-icon-wrapper draft"><FileEdit size={22} /></div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, Company Name or Contact Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          {['ALL', 'PAID', 'PENDING', 'DRAFT'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Main Data Table */}
      <section className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Reference Code</th>
              <th>Client / Entity</th>
              <th>Due Date</th>
              <th>Total Value</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  Loading invoices from server...
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                  No invoices found. Click <strong>"Create Invoice"</strong> to add your first live invoice!
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv, idx) => {
                const targetId = inv._id || inv.id;
                const amount = Number(inv.grandTotal || inv.amount || 0);
                const clientName = inv.customer?.name || inv.clientName || inv.client || 'N/A';
                const clientEmail = inv.customer?.email || inv.clientEmail || inv.email || '';
                const displayId = inv.invoiceNumber || inv.id || `INV-${idx + 1}`;
                const statusStr = (inv.status || 'pending').toLowerCase();

                return (
                  <tr key={targetId || idx}>
                    <td className="inv-id">{displayId}</td>
                    <td>
                      <div className="client-name">{clientName}</div>
                      <span className="client-email">{clientEmail}</span>
                    </td>
                    <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : (inv.date || 'N/A')}</td>
                    <td className="amount-text">${amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${statusStr}`}>
                        {statusStr.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        
                       
                       {/* View Invoice */}
                        <button 
                          className="action-btn" 
                          title="View Invoice"
                          onClick={() => navigate(`/invoice/${inv.shareId || targetId}`)}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Share Link */}
                        <button 
                          className="action-btn" 
                          title="Copy Share Link"
                          onClick={() => handleShareLink(inv.shareId || targetId)}
                        >
                          <Share2 size={15} />
                        </button>

                        {/* Edit Invoice */}
                        <button 
                          className="action-btn" 
                          title="Edit Invoice"
                          onClick={() => navigate(`/edit-invoice/${targetId}`)}
                        >
                          <Edit size={15} />
                        </button>

                        {/* Delete Invoice */}
                        <button 
                          className="action-btn btn-danger-action" 
                          title="Delete Invoice"
                          style={{ color: '#EF4444' }}
                          onClick={() => handleDeleteInvoice(targetId)}
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
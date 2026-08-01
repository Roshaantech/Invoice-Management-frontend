import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Printer, Download, Edit, ArrowLeft } from 'lucide-react';

const PublicInvoice = () => {
  const { shareId, id } = useParams();
  const navigate = useNavigate();
  const invoiceKey = shareId || id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/public/invoice/${invoiceKey}`);
        if (!response.ok) throw new Error('Invoice not found');
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching public invoice:', err);
        setError('The requested invoice link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceKey]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('printable-invoice');

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0e1420',
        useCORS: true,
        allowTaint: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
      pdf.save(`invoice-${invoice.invoiceNumber || invoiceKey}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Could not generate PDF. Check the console for details.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#94A3B8' }}>Loading invoice…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <FileText size={48} color="#EF4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#EF4444', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' }}>Invoice Not Found</h2>
        <p style={{ color: '#94A3B8' }}>{error}</p>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/invoice/${invoice.shareId || invoiceKey}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&bgcolor=ffffff&color=000000&data=${encodeURIComponent(publicUrl)}`;
  const statusStr = (invoice.status || 'pending').toLowerCase();

  const statusColors = {
    paid: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    draft: { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8' },
  };
  const badge = statusColors[statusStr] || statusColors.draft;

  // Hardcoded (non-variable) colors for the printable section so html2canvas renders them reliably
  const cardBg = '#0e1420';
  const borderClr = '#2a3244';
  const textSecondary = '#94A3B8';
  const accentBlue = '#3B82F6';

  return (
    <div className="dashboard-container">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #printable-invoice { box-shadow: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="dashboard-header no-print">
        <div className="header-title">
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1>Invoice #{invoice.invoiceNumber || invoiceKey?.slice(-6)}</h1>
          <p>Created {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '—'}</p>
        </div>
        <div className="header-actions">
          {token && (
            <button className="btn-secondary" onClick={() => navigate(`/edit-invoice/${invoice._id}`)}>
              <Edit size={16} /> Edit
            </button>
          )}
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
          <button className="btn-create-invoice" onClick={handleDownloadPdf} disabled={downloading}>
            <Download size={16} /> {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div
        id="printable-invoice"
        style={{
          padding: '3rem',
          maxWidth: '900px',
          margin: '0 auto',
          background: cardBg,
          borderRadius: '16px',
          border: `1px solid ${borderClr}`
        }}
      >
        {/* Letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: `1px solid ${borderClr}` }}>
          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <svg width="56" height="56" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              <defs>
                <path id="topCirclePath" d="M 15,60 A 45,45 0 0 1 105,60" fill="none" />
                <path id="bottomCirclePath" d="M 105,62 A 45,45 0 0 1 15,62" fill="none" />
              </defs>

              <circle cx="60" cy="60" r="56" fill="none" stroke={accentBlue} strokeWidth="2.5" />
              <circle cx="60" cy="60" r="48" fill="none" stroke={accentBlue} strokeWidth="1.2" />

              <text fill={accentBlue} fontSize="12" fontWeight="800" letterSpacing="3">
                <textPath href="#topCirclePath" startOffset="50%" textAnchor="middle">
                  INVOICE
                </textPath>
              </text>

              <text fill={accentBlue} fontSize="12" fontWeight="800" letterSpacing="3">
                <textPath href="#bottomCirclePath" startOffset="50%" textAnchor="middle">
                  INVOICE
                </textPath>
              </text>

              <g transform="rotate(-14 60 60)">
                <rect x="14" y="50" width="92" height="22" fill={accentBlue} />
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
            <div>
              <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Invoice</h2>
              <p style={{ color: textSecondary, fontSize: '0.85rem', margin: '0.2rem 0 0.6rem' }}>
                #{invoice.invoiceNumber || invoiceKey?.slice(-6)}
              </p>
              <span
                style={{
                  display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase',
                  background: badge.bg, color: badge.color
                }}
              >
                {statusStr}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <img
              src={qrSrc}
              alt="Scan to view invoice"
              crossOrigin="anonymous"
              style={{ height: '84px', width: '84px', borderRadius: '10px', border: `1px solid ${borderClr}`, background: '#ffffff', padding: '6px' }}
            />
            <p style={{ color: textSecondary, fontSize: '0.7rem', marginTop: '0.4rem' }}>Scan to view</p>
          </div>
        </div>

        {/* Billed To + Due Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ color: textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
              Billed To
            </span>
            <p style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '1rem', marginTop: '0.5rem', marginBottom: '0.2rem' }}>
              {invoice.customer?.name || '—'}
            </p>
            <p style={{ color: textSecondary, fontSize: '0.85rem', margin: '0.15rem 0' }}>{invoice.customer?.email}</p>
            <p style={{ color: textSecondary, fontSize: '0.85rem', margin: '0.15rem 0' }}>{invoice.customer?.phone}</p>
            <p style={{ color: textSecondary, fontSize: '0.85rem', margin: '0.15rem 0' }}>{invoice.customer?.billingAddress}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: textSecondary, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
              Due Date
            </span>
            <p style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '1rem', marginTop: '0.5rem' }}>
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderClr}` }}>
              <th style={{ width: '34%', textAlign: 'left', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Item</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Qty</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Tax</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Discount</th>
              <th style={{ textAlign: 'right', padding: '0.6rem 0', color: textSecondary, fontSize: '0.78rem', fontWeight: '700' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, i) => {
              const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              const lineTotal = base + (base * (Number(item.tax) || 0)) / 100 - (Number(item.discount) || 0);
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${borderClr}` }}>
                  <td style={{ padding: '0.75rem 0' }}>
                    <div style={{ color: '#FFFFFF', fontWeight: '600' }}>{item.itemName || item.name}</div>
                    <div style={{ color: textSecondary, fontSize: '0.78rem' }}>{item.description}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0', color: textSecondary }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 0', color: textSecondary }}>${Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0', color: textSecondary }}>{item.tax || 0}%</td>
                  <td style={{ padding: '0.75rem 0', color: textSecondary }}>${Number(item.discount || 0).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#FFFFFF', fontWeight: '700' }}>${lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '320px', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${borderClr}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', color: textSecondary, fontSize: '0.88rem' }}>
              <span>Subtotal</span>
              <span style={{ color: '#FFFFFF', fontWeight: '600' }}>${Number(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', color: textSecondary, fontSize: '0.88rem' }}>
              <span>Tax</span>
              <span style={{ color: '#FFFFFF', fontWeight: '600' }}>+${Number(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', color: textSecondary, fontSize: '0.88rem' }}>
              <span>Discount</span>
              <span style={{ color: '#FFFFFF', fontWeight: '600' }}>-${Number(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.9rem', borderTop: `1px solid ${borderClr}`, fontSize: '1.15rem', fontWeight: '800' }}>
              <span style={{ color: '#FFFFFF' }}>Grand Total</span>
              <span style={{ color: accentBlue }}>${Number(invoice.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: textSecondary, fontSize: '0.78rem', marginTop: '3rem' }}>
          This is a read-only invoice view. Contact the sender for any changes.
        </p>
      </div>
    </div>
  );
};

export default PublicInvoice;
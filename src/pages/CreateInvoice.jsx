import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CreateInvoice = ({ onSaveInvoice }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // present only on /edit-invoice/:id
  const isEditMode = Boolean(id);

  // Form States
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(5);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const [items, setItems] = useState([
    { id: 1, itemName: '', description: '', quantity: 1, unitPrice: 0, taxPercent: 0, discount: 0 }
  ]);

  // Load existing invoice when editing
  useEffect(() => {
    if (!isEditMode) return;

    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/invoice/${id}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to load invoice');

        const data = await response.json();

        setInvoiceNumber(data.invoiceNumber || invoiceNumber);
        setClientName(data.customer?.name || '');
        setClientEmail(data.customer?.email || '');
        setClientPhone(data.customer?.phone || '');
        setClientAddress(data.customer?.billingAddress || '');
        setStatus((data.status || 'pending').toLowerCase());
        setDueDate(data.dueDate ? data.dueDate.slice(0, 10) : '');

        if (data.items?.length) {
          setItems(
            data.items.map((it, idx) => ({
              id: idx + 1,
              itemName: it.name || it.itemName || '',
              description: it.description || '',
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || 0,
              taxPercent: it.tax ?? it.taxPercent ?? 0,
              discount: it.discount || 0
            }))
          );
        }
      } catch (err) {
        console.error('Load Invoice Error:', err);
        alert('Could not load this invoice for editing.');
      } finally {
        setFetching(false);
      }
    };

    fetchInvoice();
  }, [id, isEditMode]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = ['quantity', 'unitPrice', 'taxPercent', 'discount'].includes(field)
      ? Number(value)
      : value;
    setItems(updatedItems);
  };

  const addItemRow = () => {
    setItems([...items, { id: Date.now(), itemName: '', description: '', quantity: 1, unitPrice: 0, taxPercent: 0, discount: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    items.forEach(item => {
      const itemSub = (item.quantity || 0) * (item.unitPrice || 0);
      const itemDisc = Number(item.discount || 0);
      const taxableAmount = Math.max(0, itemSub - itemDisc);
      const itemTax = (taxableAmount * Number(item.taxPercent || 0)) / 100;

      subtotal += itemSub;
      discountAmount += itemDisc;
      taxAmount += itemTax;
    });

    const grandTotal = subtotal - discountAmount + taxAmount;
    return { subtotal, taxAmount, discountAmount, grandTotal };
  };

  const { subtotal, taxAmount, discountAmount, grandTotal } = calculateTotals();

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  const formattedItems = items.map(item => ({
      itemName: item.itemName,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.taxPercent,
      discount: item.discount,
      total: ((item.quantity * item.unitPrice) - (item.discount || 0)) + (((item.quantity * item.unitPrice) - (item.discount || 0)) * (item.taxPercent || 0)) / 100
    }));

    const newInvoice = {
      invoiceNumber,
      customer: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        billingAddress: clientAddress
      },
      status: status.charAt(0).toUpperCase() + status.slice(1),
      dueDate,
      items: formattedItems,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      createdAt: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('token');

      const url = isEditMode
        ? `http://localhost:5000/api/invoice/${id}`
        : 'http://localhost:5000/api/invoice';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInvoice)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save invoice.');
      }

      const savedData = await response.json();

      if (onSaveInvoice) {
        onSaveInvoice(savedData);
      }

      navigate('/dashboard');

    } catch (err) {
      console.error('Invoice Save Error:', err);
      alert(`Error: ${err.message || 'Failed to submit invoice.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="dashboard-container">
        <p style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Loading invoice…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          <p>Generate and issue a professional invoice for your client</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="create-invoice-form" className="btn-create-invoice" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Invoice' : 'Save & Issue Invoice'}
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <form id="create-invoice-form" onSubmit={handleSubmit}>
        <div className="table-wrapper" style={{ padding: '2.5rem', marginBottom: '2rem' }}>

          {/* Invoice Meta Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                Invoice Reference
              </span>
              <h2 style={{ color: 'var(--accent-blue)', fontSize: '1.5rem', fontWeight: '800', marginTop: '0.2rem' }}>
                #{invoiceNumber}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', width: '400px' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Status</label>
                <select
                  className="custom-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Due Date</label>
                <input
                  type="date"
                  className="custom-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '700' }}>
              Customer Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Customer Name</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Acma Corp / Ali Khan"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Customer Email Address</label>
                <input
                  type="email"
                  className="custom-input"
                  placeholder="billing@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Phone Number</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="+92 300 1234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Billing Address</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="123 Business Ave, City"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: '700' }}>
                Invoice Items
              </h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={addItemRow}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                + Add Line Item
              </button>
            </div>

            <table className="custom-table" style={{ width: '100%', marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Item & Description</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '15%' }}>Unit Price ($)</th>
                  <th style={{ width: '12%' }}>Tax (%)</th>
                  <th style={{ width: '12%' }}>Disc ($)</th>
                  <th style={{ width: '13%' }}>Amount</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <input
                          type="text"
                          className="custom-input"
                          placeholder="Item Name"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="custom-input"
                          placeholder="Short description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="custom-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="custom-input"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="custom-input"
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(index, 'taxPercent', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="custom-input"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                      />
                    </td>
                    <td style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.95rem' }}>
                      ${(((item.quantity * item.unitPrice) - (item.discount || 0)) * (1 + (item.taxPercent || 0) / 100)).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeItemRow(index)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculations & Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <div style={{ width: '380px', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color, #333)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', color: 'var(--text-secondary, #aaa)', fontSize: '0.9rem' }}>
                <span>Subtotal:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', color: 'var(--text-secondary, #aaa)', fontSize: '0.9rem' }}>
                <span>Total Discount:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '600' }}>-${discountAmount.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', color: 'var(--text-secondary, #aaa)', fontSize: '0.9rem' }}>
                <span>Total Tax:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '600' }}>+${taxAmount.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #333)', color: '#FFFFFF', fontSize: '1.2rem', fontWeight: '800' }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--accent-blue, #3B82F6)' }}>${grandTotal.toFixed(2)}</span>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
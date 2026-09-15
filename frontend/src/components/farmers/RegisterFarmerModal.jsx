import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { volunteerService } from '../../api/volunteerService';
import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { useToast } from '../../context/ToastContext';
import { Award, UserCheck } from 'lucide-react';

export function RegisterFarmerModal({ isOpen, onClose, onSuccess, defaultVillage = null, villages = [] }) {
  const { isOnline, refreshQueue } = useVolunteerOffline();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    villageId: defaultVillage?._id || '',
    name: '',
    phone: '',
    address: '',
    landSize: '',
    landholdingType: 'small',
    crops: 'Wheat, Soybean',
    isPotentialVLE: false,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultVillage?._id) {
      setForm(prev => ({ ...prev, villageId: defaultVillage._id }));
    } else if (villages.length > 0 && !form.villageId) {
      setForm(prev => ({ ...prev, villageId: villages[0]._id }));
    }
  }, [defaultVillage, villages, isOpen]);

  // Landholding auto-categorization per standard Indian ag census
  const handleLandSizeChange = (val) => {
    const acres = parseFloat(val);
    let type = form.landholdingType;
    if (!isNaN(acres)) {
      if (acres <= 2.47) type = 'marginal';       // < 1 hectare
      else if (acres <= 4.94) type = 'small';     // 1-2 hectares
      else if (acres <= 24.7) type = 'medium';    // 2-10 hectares
      else type = 'large';                        // > 10 hectares
    }
    setForm(prev => ({ ...prev, landSize: val, landholdingType: type }));
    if (errors.landSize) setErrors(prev => ({ ...prev, landSize: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Farmer name is required.';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!form.villageId) errs.villageId = 'Please select a village.';
    if (!form.landSize || Number(form.landSize) <= 0) {
      errs.landSize = 'Please enter a valid land size in acres.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        landSize: Number(form.landSize),
        landholdingType: form.landholdingType,
        crops: form.crops.split(',').map(s => s.trim()).filter(Boolean),
        isPotentialVLE: form.isPotentialVLE,
        notes: form.notes.trim()
      };

      const res = await volunteerService.createFarmer(form.villageId, payload, isOnline);
      toast(res.message, isOnline ? 'success' : 'warning');
      refreshQueue();
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to register farmer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      villageId: defaultVillage?._id || (villages[0]?._id || ''),
      name: '',
      phone: '',
      address: '',
      landSize: '',
      landholdingType: 'small',
      crops: 'Wheat, Soybean',
      isPotentialVLE: false,
      notes: ''
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Register Farmer"
      maxWidth="620px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { resetForm(); onClose(); }}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            id="btn-submit-farmer"
          >
            {submitting ? 'Registering...' : (isOnline ? 'Register Farmer' : 'Queue Farmer Offline')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="farmer-village">Village *</label>
          <select
            id="farmer-village"
            name="villageId"
            className={`form-select ${errors.villageId ? 'error' : ''}`}
            value={form.villageId}
            onChange={handleChange}
          >
            <option value="">Select Village</option>
            {villages.map(v => (
              <option key={v._id} value={v._id}>
                {v.name} ({v.block} Block)
              </option>
            ))}
          </select>
          {errors.villageId && <p className="field-error">{errors.villageId}</p>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-name">Farmer Full Name *</label>
            <input
              id="farmer-name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Ramesh Patel"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="farmer-phone">Mobile Phone (10 digits) *</label>
            <input
              id="farmer-phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-landSize">Landholding Size (Acres) *</label>
            <input
              id="farmer-landSize"
              name="landSize"
              type="number"
              step="0.1"
              min="0.1"
              className={`form-input ${errors.landSize ? 'error' : ''}`}
              placeholder="e.g. 3.5"
              value={form.landSize}
              onChange={(e) => handleLandSizeChange(e.target.value)}
            />
            {errors.landSize && <p className="field-error">{errors.landSize}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="farmer-landType">Landholding Classification</label>
            <select
              id="farmer-landType"
              name="landholdingType"
              className="form-select"
              value={form.landholdingType}
              onChange={handleChange}
            >
              <option value="marginal">Marginal (0 - 2.5 ac)</option>
              <option value="small">Small (2.5 - 5 ac)</option>
              <option value="medium">Medium (5 - 25 ac)</option>
              <option value="large">Large (&gt; 25 ac)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="farmer-crops">Crops Cultivated (comma-separated)</label>
          <input
            id="farmer-crops"
            name="crops"
            className="form-input"
            placeholder="e.g. Wheat, Soybean, Mustard"
            value={form.crops}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="farmer-address">Address / Tola / Hamlet</label>
          <input
            id="farmer-address"
            name="address"
            className="form-input"
            placeholder="e.g. Near Panchayat Bhavan, North Tola"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* Potential VLE Flagging */}
        <div
          style={{
            background: form.isPotentialVLE ? 'var(--primary-50)' : 'var(--earth-warm)',
            border: `1.5px solid ${form.isPotentialVLE ? 'var(--primary-400)' : 'var(--earth-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 16,
            transition: 'all 0.15s ease'
          }}
        >
          <label
            htmlFor="farmer-isPotentialVLE"
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-900)' }}
          >
            <input
              id="farmer-isPotentialVLE"
              name="isPotentialVLE"
              type="checkbox"
              style={{ width: 18, height: 18, cursor: 'pointer' }}
              checked={form.isPotentialVLE}
              onChange={handleChange}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="var(--terracotta)" />
              Identify as Potential Village Level Entrepreneur (VLE) Candidate
            </div>
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, marginLeft: 28 }}>
            Check if this farmer displays leadership, mechanical aptitude, tractor driving experience, or community trust.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="farmer-notes">Field Notes / Observations</label>
          <textarea
            id="farmer-notes"
            name="notes"
            rows="2"
            className="form-textarea"
            placeholder="e.g. Has experience operating combine harvester; willing to manage rental equipment for the hamlet."
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
}

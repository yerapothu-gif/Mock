import { useState } from 'react';
import { Modal } from '../common/Modal';
import { LocationCapture } from '../common/LocationCapture';
import { volunteerService } from '../../api/volunteerService';
import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

export function AddVillageModal({ isOpen, onClose, onSuccess }) {
  const { isOnline, refreshQueue } = useVolunteerOffline();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    district: 'Raisen',
    block: 'Obedullaganj',
    location: {
      type: 'Point',
      coordinates: [77.6321, 22.8423]
    },
    farmerCount: '',
    majorCrops: 'Wheat, Soybean, Gram',
    waterResources: 'Borewell, Canal',
    acres: '',
    communityStructures: [],
    readinessStage: 'identified'
  });

  const [errors, setErrors] = useState({});

  // Dynamic community structure item
  const [newStructure, setNewStructure] = useState({ type: 'SHG', name: '', contactPerson: '', phone: '' });

  const addStructure = () => {
    if (!newStructure.name.trim()) return;
    setForm(prev => ({
      ...prev,
      communityStructures: [...prev.communityStructures, { ...newStructure }]
    }));
    setNewStructure({ type: 'SHG', name: '', contactPerson: '', phone: '' });
  };

  const removeStructure = (index) => {
    setForm(prev => ({
      ...prev,
      communityStructures: prev.communityStructures.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Village name is required.';
    if (!form.district.trim()) errs.district = 'District is required.';
    if (!form.block.trim()) errs.block = 'Block is required.';
    if (form.acres && Number(form.acres) < 0) errs.acres = 'Acres cannot be negative.';
    if (form.farmerCount && Number(form.farmerCount) < 0) errs.farmerCount = 'Farmer count cannot be negative.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
        district: form.district.trim(),
        block: form.block.trim(),
        location: form.location,
        farmerCount: Number(form.farmerCount) || 0,
        majorCrops: form.majorCrops.split(',').map(s => s.trim()).filter(Boolean),
        waterResources: form.waterResources.split(',').map(s => s.trim()).filter(Boolean),
        acres: Number(form.acres) || 0,
        communityStructures: form.communityStructures,
        readinessStage: form.readinessStage
      };

      const res = await volunteerService.createVillage(payload, isOnline);
      toast(res.message, isOnline ? 'success' : 'warning');
      refreshQueue();
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to create village.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      district: 'Raisen',
      block: 'Obedullaganj',
      location: { type: 'Point', coordinates: [77.6321, 22.8423] },
      farmerCount: '',
      majorCrops: 'Wheat, Soybean, Gram',
      waterResources: 'Borewell, Canal',
      acres: '',
      communityStructures: [],
      readinessStage: 'identified'
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Add Village Record"
      maxWidth="680px"
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
            id="btn-submit-village"
          >
            {submitting ? 'Saving...' : (isOnline ? 'Save Village' : 'Queue Village Offline')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Basic Info */}
        <div className="form-group">
          <label className="form-label" htmlFor="vil-name">Village Name *</label>
          <input
            id="vil-name"
            name="name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. Rampura or Barkheda"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="vil-district">District *</label>
            <input
              id="vil-district"
              name="district"
              className={`form-input ${errors.district ? 'error' : ''}`}
              value={form.district}
              onChange={handleChange}
            />
            {errors.district && <p className="field-error">{errors.district}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vil-block">Block *</label>
            <input
              id="vil-block"
              name="block"
              className={`form-input ${errors.block ? 'error' : ''}`}
              value={form.block}
              onChange={handleChange}
            />
            {errors.block && <p className="field-error">{errors.block}</p>}
          </div>
        </div>

        {/* Section 2: GPS Location */}
        <div className="form-group">
          <LocationCapture
            value={form.location}
            onChange={(loc) => setForm(prev => ({ ...prev, location: loc }))}
          />
        </div>

        {/* Section 3: Agricultural Statistics */}
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label" htmlFor="vil-farmerCount">Farmer Count</label>
            <input
              id="vil-farmerCount"
              name="farmerCount"
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 85"
              value={form.farmerCount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vil-acres">Cultivable Area (Acres)</label>
            <input
              id="vil-acres"
              name="acres"
              type="number"
              min="0"
              className="form-input"
              placeholder="e.g. 350"
              value={form.acres}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vil-stage">Readiness Stage *</label>
            <select
              id="vil-stage"
              name="readinessStage"
              className="form-select"
              value={form.readinessStage}
              onChange={handleChange}
            >
              <option value="identified">Identified</option>
              <option value="assessed">Assessed</option>
              <option value="vle-active">VLE Active</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="vil-crops">Major Crops (comma-separated)</label>
          <input
            id="vil-crops"
            name="majorCrops"
            className="form-input"
            placeholder="e.g. Soybean, Wheat, Gram, Mustard"
            value={form.majorCrops}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="vil-water">Water Resources (comma-separated)</label>
          <input
            id="vil-water"
            name="waterResources"
            className="form-input"
            placeholder="e.g. Canal, Tube well, River lift, Farm pond"
            value={form.waterResources}
            onChange={handleChange}
          />
        </div>

        {/* Section 4: Community Structures (SHG, FPO, Panchayat) */}
        <div style={{ marginTop: 12, padding: 14, background: 'var(--earth-warm)', borderRadius: 'var(--radius-md)' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-900)', display: 'block', marginBottom: 8 }}>
            Community Structures (SHG / FPO / Cooperative)
          </label>

          {form.communityStructures.map((cs, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: '#fff',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 6,
                fontSize: '0.82rem'
              }}
            >
              <div>
                <strong>[{cs.type}]</strong> {cs.name} — {cs.contactPerson} ({cs.phone || 'No phone'})
              </div>
              <button
                type="button"
                onClick={() => removeStructure(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: 6, marginTop: 8 }}>
            <select
              className="form-select"
              style={{ padding: '6px 8px', fontSize: '0.82rem' }}
              value={newStructure.type}
              onChange={(e) => setNewStructure(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="SHG">SHG</option>
              <option value="FPO">FPO</option>
              <option value="Panchayat">Panchayat</option>
              <option value="Cooperative">Cooperative</option>
            </select>
            <input
              className="form-input"
              style={{ padding: '6px 8px', fontSize: '0.82rem' }}
              placeholder="Group / Org Name"
              value={newStructure.name}
              onChange={(e) => setNewStructure(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              className="form-input"
              style={{ padding: '6px 8px', fontSize: '0.82rem' }}
              placeholder="Contact Person & Phone"
              value={newStructure.contactPerson}
              onChange={(e) => setNewStructure(prev => ({ ...prev, contactPerson: e.target.value }))}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addStructure}
              style={{ height: '100%' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

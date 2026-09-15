import { useState } from 'react';
import { Modal } from '../common/Modal';
import { volunteerService } from '../../api/volunteerService';
import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { useToast } from '../../context/ToastContext';
import { Award, Wrench, CheckCircle } from 'lucide-react';

export function RegisterCandidateModal({ isOpen, onClose, onSuccess, villages = [] }) {
  const { isOnline, refreshQueue } = useVolunteerOffline();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    villageId: villages[0]?._id || '',
    landSize: '2.5',
    landholdingType: 'small',
    crops: 'Wheat, Soybean',
    machineryExperience: 'Has 4+ years driving tractors and operating cultivators',
    notes: 'Respected in the community; trustworthy youth with mechanical interest.'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Candidate name is required.';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      errs.phone = 'Valid 10-digit phone number is required.';
    }
    if (!form.villageId) errs.villageId = 'Please select a village.';
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
      const combinedNotes = `Machinery Experience: ${form.machineryExperience}. Recommendation: ${form.notes}`;
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        villageId: form.villageId,
        landSize: Number(form.landSize) || 2.0,
        landholdingType: form.landholdingType,
        crops: form.crops.split(',').map(s => s.trim()),
        isPotentialVLE: true,
        notes: combinedNotes
      };

      const res = await volunteerService.registerVLECandidate(payload, isOnline);
      toast(res.message, isOnline ? 'success' : 'warning');
      refreshQueue();
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to nominate VLE candidate.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nominate Potential VLE Candidate"
      maxWidth="620px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            id="btn-submit-candidate"
          >
            {submitting ? 'Registering...' : (isOnline ? 'Register Candidate' : 'Queue Candidate Offline')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ background: 'var(--terracotta-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award size={20} color="var(--terracotta)" />
          <p style={{ fontSize: '0.82rem', color: '#9a3412', lineHeight: 1.4 }}>
            Village Level Entrepreneurs (VLEs) are local rural micro-entrepreneurs who custody Foundation machinery and provide affordable custom-hiring rental services to marginal farmers.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Candidate Village *</label>
          <select
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
            <label className="form-label">Candidate Full Name *</label>
            <input
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g. Vikram Singh Lodhi"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="e.g. 9826012345"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Machinery &amp; Tractor Experience</label>
          <input
            name="machineryExperience"
            className="form-input"
            placeholder="e.g. 5 years tractor driving, can service diesel engines"
            value={form.machineryExperience}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Volunteer Recommendation &amp; Community Standing</label>
          <textarea
            name="notes"
            rows="3"
            className="form-textarea"
            placeholder="e.g. Trustworthy youth with high standing in hamlet; willing to undergo Foundation certification training."
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
}

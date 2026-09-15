import { useState } from 'react';
import { Modal } from '../common/Modal';
import { supportService } from '../../api/supportService';
import { useToast } from '../../context/ToastContext';
import { Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'equipment_request', label: 'Equipment Request' },
  { value: 'maintenance_issue', label: 'Maintenance Issue' },
  { value: 'farmer_feedback', label: 'Farmer Feedback' },
  { value: 'general_query', label: 'General Query' },
];

export function NewTicketModal({ isOpen, onClose, onSuccess }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'general_query', subject: '', message: '', urgency: 'medium' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    if (form.message.trim().length < 20) e.message = 'Please describe the issue in more detail (min 20 chars).';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setSubmitting(true);
    try {
      await supportService.createTicket(form);
      toast('Support request sent to Admin successfully!', 'success');
      onSuccess?.();
      onClose();
      setForm({ category: 'general_query', subject: '', message: '', urgency: 'medium' });
    } catch (err) {
      toast(err.message || 'Failed to submit support request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Support Request"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} id="submit-ticket-btn">
            <Send size={15} /> {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-category">Category *</label>
            <select id="ticket-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-urgency">Urgency *</label>
            <select id="ticket-urgency" name="urgency" className="form-select" value={form.urgency} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-subject">Subject *</label>
          <input id="ticket-subject" name="subject" className={`form-input ${errors.subject ? 'error' : ''}`} placeholder="Brief description of the issue" value={form.subject} onChange={handleChange} />
          {errors.subject && <p className="field-error">{errors.subject}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-message">Message *</label>
          <textarea id="ticket-message" name="message" className={`form-textarea ${errors.message ? 'error' : ''}`} rows={5} placeholder="Describe your request or issue in detail..." value={form.message} onChange={handleChange} style={{ resize: 'vertical' }}></textarea>
          {errors.message && <p className="field-error">{errors.message}</p>}
        </div>
      </form>
    </Modal>
  );
}

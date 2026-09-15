import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { transactionService } from '../../api/transactionService';
import { syncService } from '../../api/syncService';
import { useToast } from '../../context/ToastContext';
import { useOffline } from '../../context/OfflineContext';
import { Wifi, WifiOff } from 'lucide-react';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

export function RecordRentalModal({ isOpen, onClose, equipment = [], onSuccess, editTransaction = null }) {
  const { toast } = useToast();
  const { isOnline, refreshPendingCount } = useOffline();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(editTransaction);

  const [form, setForm] = useState({
    farmerName: '',
    machineId: '',
    machineType: '',
    date: new Date().toISOString().slice(0, 16),
    durationHours: '',
    acresCovered: '',
    feeCharged: '',
    paymentStatus: 'paid',
    villageId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTransaction) {
      let formattedDate = new Date().toISOString().slice(0, 16);
      try {
        if (editTransaction.date) {
          formattedDate = new Date(editTransaction.date).toISOString().slice(0, 16);
        }
      } catch {
        // use default
      }
      setForm({
        farmerName: editTransaction.farmerName || '',
        machineId: editTransaction.machineId || '',
        machineType: editTransaction.machineType || '',
        date: formattedDate,
        durationHours: editTransaction.durationHours !== undefined ? String(editTransaction.durationHours) : '',
        acresCovered: editTransaction.acresCovered !== undefined ? String(editTransaction.acresCovered) : '',
        feeCharged: editTransaction.feeCharged !== undefined ? String(editTransaction.feeCharged) : '',
        paymentStatus: editTransaction.paymentStatus || 'paid',
        villageId: editTransaction.villageId || ''
      });
      setErrors({});
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  const handleEquipmentChange = (e) => {
    const selectedId = e.target.value;
    const eq = equipment.find(eq => eq.machineId === selectedId);
    setForm(prev => ({
      ...prev,
      machineId: selectedId,
      machineType: eq?.machineType || '',
    }));
  };

  const autoCalculateFee = () => {
    const eq = equipment.find(e => e.machineId === form.machineId);
    if (eq?.hourlyRate && form.durationHours) {
      const fee = Number(form.durationHours) * eq.hourlyRate;
      setForm(prev => ({ ...prev, feeCharged: String(fee) }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.farmerName.trim()) e.farmerName = 'Farmer name is required.';
    if (!form.machineId) e.machineId = 'Please select a machine.';
    if (!form.durationHours || Number(form.durationHours) < 0.1) e.durationHours = 'Duration must be at least 0.1 hour.';
    if (form.acresCovered !== '' && Number(form.acresCovered) < 0) e.acresCovered = 'Acres must be 0 or more.';
    if (!form.feeCharged || Number(form.feeCharged) < 0) e.feeCharged = 'Fee must be a positive amount.';
    if (!form.date) e.date = 'Date is required.';
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
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      villageId: form.villageId || undefined,
      farmerName: form.farmerName.trim(),
      machineId: form.machineId,
      machineType: form.machineType,
      date: new Date(form.date).toISOString(),
      durationHours: Number(form.durationHours),
      acresCovered: Number(form.acresCovered || 0),
      feeCharged: Number(form.feeCharged),
      paymentStatus: form.paymentStatus,
      offlineId: syncService.generateOfflineId()
    };

    try {
      if (!isOnline) {
        const queued = syncService.queueTransaction(payload);
        refreshPendingCount();
        toast(`Transaction queued offline (ID: ${queued.offlineId}). Will sync when online.`, 'warning');
        onSuccess?.();
        onClose();
        return;
      }

      await transactionService.createTransaction(payload);
      toast('Rental transaction recorded successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to record transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ farmerName: '', machineId: '', machineType: '', date: new Date().toISOString().slice(0, 16), durationHours: '', acresCovered: '', feeCharged: '', paymentStatus: 'paid', villageId: '' });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Record New Rental"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { resetForm(); onClose(); }} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} id="submit-rental-btn">
            {submitting ? 'Saving...' : (isOnline ? 'Record Rental' : 'Queue Offline')}
          </button>
        </>
      }
    >
      {!isOnline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--warning-text)' }}>
          <WifiOff size={15} />
          Offline mode — transaction will be queued with <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>offlineId</code> and synced when online.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="farmerName">Farmer Name *</label>
          <input id="farmerName" name="farmerName" className={`form-input ${errors.farmerName ? 'error' : ''}`} placeholder="e.g. Ramesh Patel" value={form.farmerName} onChange={handleChange} />
          <FieldError message={errors.farmerName} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="machineId">Machine *</label>
          <select id="machineId" name="machineId" className={`form-select ${errors.machineId ? 'error' : ''}`} value={form.machineId} onChange={handleEquipmentChange}>
            <option value="">Select a machine</option>
            {equipment.map(eq => (
              <option key={eq.machineId} value={eq.machineId}>
                {eq.machineType} — {eq.machineId} (₹{eq.hourlyRate}/hr)
              </option>
            ))}
          </select>
          <FieldError message={errors.machineId} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">Date &amp; Time *</label>
          <input id="date" name="date" type="datetime-local" className={`form-input ${errors.date ? 'error' : ''}`} value={form.date} onChange={handleChange} />
          <FieldError message={errors.date} />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="durationHours">Duration (Hours) *</label>
            <input id="durationHours" name="durationHours" type="number" min="0.1" step="0.5" className={`form-input ${errors.durationHours ? 'error' : ''}`} placeholder="e.g. 3.5" value={form.durationHours} onChange={handleChange} onBlur={autoCalculateFee} />
            <FieldError message={errors.durationHours} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="acresCovered">Acres Covered</label>
            <input id="acresCovered" name="acresCovered" type="number" min="0" step="0.1" className={`form-input ${errors.acresCovered ? 'error' : ''}`} placeholder="e.g. 2.0" value={form.acresCovered} onChange={handleChange} />
            <FieldError message={errors.acresCovered} />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="feeCharged">Fee Charged (₹) *</label>
            <input id="feeCharged" name="feeCharged" type="number" min="0" className={`form-input ${errors.feeCharged ? 'error' : ''}`} placeholder="e.g. 1575" value={form.feeCharged} onChange={handleChange} />
            <p className="form-hint">Auto-calculated on blur if machine &amp; duration set.</p>
            <FieldError message={errors.feeCharged} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="paymentStatus">Payment Status *</label>
            <select id="paymentStatus" name="paymentStatus" className="form-select" value={form.paymentStatus} onChange={handleChange}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

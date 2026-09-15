import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { volunteerService } from '../../api/volunteerService';
import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { useToast } from '../../context/ToastContext';
import {
  ClipboardList,
  Plus,
  Trash2,
  CheckSquare,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const AGRICULTURAL_STAGES = [
  { id: 'land_preparation', label: 'Land Preparation', defaultChallenge: 'High cost of private tractor rental; bullock shortage' },
  { id: 'sowing_transplanting', label: 'Sowing / Transplanting', defaultChallenge: 'Manual transplanting delays optimal sowing window' },
  { id: 'spraying_crop_care', label: 'Spraying & Crop Care', defaultChallenge: 'Ineffective manual sprayers leading to pest outbreak' },
  { id: 'harvesting_threshing', label: 'Harvesting & Threshing', defaultChallenge: 'Peak harvest labor shortage and wage spikes' },
  { id: 'post_harvest', label: 'Post-Harvest & Storage', defaultChallenge: 'Grain cleaning and moisture management' }
];

const STANDARD_GAPS = [
  'Machinery shortage',
  'Labour shortage',
  'High rental cost',
  'Skilled operator shortage',
  'Inadequate water / irrigation'
];

export function NewAssessmentModal({ isOpen, onClose, onSuccess, defaultVillage = null, villages = [] }) {
  const { isOnline, refreshQueue } = useVolunteerOffline();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Village & Processes, 2: Gaps & Farmer Demands, 3: Summary

  const [villageId, setVillageId] = useState(defaultVillage?._id || '');
  const [processes, setProcesses] = useState([
    {
      stage: 'land_preparation',
      challengesFaced: 'High cost of hiring private tractors (₹850-1000/hr)',
      currentPractice: 'Manual / bullocks and private hire',
      notes: 'Delays sowing by 10-14 days'
    },
    {
      stage: 'spraying_crop_care',
      challengesFaced: 'No power sprayers; manual hand pumps give uneven coverage',
      currentPractice: 'Manual backpack hand pump',
      notes: 'Gram pod borer infestation risk'
    }
  ]);

  const [gaps, setGaps] = useState([
    'Machinery shortage',
    'High rental cost',
    'Labour shortage'
  ]);

  const [farmerRequests, setFarmerRequests] = useState([
    {
      farmerName: '',
      requestType: 'Rotavator',
      machineTypeNeeded: 'Rotavator 6ft',
      urgency: 'high',
      notes: ''
    }
  ]);

  const [summaryNotes, setSummaryNotes] = useState('');

  useEffect(() => {
    if (defaultVillage?._id) {
      setVillageId(defaultVillage._id);
    } else if (villages.length > 0 && !villageId) {
      setVillageId(villages[0]._id);
    }
  }, [defaultVillage, villages, isOpen]);

  // Process management
  const addProcess = () => {
    const nextStage = AGRICULTURAL_STAGES.find(s => !processes.some(p => p.stage === s.id)) || AGRICULTURAL_STAGES[0];
    setProcesses(prev => [
      ...prev,
      { stage: nextStage.id, challengesFaced: nextStage.defaultChallenge, currentPractice: 'Manual practice', notes: '' }
    ]);
  };

  const updateProcess = (index, field, value) => {
    setProcesses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeProcess = (index) => {
    setProcesses(prev => prev.filter((_, i) => i !== index));
  };

  // Gap toggle
  const toggleGap = (gapName) => {
    setGaps(prev =>
      prev.includes(gapName) ? prev.filter(g => g !== gapName) : [...prev, gapName]
    );
  };

  // Farmer requests management
  const addFarmerRequest = () => {
    setFarmerRequests(prev => [
      ...prev,
      { farmerName: '', requestType: 'Paddy Transplanter', machineTypeNeeded: 'Transplanter 4-Row', urgency: 'medium', notes: '' }
    ]);
  };

  const updateFarmerRequest = (index, field, value) => {
    setFarmerRequests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeFarmerRequest = (index) => {
    setFarmerRequests(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!villageId) {
      toast('Please select a village for this assessment.', 'error');
      setStep(1);
      return;
    }

    if (processes.length === 0) {
      toast('Please evaluate at least one agricultural process.', 'error');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      // Filter out any blank farmer requests
      const validRequests = farmerRequests
        .filter(r => r.farmerName.trim())
        .map(r => ({
          farmerName: r.farmerName.trim(),
          requestType: r.requestType,
          machineTypeNeeded: r.machineTypeNeeded || r.requestType,
          urgency: r.urgency || 'medium',
          notes: r.notes || '',
          status: 'open'
        }));

      const payload = {
        processesEvaluated: processes,
        gapsIdentified: gaps,
        farmerRequests: validRequests,
        summaryNotes: summaryNotes.trim() || 'Village assessment completed by field volunteer.'
      };

      const res = await volunteerService.createAssessment(villageId, payload, isOnline);
      toast(res.message, isOnline ? 'success' : 'warning');
      refreshQueue();
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to submit assessment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agricultural Needs Assessment"
      maxWidth="780px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStep(prev => prev - 1)}
                disabled={submitting}
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(prev => prev + 1)}
                id="btn-next-step"
              >
                Next Step <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                id="btn-submit-assessment"
              >
                {submitting ? 'Submitting...' : (isOnline ? 'Submit Assessment' : 'Queue Assessment Offline')}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Stepper Header */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { num: 1, label: '1. Processes' },
          { num: 2, label: '2. Gaps & Requests' },
          { num: 3, label: '3. Summary' }
        ].map(s => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: step === s.num ? 'var(--primary-700)' : 'var(--earth-warm)',
              color: step === s.num ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step 1: Village & Processes Evaluated */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Target Village *</label>
            <select
              className="form-select"
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
            >
              <option value="">Select Village to Assess</option>
              {villages.map(v => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.district} — {v.block}) [{v.readinessStage}]
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-900)' }}>
              Agricultural Processes Evaluated ({processes.length})
            </h4>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addProcess}
            >
              <Plus size={13} /> Add Process Stage
            </button>
          </div>

          {processes.map((proc, index) => (
            <div
              key={index}
              style={{
                background: '#ffffff',
                border: '1.5px solid var(--earth-border)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-800)' }}
                  value={proc.stage}
                  onChange={(e) => updateProcess(index, 'stage', e.target.value)}
                >
                  {AGRICULTURAL_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>

                {processes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProcess(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}
                    title="Remove this process"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="form-grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Challenges Faced</label>
                  <input
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                    placeholder="e.g. High rental rates, bullock shortage"
                    value={proc.challengesFaced}
                    onChange={(e) => updateProcess(index, 'challengesFaced', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Current Practice</label>
                  <input
                    className="form-input"
                    style={{ fontSize: '0.84rem' }}
                    placeholder="e.g. Manual hand transplanting"
                    value={proc.currentPractice}
                    onChange={(e) => updateProcess(index, 'currentPractice', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Field Notes</label>
                <input
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                  placeholder="e.g. Sowing delayed by 2 weeks; affects yield"
                  value={proc.notes}
                  onChange={(e) => updateProcess(index, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Gaps Identified & Farmer Demands */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Gaps Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 10, color: 'var(--primary-900)' }}>
              Critical Gaps Identified
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {STANDARD_GAPS.map(gap => {
                const checked = gaps.includes(gap);
                return (
                  <div
                    key={gap}
                    onClick={() => toggleGap(gap)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: checked ? 'var(--primary-50)' : 'var(--earth-warm)',
                      border: `1.5px solid ${checked ? 'var(--primary-500)' : 'var(--earth-border)'}`,
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: checked ? 'var(--primary-900)' : 'var(--text-secondary)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      style={{ pointerEvents: 'none' }}
                    />
                    <span>{gap}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Farmer Requests Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-900)' }}>
                  Farmer Machinery Requests ({farmerRequests.length})
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Specific machinery requests voiced by farmers during field survey.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addFarmerRequest}
              >
                <Plus size={13} /> Add Request
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {farmerRequests.map((req, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--earth-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                      placeholder="Farmer Name *"
                      value={req.farmerName}
                      onChange={(e) => updateFarmerRequest(idx, 'farmerName', e.target.value)}
                    />
                    <select
                      className="form-select"
                      style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                      value={req.requestType}
                      onChange={(e) => updateFarmerRequest(idx, 'requestType', e.target.value)}
                    >
                      <option value="Rotavator">Rotavator</option>
                      <option value="Paddy Transplanter">Paddy Transplanter</option>
                      <option value="Power Sprayer">Power Sprayer</option>
                      <option value="Multi-Crop Harvester">Harvester</option>
                      <option value="Seed Drill">Seed Drill</option>
                      <option value="Cultivator">Cultivator</option>
                    </select>
                    <select
                      className="form-select"
                      style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                      value={req.urgency}
                      onChange={(e) => updateFarmerRequest(idx, 'urgency', e.target.value)}
                    >
                      <option value="low">Low Urgency</option>
                      <option value="medium">Medium Urgency</option>
                      <option value="high">High Urgency</option>
                      <option value="critical">Critical Urgency</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFarmerRequest(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <input
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                    placeholder="Specific notes (e.g. Needs for 4 acres before monsoon rains begin)"
                    value={req.notes}
                    onChange={(e) => updateFarmerRequest(idx, 'notes', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Summary & Final Notes */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--earth-warm)', padding: 16, borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-900)', marginBottom: 8 }}>
              Assessment Overview
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              • Processes Evaluated: <strong>{processes.length}</strong>
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              • Gaps Identified: <strong>{gaps.join(', ') || 'None selected'}</strong>
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              • Farmer Requests Recorded: <strong>{farmerRequests.filter(r => r.farmerName).length}</strong>
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Summary Recommendation / Notes</label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="e.g. Village has strong demand for subsidized Foundation machinery rentals. Rotavator and Transplanter are urgent priorities for the upcoming Rabi season."
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

import { StatusBadge } from '../common/StatusBadge';
import { Calendar, Cpu, User } from 'lucide-react';

export function EquipmentCard({ equipment }) {
  const { machineId, machineType, model, serialNumber, ownership, hourlyRate, dailyRate, condition, assignedDate } = equipment;

  return (
    <div className="equipment-card">
      <div className="eq-top">
        <div>
          <span className="eq-id-pill">{machineId}</span>
          <h3 className="eq-title" style={{ marginTop: 8 }}>{machineType}</h3>
          {model && <p className="eq-model">{model}</p>}
        </div>
        {condition && <StatusBadge status={condition} />}
      </div>

      <div className="eq-specs-grid">
        {serialNumber && (
          <div className="eq-spec-item">
            <span>Serial No.</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{serialNumber}</span>
          </div>
        )}
        {ownership && (
          <div className="eq-spec-item">
            <span>Ownership</span>
            <span>{ownership}</span>
          </div>
        )}
        {assignedDate && (
          <div className="eq-spec-item" style={{ gridColumn: '1/-1' }}>
            <span>Assigned</span>
            <span>{new Date(assignedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      <div className="eq-rates-row">
        <div className="eq-rate-box">
          <span className="eq-rate-label">Per Hour</span>
          <span className="eq-rate-amount">₹{hourlyRate?.toLocaleString('en-IN') || '—'}</span>
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--earth-border)' }}></div>
        <div className="eq-rate-box">
          <span className="eq-rate-label">Per Day</span>
          <span className="eq-rate-amount">₹{dailyRate?.toLocaleString('en-IN') || '—'}</span>
        </div>
      </div>
    </div>
  );
}

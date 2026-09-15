import { useState, useEffect, useCallback } from 'react';
import { vleService } from '../api/vleService';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vleService.getEquipment();
      setEquipment(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  return (
    <div className="page-container">
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Assigned Equipment</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          All machinery assigned to you by the Foundation.
        </p>
      </div>

      {loading && <LoadingState message="Loading your equipment..." />}
      {error && <ErrorState error={error} onRetry={loadEquipment} />}

      {!loading && !error && equipment.length === 0 && (
        <EmptyState
          title="No Equipment Assigned"
          description="Contact your Admin to assign machinery to your VLE profile."
        />
      )}

      {!loading && !error && equipment.length > 0 && (
        <div className="equipment-grid">
          {equipment.map(eq => (
            <EquipmentCard key={eq._id || eq.machineId} equipment={eq} />
          ))}
        </div>
      )}
    </div>
  );
}

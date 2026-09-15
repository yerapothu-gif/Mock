import { useState } from 'react';
import { MapPin, Navigation, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export function LocationCapture({ value, onChange }) {
  const [status, setStatus] = useState(
    value?.coordinates && (value.coordinates[0] !== 0 || value.coordinates[1] !== 0)
      ? 'captured'
      : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  // coordinates are GeoJSON: [longitude, latitude]
  const currentLng = value?.coordinates?.[0] ?? '';
  const currentLat = value?.coordinates?.[1] ?? '';

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Browser does not support Geolocation.');
      return;
    }

    setStatus('capturing');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy));
        setStatus('captured');
        onChange?.({
          type: 'Point',
          coordinates: [lng, lat]
        });
      },
      (err) => {
        setStatus('error');
        if (err.code === 1) {
          setErrorMessage('Location permission denied. Please allow location access or set fallback coordinates.');
        } else if (err.code === 2) {
          setErrorMessage('Position unavailable from GPS sensors.');
        } else {
          setErrorMessage('Location request timed out.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const useFallbackCoordinates = () => {
    // Raisen district central coordinates
    const lat = 22.8423;
    const lng = 77.6321;
    setStatus('captured');
    setAccuracy(null);
    setErrorMessage('');
    onChange?.({
      type: 'Point',
      coordinates: [lng, lat]
    });
  };

  const handleManualCoord = (index, val) => {
    const num = parseFloat(val);
    const newCoords = [...(value?.coordinates || [77.6321, 22.8423])];
    newCoords[index] = isNaN(num) ? 0 : num;
    setStatus('captured');
    onChange?.({
      type: 'Point',
      coordinates: newCoords
    });
  };

  return (
    <div className="location-capture-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={18} color="var(--primary-700)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-900)' }}>
            GPS / Village Geo-Coordinates
          </span>
        </div>

        {status === 'captured' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontSize: '0.82rem', fontWeight: 700 }}>
            <Check size={14} /> 📍 Location captured
          </span>
        )}
      </div>

      {status === 'captured' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="location-coords">
            <span><strong>Lat:</strong> {currentLat}° N</span>
            <span><strong>Lng:</strong> {currentLng}° E</span>
            {accuracy && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                (±{accuracy}m accuracy)
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={captureGPS}
            title="Recapture location"
          >
            <RefreshCw size={13} /> Re-capture
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Capture field coordinates directly using device GPS for GIS mapping.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={captureGPS}
            id="btn-capture-gps"
          >
            <Navigation size={14} /> Capture Current Location
          </button>
        </div>
      )}

      {status === 'capturing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={14} className="spin" />
          Acquiring satellite GPS fix...
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontSize: '0.82rem', fontWeight: 600 }}>
            <AlertTriangle size={15} /> ⚠ Unable to capture location: {errorMessage}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={captureGPS}
            >
              Retry GPS
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={useFallbackCoordinates}
            >
              Use Raisen District Central Coordinates (Demo Fallback)
            </button>
          </div>
        </div>
      )}

      {/* Manual adjustments row */}
      <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
            Latitude
          </label>
          <input
            type="number"
            step="0.0001"
            className="form-input"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            placeholder="e.g. 22.8423"
            value={currentLat}
            onChange={(e) => handleManualCoord(1, e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
            Longitude
          </label>
          <input
            type="number"
            step="0.0001"
            className="form-input"
            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
            placeholder="e.g. 77.6321"
            value={currentLng}
            onChange={(e) => handleManualCoord(0, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

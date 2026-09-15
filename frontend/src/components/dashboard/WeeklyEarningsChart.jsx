// Lightweight SVG weekly earnings chart (no external deps)
export function WeeklyEarningsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No weekly data available.</div>;
  }

  const maxEarnings = Math.max(...data.map(d => d.earnings), 1);
  const maxHours = Math.max(...data.map(d => d.hours), 1);

  const W = 640, H = 200, paddingL = 60, paddingR = 20, paddingT = 20, paddingB = 45;
  const chartW = W - paddingL - paddingR;
  const chartH = H - paddingT - paddingB;

  const xStep = chartW / Math.max(data.length - 1, 1);

  const earningsPoints = data.map((d, i) => ({
    x: paddingL + i * xStep,
    y: paddingT + chartH - (d.earnings / maxEarnings) * chartH
  }));

  const hoursPoints = data.map((d, i) => ({
    x: paddingL + i * xStep,
    y: paddingT + chartH - (d.hours / maxHours) * chartH
  }));

  const toPolyline = (pts) => pts.map(p => `${p.x},${p.y}`).join(' ');
  const toAreaPath = (pts) => {
    if (pts.length === 0) return '';
    const lineStr = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const bottom = `L${pts[pts.length - 1].x},${paddingT + chartH} L${pts[0].x},${paddingT + chartH} Z`;
    return lineStr + ' ' + bottom;
  };

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: 'var(--primary-600)', borderRadius: 4, display: 'inline-block' }}></span>
          Earnings (₹)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 3, background: 'var(--accent-amber)', borderRadius: 4, display: 'inline-block' }}></span>
          Hours
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* Y Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = paddingT + chartH * (1 - f);
          return (
            <g key={f}>
              <line x1={paddingL} y1={y} x2={W - paddingR} y2={y} stroke="#e2e8e0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={paddingL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#74887e">
                ₹{((maxEarnings * f) / 1000).toFixed(1)}k
              </text>
            </g>
          );
        })}

        {/* Earnings filled area */}
        <path d={toAreaPath(earningsPoints)} fill="url(#earningsGrad)" opacity="0.25" />
        <polyline points={toPolyline(earningsPoints)} fill="none" stroke="var(--primary-600)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Hours filled area */}
        <polyline points={toPolyline(hoursPoints)} fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />

        {/* Data Points & Tooltips */}
        {earningsPoints.map((p, i) => (
          <g key={`ep-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill="var(--primary-600)" stroke="#fff" strokeWidth="2" />
          </g>
        ))}

        {hoursPoints.map((p, i) => (
          <g key={`hp-${i}`}>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--accent-amber)" stroke="#fff" strokeWidth="2" />
          </g>
        ))}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={`xl-${i}`}
            x={paddingL + i * xStep}
            y={H - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#74887e"
            fontWeight="600"
          >
            {d.week}
          </text>
        ))}

        {/* Gradient defs */}
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Data Table */}
      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--earth-warm)' }}>
              {data.map((d, i) => <th key={i} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--earth-border)', fontSize: '0.75rem' }}>{d.week}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {data.map((d, i) => <td key={i} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--primary-800)', fontWeight: 700 }}>₹{d.earnings.toLocaleString('en-IN')}</td>)}
            </tr>
            <tr>
              {data.map((d, i) => <td key={i} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--accent-amber)', fontWeight: 600 }}>{d.hours}h</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

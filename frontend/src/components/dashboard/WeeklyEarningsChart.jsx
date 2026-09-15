// Lightweight SVG weekly earnings chart — dual-axis (earnings left, hours right)
export function WeeklyEarningsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No weekly data available.</div>;
  }

  const maxEarnings = Math.max(...data.map(d => d.earnings), 1);
  const maxHours    = Math.max(...data.map(d => d.hours), 1);

  const W = 660, H = 220;
  const padL = 68, padR = 58, padT = 20, padB = 45;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  // Earnings line (left axis, ₹)
  const earningsPts = data.map((d, i) => ({
    x: padL + i * xStep,
    y: padT + chartH - (d.earnings / maxEarnings) * chartH,
  }));

  // Hours line (right axis, separate scale)
  const hoursPts = data.map((d, i) => ({
    x: padL + i * xStep,
    y: padT + chartH - (d.hours / maxHours) * chartH,
  }));

  const toLine = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const toArea = (pts) =>
    toLine(pts) +
    ` L${pts[pts.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)}` +
    ` L${pts[0].x.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="chart-container">
      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 12, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="24" height="10"><rect y="3" width="24" height="3" rx="2" fill="var(--primary-600)" /></svg>
          Earnings (₹) — Left axis
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="24" height="10">
            <line x1="0" y1="5" x2="24" y2="5" stroke="var(--accent-amber)" strokeWidth="2.5" strokeDasharray="6 3" />
          </svg>
          Hours — Right axis
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-amber)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-amber)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((f) => {
          const y = padT + chartH * (1 - f);
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="#e2e8e0" strokeWidth="1" strokeDasharray="4 4" />

              {/* Left Y-axis labels — Earnings */}
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#74887e">
                ₹{((maxEarnings * f) / 1000).toFixed(f === 0 ? 0 : 1)}k
              </text>

              {/* Right Y-axis labels — Hours */}
              <text x={W - padR + 8} y={y + 4} textAnchor="start" fontSize="10" fill="#b45309">
                {(maxHours * f).toFixed(f === 0 ? 0 : 1)}h
              </text>
            </g>
          );
        })}

        {/* Left axis label */}
        <text
          x={12} y={padT + chartH / 2}
          textAnchor="middle" fontSize="10" fill="#74887e" fontWeight="600"
          transform={`rotate(-90, 12, ${padT + chartH / 2})`}
        >
          Earnings (₹)
        </text>

        {/* Right axis label */}
        <text
          x={W - 10} y={padT + chartH / 2}
          textAnchor="middle" fontSize="10" fill="#b45309" fontWeight="600"
          transform={`rotate(90, ${W - 10}, ${padT + chartH / 2})`}
        >
          Hours
        </text>

        {/* Earnings filled area */}
        <path d={toArea(earningsPts)} fill="url(#earningsGrad)" />
        {/* Hours filled area */}
        <path d={toArea(hoursPts)} fill="url(#hoursGrad)" />

        {/* Earnings line */}
        <path d={toLine(earningsPts)} fill="none"
          stroke="var(--primary-600)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Hours line */}
        <path d={toLine(hoursPts)} fill="none"
          stroke="var(--accent-amber)" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="7 4" />

        {/* Earnings data points with tooltip title */}
        {earningsPts.map((p, i) => (
          <g key={`e-${i}`}>
            <title>Week {data[i].week}: ₹{data[i].earnings.toLocaleString('en-IN')}</title>
            <circle cx={p.x} cy={p.y} r={5} fill="var(--primary-600)" stroke="#fff" strokeWidth="2" />
          </g>
        ))}

        {/* Hours data points */}
        {hoursPts.map((p, i) => (
          <g key={`h-${i}`}>
            <title>Week {data[i].week}: {data[i].hours}h</title>
            <circle cx={p.x} cy={p.y} r={4.5} fill="var(--accent-amber)" stroke="#fff" strokeWidth="2" />
          </g>
        ))}

        {/* X-axis week labels */}
        {data.map((d, i) => (
          <text key={`xl-${i}`}
            x={padL + i * xStep} y={H - 12}
            textAnchor="middle" fontSize="10" fill="#74887e" fontWeight="600"
          >
            {d.week}
          </text>
        ))}

        {/* Axis borders */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#c5d5cc" strokeWidth="1" />
        <line x1={W - padR} y1={padT} x2={W - padR} y2={padT + chartH} stroke="#c5d5cc" strokeWidth="1" />
        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#c5d5cc" strokeWidth="1" />
      </svg>

      {/* Data Table */}
      <div style={{ overflowX: 'auto', marginTop: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--earth-warm)' }}>
              <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, borderBottom: '1px solid var(--earth-border)', fontSize: '0.75rem' }}>
                Week
              </th>
              <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--primary-700)', fontWeight: 700, borderBottom: '1px solid var(--earth-border)', fontSize: '0.75rem' }}>
                Earnings (₹)
              </th>
              <th style={{ padding: '6px 12px', textAlign: 'right', color: '#b45309', fontWeight: 700, borderBottom: '1px solid var(--earth-border)', fontSize: '0.75rem' }}>
                Hours
              </th>
              <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--earth-border)', fontSize: '0.75rem' }}>
                ₹/hr
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--earth-border-subtle)' }}>
                <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{d.week}</td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-800)' }}>
                  ₹{d.earnings.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                  {d.hours}h
                </td>
                <td style={{ padding: '7px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  {d.hours > 0 ? `₹${Math.round(d.earnings / d.hours)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

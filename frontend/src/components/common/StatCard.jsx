export function StatCard({ label, value, subtext, icon: Icon, color = 'green' }) {
  const colorMap = {
    green: { bg: '#d8f3dc', color: '#1b4332' },
    amber: { bg: '#fef3c7', color: '#b45309' },
    blue: { bg: '#e0f2fe', color: '#0369a1' },
    sage: { bg: '#edf1ea', color: '#2d6a4f' }
  };

  const currentTheme = colorMap[color] || colorMap.green;

  return (
    <div className="stat-card">
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: currentTheme.bg, color: currentTheme.color }}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

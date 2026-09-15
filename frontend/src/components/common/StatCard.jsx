export function StatCard({ label, value, icon: Icon, color = 'green', subtext, onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {subtext && (
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

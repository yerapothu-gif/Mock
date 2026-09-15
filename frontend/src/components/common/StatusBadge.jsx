export function StatusBadge({ status, label }) {
  if (!status) return null;
  const cleanStatus = String(status).toLowerCase();
  const displayLabel = label || cleanStatus.replace(/_/g, ' ');

  return (
    <span className={`badge badge-${cleanStatus}`}>
      <span className="badge-dot" style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }}></span>
      {displayLabel}
    </span>
  );
}

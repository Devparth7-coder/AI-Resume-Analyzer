function ProgressBar({ value, color = "from-mint to-glow" }) {
  const normalizedValue = Math.max(0, Math.min(100, value || 0));

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}

export default ProgressBar;

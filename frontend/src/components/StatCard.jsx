function StatCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="font-display text-3xl font-semibold text-white">{value}</h3>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

export default StatCard;

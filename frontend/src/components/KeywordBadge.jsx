function KeywordBadge({ children, tone = "default" }) {
  const toneStyles = {
    default: "border-white/10 bg-white/5 text-slate-200",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  };

  return (
    <span className={`tag ${toneStyles[tone] || toneStyles.default}`}>{children}</span>
  );
}

export default KeywordBadge;

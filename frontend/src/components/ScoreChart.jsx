import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ScoreChart({ data }) {
  if (!data?.length) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-sm text-slate-400">
        Upload a resume to unlock ATS scoring trends.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="mb-4">
        <h3 className="font-display text-xl text-white">ATS Score Trend</h3>
        <p className="mt-1 text-sm text-slate-400">
          Track how resume quality changes across uploads.
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5eead4" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                color: "#e2e8f0",
              }}
            />
            <Area
              dataKey="score"
              type="monotone"
              stroke="#5eead4"
              strokeWidth={3}
              fill="url(#scoreFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScoreChart;

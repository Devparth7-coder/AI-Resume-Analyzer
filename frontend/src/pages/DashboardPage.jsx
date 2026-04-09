import { useQuery } from "@tanstack/react-query";

import { getDashboardHistoryRequest, getDashboardOverviewRequest } from "../api/dashboard";
import KeywordBadge from "../components/KeywordBadge";
import ProgressBar from "../components/ProgressBar";
import ScoreChart from "../components/ScoreChart";
import StatCard from "../components/StatCard";
import { formatDate, truncate } from "../utils/formatters";

function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverviewRequest,
  });

  const historyQuery = useQuery({
    queryKey: ["dashboard-history"],
    queryFn: () => getDashboardHistoryRequest(20),
  });

  const overview = overviewQuery.data;
  const history = historyQuery.data || [];

  return (
    <>
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-mint">Results dashboard</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title">Resume performance at a glance</h2>
            <p className="section-copy mt-2 max-w-2xl">
              Review upload history, spot ATS score movement, and identify which resume versions
              deserve another pass.
            </p>
          </div>
        </div>
      </section>

      <div className="panel-grid">
        <StatCard
          label="Total uploads"
          value={overview?.total_uploads ?? 0}
          hint="Stored in MongoDB"
        />
        <StatCard
          label="Average ATS"
          value={overview?.average_ats_score ?? 0}
          hint="Across recent uploads"
        />
        <StatCard
          label="Latest score"
          value={overview?.latest_score ?? "-"}
          hint="Most recent analysis"
        />
        <StatCard
          label="History loaded"
          value={history.length}
          hint="Ready for review"
        />
      </div>

      <ScoreChart data={overview?.score_history || []} />

      <section className="glass-panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-white">Recent analyses</h3>
            <p className="mt-1 text-sm text-slate-400">
              Resume uploads, ATS scores, and highlights from your latest reviews.
            </p>
          </div>
        </div>

        {historyQuery.isLoading ? (
          <div className="mt-6 text-sm text-slate-400">Loading analysis history...</div>
        ) : history.length ? (
          <div className="mt-6 space-y-4">
            {history.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-display text-xl text-white">{item.filename}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="min-w-[220px]">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">ATS score</span>
                      <span className="font-semibold text-white">{item.ats_score}%</span>
                    </div>
                    <ProgressBar value={item.ats_score} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.detected_skills.length ? (
                    item.detected_skills.slice(0, 8).map((skill) => (
                      <KeywordBadge key={skill}>{skill}</KeywordBadge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No skills extracted yet.</span>
                  )}
                </div>

                {item.suggestions.length ? (
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {item.suggestions.map((suggestion) => (
                      <li key={suggestion}>{truncate(suggestion, 160)}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-sm text-slate-400">
            No resume analyses yet. Upload your first PDF to start building history.
          </div>
        )}
      </section>
    </>
  );
}

export default DashboardPage;

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getDashboardHistoryRequest } from "../api/dashboard";
import { matchResumeRequest } from "../api/resume";
import KeywordBadge from "../components/KeywordBadge";
import ProgressBar from "../components/ProgressBar";

function JobMatchPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [error, setError] = useState("");

  const historyQuery = useQuery({
    queryKey: ["dashboard-history", "latest"],
    queryFn: () => getDashboardHistoryRequest(5),
  });

  const matchMutation = useMutation({
    mutationFn: matchResumeRequest,
    onError: (requestError) => {
      setError(requestError.response?.data?.detail || "Keyword matching failed.");
    },
    onSuccess: () => {
      setError("");
    },
  });

  useEffect(() => {
    if (!resumeText && historyQuery.data?.length) {
      setResumeText(historyQuery.data[0].resume_text);
    }
  }, [historyQuery.data, resumeText]);

  function handleSubmit(event) {
    event.preventDefault();
    matchMutation.mutate({
      resume_text: resumeText,
      job_description_text: jobDescriptionText,
    });
  }

  const matchResult = matchMutation.data;

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-mint">Job description matching</p>
        <h2 className="mt-3 section-title">Measure fit against a role</h2>
        <p className="mt-2 section-copy max-w-2xl">
          Paste a resume and job description to surface matched skills, missing keywords, and a
          fast-read fit score.
        </p>

        <form className="mt-8 grid gap-4 xl:grid-cols-2" onSubmit={handleSubmit}>
          <textarea
            className="form-input min-h-[240px] resize-y"
            placeholder="Paste resume text here"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            required
          />
          <textarea
            className="form-input min-h-[240px] resize-y"
            placeholder="Paste job description here"
            value={jobDescriptionText}
            onChange={(event) => setJobDescriptionText(event.target.value)}
            required
          />

          <div className="xl:col-span-2 flex flex-wrap gap-3">
            {historyQuery.data?.length ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setResumeText(historyQuery.data[0].resume_text)}
              >
                Use latest uploaded resume
              </button>
            ) : null}
            <button type="submit" className="primary-button" disabled={matchMutation.isPending}>
              {matchMutation.isPending ? "Matching..." : "Match resume"}
            </button>
          </div>

          {error ? <p className="xl:col-span-2 text-sm text-rose-300">{error}</p> : null}
        </form>
      </section>

      {matchResult ? (
        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Match score</p>
            <h3 className="mt-3 font-display text-5xl text-white">{matchResult.match_score}%</h3>
            <p className="mt-3 text-sm text-slate-400">
              Higher scores mean your resume vocabulary aligns more closely with the role.
            </p>
            <div className="mt-6">
              <ProgressBar value={matchResult.match_score} color="from-coral to-mint" />
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="font-display text-xl text-white">Matched keywords</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {matchResult.matched_keywords.length ? (
                    matchResult.matched_keywords.map((keyword) => (
                      <KeywordBadge key={keyword} tone="success">
                        {keyword}
                      </KeywordBadge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No strong keyword overlap yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-display text-xl text-white">Missing keywords</h4>
                <div className="mt-4 flex flex-wrap gap-2">
                  {matchResult.missing_keywords.length ? (
                    matchResult.missing_keywords.map((keyword) => (
                      <KeywordBadge key={keyword} tone="danger">
                        {keyword}
                      </KeywordBadge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Great coverage. No missing keywords detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default JobMatchPage;

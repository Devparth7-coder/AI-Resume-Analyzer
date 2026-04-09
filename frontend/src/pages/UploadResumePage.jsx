import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, UploadCloud } from "lucide-react";

import { analyzeResumeRequest, improveResumeRequest } from "../api/resume";
import KeywordBadge from "../components/KeywordBadge";
import ProgressBar from "../components/ProgressBar";

function UploadResumePage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [error, setError] = useState("");

  const analyzeMutation = useMutation({
    mutationFn: analyzeResumeRequest,
    onSuccess: (data) => {
      setAnalysis(data);
      setAiFeedback(null);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-history"] });
    },
    onError: (requestError) => {
      setError(requestError.response?.data?.detail || "Resume analysis failed.");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: improveResumeRequest,
    onSuccess: (data) => {
      setAiFeedback(data);
      setError("");
    },
    onError: (requestError) => {
      setError(requestError.response?.data?.detail || "AI feedback could not be generated.");
    },
  });

  function handleAnalyze(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError("Choose a PDF resume before starting analysis.");
      return;
    }

    analyzeMutation.mutate(selectedFile);
  }

  function handleAiFeedback() {
    if (!analysis?.resume_text) {
      return;
    }

    feedbackMutation.mutate({ resume_text: analysis.resume_text });
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-coral">Resume upload</p>
        <h2 className="mt-3 section-title">Analyze a PDF resume</h2>
        <p className="mt-2 section-copy max-w-2xl">
          Upload a resume to extract candidate signals, calculate ATS readiness, and unlock AI
          feedback on tone, structure, and impact.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleAnalyze}>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
            <UploadCloud className="h-10 w-10 text-mint" />
            <span className="mt-4 font-medium text-white">
              {selectedFile ? selectedFile.name : "Choose a PDF resume"}
            </span>
            <span className="mt-2 text-sm text-slate-400">Maximum upload size: 5 MB</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={analyzeMutation.isPending}>
            {analyzeMutation.isPending ? "Analyzing resume..." : "Analyze resume"}
          </button>
        </form>
      </section>

      {analysis ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Analysis result</p>
                <h3 className="mt-2 font-display text-2xl text-white">{analysis.filename}</h3>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">ATS score</p>
                <p className="mt-2 font-display text-3xl text-white">{analysis.ats_score}%</p>
              </div>
            </div>

            <div className="mt-5">
              <ProgressBar value={analysis.ats_score} />
            </div>

            <div className="mt-6">
              <h4 className="font-display text-lg text-white">Detected skills</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.detected_skills.length ? (
                  analysis.detected_skills.map((skill) => (
                    <KeywordBadge key={skill}>{skill}</KeywordBadge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No skills detected from this resume.</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-display text-lg text-white">Suggestions</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {analysis.suggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display text-lg text-white">Education</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {analysis.extracted_data.education.length ? (
                    analysis.extracted_data.education.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li className="text-slate-500">No education lines extracted.</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-display text-lg text-white">Experience</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {analysis.extracted_data.experience.length ? (
                    analysis.extracted_data.experience.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li className="text-slate-500">No experience lines extracted.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">AI feedback</p>
                <h3 className="mt-2 font-display text-2xl text-white">Actionable rewrite guidance</h3>
              </div>
              <button
                type="button"
                onClick={handleAiFeedback}
                className="secondary-button"
                disabled={feedbackMutation.isPending}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {feedbackMutation.isPending ? "Generating..." : "Generate AI feedback"}
              </button>
            </div>

            {aiFeedback ? (
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-display text-lg text-white">Strengths</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {aiFeedback.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-lg text-white">Weaknesses</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {aiFeedback.weaknesses.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-lg text-white">Improvement suggestions</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {aiFeedback.improvement_suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-6 text-slate-400">
                Generate structured AI coaching after the ATS analysis to get strengths,
                weaknesses, and resume rewrite suggestions.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default UploadResumePage;

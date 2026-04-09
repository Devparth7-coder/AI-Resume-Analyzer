import { ArrowRight, ScanText, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    title: "ATS-first analysis",
    description: "Parse PDF resumes, extract skills, and benchmark structure with practical scoring.",
    icon: ScanText,
  },
  {
    title: "Structured AI coaching",
    description: "Generate strengths, weaknesses, and improvement guidance with OpenAI-powered feedback.",
    icon: Sparkles,
  },
  {
    title: "Secure SaaS workflow",
    description: "JWT auth, MongoDB-backed history, and deployment-ready separation for Vercel + Render.",
    icon: ShieldCheck,
  },
];

function HomePage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel rounded-[36px] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-mint">Production-ready SaaS</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
                Build sharper resumes, faster.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Analyze PDF resumes, compare them against job descriptions, and generate AI-backed
                improvement plans from a polished dark-mode dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="primary-button">
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/login" className="secondary-button">
                Sign in
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[32px] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-coral">Workflow</p>
            <div className="mt-5 space-y-6">
              <div>
                <h2 className="font-display text-2xl text-white">Upload a resume</h2>
                <p className="mt-2 section-copy">
                  Extract clean text from PDF files, identify education and experience, and detect
                  the technical keywords recruiters care about.
                </p>
              </div>
              <div>
                <h2 className="font-display text-2xl text-white">Match to any job description</h2>
                <p className="mt-2 section-copy">
                  Compare resume content against hiring criteria, surface missing keywords, and
                  quantify fit with a clear percentage score.
                </p>
              </div>
              <div>
                <h2 className="font-display text-2xl text-white">Refine with AI feedback</h2>
                <p className="mt-2 section-copy">
                  Generate structured guidance that helps candidates tighten language, quantify
                  impact, and improve ATS visibility.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-panel rounded-[28px] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5 text-mint" />
                  </div>
                  <h3 className="mt-5 font-display text-xl text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;

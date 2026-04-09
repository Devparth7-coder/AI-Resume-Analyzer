import { BarChart3, FileUp, LogOut, ScanSearch } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/upload", label: "Upload Resume", icon: FileUp },
  { to: "/match", label: "Job Match", icon: ScanSearch },
];

function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="glass-panel rounded-[32px] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-mint">AI Resume Analyzer</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-white">
              Candidate command center
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Review ATS readiness, spot missing keywords, and sharpen each resume revision.
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
            <p className="mt-2 font-medium text-white">{user?.full_name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          <button type="button" onClick={logout} className="secondary-button mt-6 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </aside>

        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

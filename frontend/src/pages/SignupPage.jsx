import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-coral">Launch your workspace</p>
        <h1 className="mt-4 font-display text-3xl text-white">Create your account</h1>
        <p className="mt-3 text-sm text-slate-400">
          Save uploads, monitor ATS scores, and build a stronger application workflow.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            className="form-input"
            value={form.full_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, full_name: event.target.value }))
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="form-input"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" className="primary-button w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-mint">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;

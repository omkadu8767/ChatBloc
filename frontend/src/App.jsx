import { useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AuthForm from "./components/AuthForm";
import ChatPage from "./components/ChatPage";
import HomePage from "./components/HomePage";
import { loginUser, registerUser } from "./services/api";

const userStorageKey = "auth_user";

function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem(userStorageKey);
    return value ? JSON.parse(value) : null;
  });

  const titleText = useMemo(() => {
    return "End-to-End Integrity Verified Messaging";
  }, []);

  function tabClassName({ isActive }) {
    const base = "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition";
    if (isActive) {
      return `${base} bg-cyan-400 text-slate-950`;
    }

    return `${base} text-cyan-100 hover:bg-cyan-500/20`;
  }

  async function handleAuthSubmit(payload) {
    setLoading(true);
    setError("");

    try {
      const action = mode === "login" ? loginUser : registerUser;
      const response = await action(payload);

      localStorage.setItem("token", response.token);
      localStorage.setItem(userStorageKey, JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
      navigate("/chat", { replace: true });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem(userStorageKey);
    setToken("");
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

      <header className="mx-auto mb-8 w-full max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 backdrop-blur-xl">
          <NavLink className="text-lg font-bold text-cyan-300" to="/">
            ChatBloc
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink className={tabClassName} to="/">
              Home
            </NavLink>
            {!user && (
              <NavLink className={tabClassName} to="/login">
                Login
              </NavLink>
            )}
            {user && (
              <NavLink className={tabClassName} to="/chat">
                Chat
              </NavLink>
            )}
            {user && (
              <button
                className="rounded-lg border border-rose-300/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200 transition hover:bg-rose-500/20"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-5xl">{titleText}</h1>
      </header>

      {error && (
        <div className="mx-auto mb-4 w-full max-w-6xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<HomePage onGetStarted={() => navigate(user ? "/chat" : "/login")} />}
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/chat" replace />
            ) : (
              <AuthForm
                mode={mode}
                loading={loading}
                onSubmit={handleAuthSubmit}
                onModeChange={() => setMode((previous) => (previous === "login" ? "register" : "login"))}
              />
            )
          }
        />
        <Route
          path="/chat"
          element={
            user ? (
              <ChatPage user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <a href="https://www.linkedin.com/in/om-kadu-53305425a/" target="_blank"><footer className="mx-auto mt-10 w-full max-w-6xl border-t border-cyan-400/20 pt-6 text-center">
        <p className="text-sm font-medium text-cyan-300">Made with Love by OK</p>
      </footer></a>
    </div>
  );
}

export default App;

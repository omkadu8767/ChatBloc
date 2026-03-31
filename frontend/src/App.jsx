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
    const base = "rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition sm:text-xs sm:tracking-[0.2em]";
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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

      <header className="mx-auto mb-6 w-full max-w-6xl sm:mb-8">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <NavLink className="text-lg font-bold text-cyan-300" to="/">
            ChatBloc
          </NavLink>
          <nav className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
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
        <h1 className="mt-3 max-w-3xl text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{titleText}</h1>
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

      <footer className="mx-auto mt-8 w-full max-w-6xl border-t border-cyan-400/20 pt-5 text-center sm:mt-10 sm:pt-6">
        <a
          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          href="https://www.linkedin.com/in/om-kadu-53305425a/"
          target="_blank"
          rel="noreferrer"
        >
          Made with Love by OK
        </a>
      </footer>
    </div>
  );
}

export default App;

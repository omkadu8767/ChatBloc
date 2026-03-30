import { useMemo, useState } from "react";

import AuthForm from "./components/AuthForm";
import ChatPage from "./components/ChatPage";
import { loginUser, registerUser } from "./services/api";

const userStorageKey = "auth_user";

function App() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem(userStorageKey);
    return value ? JSON.parse(value) : null;
  });

  const titleText = useMemo(() => {
    if (user) {
      return "End-to-End Integrity Verified Messaging";
    }

    return "Cryptography + Blockchain Messaging Demo";
  }, [user]);

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
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

      <header className="mx-auto mb-8 w-full max-w-6xl">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-200">Secure MERN Messaging</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-5xl">{titleText}</h1>
      </header>

      {error && (
        <div className="mx-auto mb-4 w-full max-w-6xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!user ? (
        <AuthForm
          mode={mode}
          loading={loading}
          onSubmit={handleAuthSubmit}
          onModeChange={() => setMode((previous) => (previous === "login" ? "register" : "login"))}
        />
      ) : (
        <ChatPage user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

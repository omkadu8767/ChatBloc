import { KeyRound, Mail, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

const initialState = {
    name: "",
    email: "",
    password: "",
};

function AuthForm({ mode, loading, onSubmit, onModeChange }) {
    const [formState, setFormState] = useState(initialState);

    const title = useMemo(() => {
        return mode === "login" ? "Secure Login" : "Create Account";
    }, [mode]);

    const subtitle =
        mode === "login"
            ? "Decrypt conversations with your authenticated session"
            : "Join the encrypted messaging network";

    function handleChange(event) {
        const { name, value } = event.target;
        setFormState((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        await onSubmit(formState);

        setFormState((previous) => ({
            ...initialState,
            email: previous.email,
        }));
    }

    return (
        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-slate-950/70 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Cipher Chat</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                {mode === "register" && (
                    <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                            <UserRound size={16} />
                            Name
                        </span>
                        <input
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                            name="name"
                            placeholder="Ada Lovelace"
                            value={formState.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                )}

                <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                        <Mail size={16} />
                        Email
                    </span>
                    <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formState.email}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm text-slate-200">
                        <KeyRound size={16} />
                        Password
                    </span>
                    <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        name="password"
                        type="password"
                        placeholder="Strong password"
                        value={formState.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                    />
                </label>

                <button
                    className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
                </button>
            </form>

            <button
                className="mt-6 text-sm text-cyan-200 transition hover:text-cyan-100"
                type="button"
                onClick={onModeChange}
            >
                {mode === "login"
                    ? "Need an account? Register"
                    : "Already have an account? Login"}
            </button>
        </section>
    );
}

export default AuthForm;

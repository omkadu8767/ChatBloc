import { CheckCircle2, Clock3, LockKeyhole, ShieldAlert } from "lucide-react";

function MessageBubble({ item, self, onVerify }) {
    const verificationStatus = item.verificationStatus;
    const badgeClass = item.valid
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-rose-500/30 bg-rose-500/10 text-rose-300";

    return (
        <article
            className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-xl transition sm:max-w-[70%] ${self
                ? "ml-auto border-cyan-400/40 bg-cyan-500/10"
                : "border-white/10 bg-slate-900/70"
                }`}
        >
            <header className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1">
                    <LockKeyhole size={14} />
                    encrypted
                </span>
                <span>{new Date(item.timestamp).toLocaleString()}</span>
            </header>

            <p className="mb-2 break-all rounded-lg bg-black/25 p-2 text-cyan-100">{item.encryptedMessage}</p>
            <p className="rounded-lg bg-white/5 p-2 text-slate-100">{item.decryptedMessage}</p>

            <footer className="mt-3 flex items-center justify-between gap-3">
                {verificationStatus === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                        <Clock3 size={14} />
                        Confirming on chain
                    </span>
                )}

                {verificationStatus === "failed" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300">
                        <ShieldAlert size={14} />
                        Chain sync failed
                    </span>
                )}

                {typeof item.valid === "boolean" ? (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${badgeClass}`}>
                        {item.valid ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
                        {item.valid ? "Verified" : "Tampered"}
                    </span>
                ) : verificationStatus !== "pending" && verificationStatus !== "failed" ? (
                    <button
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
                        type="button"
                        onClick={() => onVerify(item.id)}
                    >
                        Verify message
                    </button>
                ) : null}

                <span className="max-w-[220px] truncate text-xs text-slate-400">SHA-256: {item.hash}</span>
            </footer>
        </article>
    );
}

export default MessageBubble;

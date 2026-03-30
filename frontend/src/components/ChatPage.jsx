import { LogOut, SendHorizonal, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

import {
    fetchConversation,
    fetchUsers,
    sendSecureMessage,
    verifySecureMessage,
} from "../services/api";
import MessageBubble from "./MessageBubble";

function ChatPage({ user, token, onLogout }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const selectedUserIdRef = useRef("");

    const selectedUser = useMemo(() => {
        return users.find((item) => item._id === selectedUserId);
    }, [users, selectedUserId]);

    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;
    }, [selectedUserId]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        const socketBase = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        const socket = io(socketBase, {
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;
        socket.emit("join", user.id);
        socket.on("new_message", () => {
            const activePeerId = selectedUserIdRef.current;
            if (activePeerId) {
                loadMessages(activePeerId).catch((error) => {
                    console.error(error);
                });
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, user.id]);

    useEffect(() => {
        async function loadUsers() {
            const response = await fetchUsers();
            setUsers(response.data || []);
            if ((response.data || []).length > 0) {
                setSelectedUserId(response.data[0]._id);
            }
        }

        loadUsers().catch((error) => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            loadMessages(selectedUserId).catch((error) => {
                console.error(error);
            });
        }
    }, [selectedUserId]);

    async function loadMessages(peerId) {
        const response = await fetchConversation(peerId);
        const conversation = response.data || [];

        const withVerification = await Promise.all(
            conversation.map(async (item) => {
                try {
                    const verifyResponse = await verifySecureMessage(item.id);
                    return {
                        ...item,
                        valid: verifyResponse.data.valid,
                    };
                } catch (_error) {
                    return {
                        ...item,
                        valid: false,
                    };
                }
            })
        );

        setMessages(withVerification);
    }

    async function handleSend(event) {
        event.preventDefault();

        if (!selectedUserId || !draft.trim()) {
            return;
        }

        setLoading(true);
        try {
            await sendSecureMessage({
                receiverId: selectedUserId,
                message: draft,
            });
            setDraft("");
            await loadMessages(selectedUserId);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify(messageId) {
        const response = await verifySecureMessage(messageId);

        setMessages((previous) =>
            previous.map((item) =>
                item.id === messageId
                    ? {
                        ...item,
                        valid: response.data.valid,
                    }
                    : item
            )
        );
    }

    return (
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-3xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-xl">
                <header className="mb-4 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Logged in</p>
                        <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                    </div>
                    <button
                        className="rounded-xl border border-white/20 px-3 py-2 text-slate-200 transition hover:border-rose-300 hover:text-rose-200"
                        type="button"
                        onClick={onLogout}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </header>

                <p className="mb-3 text-xs text-slate-400">Choose receiver</p>
                <div className="space-y-2">
                    {users.map((item) => (
                        <button
                            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${selectedUserId === item._id
                                ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
                                : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                                }`}
                            key={item._id}
                            type="button"
                            onClick={() => setSelectedUserId(item._id)}
                        >
                            <p className="font-medium">{item.name}</p>
                            <p className="truncate text-xs text-slate-400">{item.email}</p>
                        </button>
                    ))}
                    {users.length === 0 && <p className="text-xs text-slate-400">No users available yet.</p>}
                </div>
            </aside>

            <main className="rounded-3xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-xl">
                <header className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Secure Conversation</p>
                        <h3 className="text-xl font-semibold text-white">
                            {selectedUser ? selectedUser.name : "Select a receiver"}
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        <ShieldCheck size={14} />
                        AES + SHA-256 + Blockchain
                    </span>
                </header>

                <section className="mb-4 flex h-[460px] flex-col gap-3 overflow-y-auto rounded-2xl bg-black/20 p-3">
                    {messages.map((item) => (
                        <MessageBubble
                            key={item.id}
                            item={item}
                            self={String(item.sender) === String(user.id)}
                            onVerify={handleVerify}
                        />
                    ))}
                    {messages.length === 0 && (
                        <p className="m-auto text-sm text-slate-400">Send your first encrypted message.</p>
                    )}
                </section>

                <form className="flex gap-2" onSubmit={handleSend}>
                    <input
                        className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                        placeholder="Write secure message..."
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                    />
                    <button
                        className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        type="submit"
                        disabled={loading || !selectedUserId}
                    >
                        <SendHorizonal size={18} />
                    </button>
                </form>
            </main>
        </section>
    );
}

export default ChatPage;

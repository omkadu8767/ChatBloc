import { Skeleton } from "boneyard-js/react";
import { LoaderCircle, LogOut, SendHorizonal, ShieldCheck } from "lucide-react";
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
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const selectedUserIdRef = useRef("");
    const selectedChatStorageKey = `selected_chat_user_${user.id}`;

    const selectedUser = useMemo(() => {
        return users.find((item) => item._id === selectedUserId);
    }, [users, selectedUserId]);

    function isEventForActiveConversation(payload) {
        const activePeerId = selectedUserIdRef.current;

        if (!activePeerId || !payload?.sender || !payload?.receiver) {
            return false;
        }

        const sender = String(payload.sender);
        const receiver = String(payload.receiver);
        const me = String(user.id);

        return (
            (sender === me && receiver === activePeerId) ||
            (receiver === me && sender === activePeerId)
        );
    }

    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;

        if (selectedUserId) {
            localStorage.setItem(selectedChatStorageKey, selectedUserId);
        }
    }, [selectedUserId, selectedChatStorageKey]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        const socketBase = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
        const socket = io(socketBase, {
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;
        const joinCurrentUserRoom = () => {
            socket.emit("join", user.id);
        };

        socket.on("connect", joinCurrentUserRoom);
        socket.on("new_message", (payload) => {
            if (isEventForActiveConversation(payload)) {
                loadMessages(selectedUserIdRef.current).catch((error) => {
                    console.error(error);
                });
            }
        });

        socket.on("message_chain_update", (payload) => {
            if (isEventForActiveConversation(payload)) {
                loadMessages(selectedUserIdRef.current).catch((error) => {
                    console.error(error);
                });
            }
        });

        if (socket.connected) {
            joinCurrentUserRoom();
        }

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, user.id]);

    useEffect(() => {
        const hasPending = messages.some(
            (item) => item.verificationStatus === "pending" || item.chainStatus === "pending"
        );

        if (!selectedUserId || !hasPending) {
            return undefined;
        }

        const timer = setInterval(() => {
            loadMessages(selectedUserId).catch((error) => {
                console.error(error);
            });
        }, 6000);

        return () => clearInterval(timer);
    }, [messages, selectedUserId]);

    useEffect(() => {
        async function loadUsers() {
            setUsersLoading(true);
            try {
                const response = await fetchUsers();
                const fetchedUsers = response.data || [];
                setUsers(fetchedUsers);

                if (fetchedUsers.length === 0) {
                    setSelectedUserId("");
                    return;
                }

                const persistedUserId = localStorage.getItem(selectedChatStorageKey);
                const persistedExists = fetchedUsers.some((item) => item._id === persistedUserId);

                if (persistedExists) {
                    setSelectedUserId(persistedUserId);
                    return;
                }

                setSelectedUserId(fetchedUsers[0]._id);
            } finally {
                setUsersLoading(false);
            }
        }

        loadUsers().catch((error) => {
            console.error(error);
        });
    }, [selectedChatStorageKey]);

    useEffect(() => {
        if (selectedUserId) {
            loadMessages(selectedUserId, { withLoading: true }).catch((error) => {
                console.error(error);
            });
        }
    }, [selectedUserId]);

    async function loadMessages(peerId, options = {}) {
        const { withLoading = false } = options;

        if (withLoading) {
            setMessagesLoading(true);
        }

        try {
            const response = await fetchConversation(peerId);
            const conversation = response.data || [];

            const withVerification = await Promise.all(
                conversation.map(async (item) => {
                    try {
                        const verifyResponse = await verifySecureMessage(item.id);
                        const verification = verifyResponse.data || {};

                        return {
                            ...item,
                            valid: typeof verification.valid === "boolean" ? verification.valid : undefined,
                            verificationStatus: verification.verificationStatus,
                        };
                    } catch (_error) {
                        return {
                            ...item,
                            valid: undefined,
                            verificationStatus: "failed",
                        };
                    }
                })
            );

            setMessages(withVerification);
        } finally {
            if (withLoading) {
                setMessagesLoading(false);
            }
        }
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
        const verification = response.data || {};

        setMessages((previous) =>
            previous.map((item) =>
                item.id === messageId
                    ? {
                        ...item,
                        valid: typeof verification.valid === "boolean" ? verification.valid : undefined,
                        verificationStatus: verification.verificationStatus,
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
                <Skeleton
                    name="chat-user-list"
                    loading={usersLoading}
                    fallback={(
                        <div className="max-h-56 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    className="h-14 rounded-xl border border-white/10 bg-white/5"
                                    key={`user-skeleton-${index}`}
                                />
                            ))}
                        </div>
                    )}
                >
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
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
                </Skeleton>
            </aside>

            <main className="rounded-3xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-xl">
                <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4 sm:items-center">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Secure Conversation</p>
                        <h3 className="text-lg font-semibold text-white sm:text-xl">
                            {selectedUser ? selectedUser.name : "Select a receiver"}
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 sm:text-xs">
                        <ShieldCheck size={14} />
                        AES + SHA-256 + Blockchain
                    </span>
                </header>

                <Skeleton
                    name="chat-message-list"
                    loading={messagesLoading}
                    fallback={(
                        <section className="mb-4 flex h-[52vh] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-2xl bg-black/20 p-3 sm:h-[460px]">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    className="h-24 rounded-2xl border border-white/10 bg-white/5"
                                    key={`message-skeleton-${index}`}
                                />
                            ))}
                        </section>
                    )}
                >
                    <section className="mb-4 flex h-[52vh] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-2xl bg-black/20 p-3 sm:h-[460px]">
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
                </Skeleton>

                <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSend}>
                    <div className="w-full">
                        <input
                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                            placeholder="Write secure message..."
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            disabled={loading}
                        />
                        {loading && (
                            <p className="mt-2 text-xs text-cyan-200">Sending securely to server and blockchain...</p>
                        )}
                    </div>
                    <button
                        className="inline-flex w-full min-w-[112px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        type="submit"
                        disabled={loading || !selectedUserId}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle className="animate-spin" size={18} />
                                <span className="text-sm font-medium">Sending</span>
                            </>
                        ) : (
                            <SendHorizonal size={18} />
                        )}
                    </button>
                </form>
            </main>
        </section>
    );
}

export default ChatPage;
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export async function registerUser(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
}

export async function loginUser(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
}

export async function fetchUsers() {
    const { data } = await api.get("/auth/users");
    return data;
}

export async function sendSecureMessage(payload) {
    const { data } = await api.post("/message/send", payload);
    return data;
}

export async function fetchConversation(userId) {
    const { data } = await api.get(`/message/${userId}`);
    return data;
}

export async function verifySecureMessage(messageId) {
    const { data } = await api.post("/message/verify", { messageId });
    return data;
}

export default api;

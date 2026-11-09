import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { tokenStorage } from "./tokenStorage";

export const API_URL =
    Platform.OS === "web"
        ? "http://localhost:8000/api"
        : (process.env.EXPO_PUBLIC_API_URL as string);

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
    const token = await tokenStorage.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshing: Promise<string | null> | null = null;

async function renovarAccess(): Promise<string | null> {
    const refresh = await tokenStorage.getRefresh();
    if (!refresh) return null;
    try {
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
        await tokenStorage.setAccess(data.access);
        return data.access as string;
    } catch {
        await tokenStorage.clear();
        return null;
    }
}

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const esAuth =
            original?.url?.includes("/auth/login") || original?.url?.includes("/auth/token/refresh");
        if (error.response?.status === 401 && original && !original._retry && !esAuth) {
            original._retry = true;
            refreshing = refreshing ?? renovarAccess().finally(() => (refreshing = null));
            const nuevo = await refreshing;
            if (nuevo) {
                original.headers.Authorization = `Bearer ${nuevo}`;
                return api(original);
            }
        }
        return Promise.reject(error);
    }
);
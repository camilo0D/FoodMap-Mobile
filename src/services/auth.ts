import { api } from "./api";
import { tokenStorage } from "./tokenStorage";
import type { LoginResponse } from "../types";

export async function login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>("/auth/login/", { username, password });
    await tokenStorage.saveSession(data.access, data.refresh, data.user);
    return data.user;
}

export const registerUser = (username: string, email: string, password: string) =>
    api.post("/auth/register/", { username, email, password });

export const registerRestaurant = (username: string, email: string, password: string) =>
    api.post("/auth/register/restaurant/", { username, email, password });

export async function logout() {
    const refresh = await tokenStorage.getRefresh();
    try {
        if (refresh) await api.post("/auth/logout/", { refresh });
    } finally {
        await tokenStorage.clear();
    }
}

export const solicitarCodigo = (email: string) =>
    api.post("/auth/password-reset/request/", { email });

export const restablecerClave = (email: string, code: string, password: string) =>
    api.post("/auth/password-reset/confirm/", { email, code, password });
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const web = Platform.OS === "web";
const get = (k: string) => (web ? Promise.resolve(localStorage.getItem(k)) : SecureStore.getItemAsync(k));
const set = async (k: string, v: string) => (web ? localStorage.setItem(k, v) : SecureStore.setItemAsync(k, v));
const del = async (k: string) => (web ? localStorage.removeItem(k) : SecureStore.deleteItemAsync(k));

export const tokenStorage = {
    getAccess: () => get("access"),
    getRefresh: () => get("refresh"),
    async saveSession(access: string, refresh: string, user: unknown) {
        await set("access", access);
        await set("refresh", refresh);
        await set("user", JSON.stringify(user));
    },
    setAccess: (access: string) => set("access", access),
    async getUser() {
        const raw = await get("user");
        return raw ? JSON.parse(raw) : null;
    },
    async clear() {
        await del("access");
        await del("refresh");
        await del("user");
    },
};

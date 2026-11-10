import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const web = Platform.OS === "web";

export const prefs = {
    get: (k: string): Promise<string | null> =>
        web ? Promise.resolve(localStorage.getItem(k)) : SecureStore.getItemAsync(k),
    async set(k: string, v: string) {
        if (web) localStorage.setItem(k, v);
        else await SecureStore.setItemAsync(k, v);
    },
};
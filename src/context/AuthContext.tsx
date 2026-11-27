import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { tokenStorage } from "../services/tokenStorage";
import * as authService from "../services/auth";
import type { Usuario } from "../types";

// Lugar al que se vuelve después de iniciar sesión (modo invitado).
export type Destino = { name: "Detalle" | "Ruta"; params: any };

type AuthState = {
    usuario: Usuario | null;
    cargando: boolean;
    login: (identificador: string, clave: string) => Promise<Usuario>;
    loginGoogle: (idToken: string, tipo?: "usuario" | "restaurante") => Promise<Usuario>;
    logout: () => Promise<void>;
    destinoPendiente: () => Destino | null;
    guardarDestino: (d: Destino | null) => void;
};

const AuthContext = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);
    // Se guarda en una referencia (no en estado) para no re-renderizar toda la app. Vence a los 15 minutos.
    const destino = useRef<{ d: Destino; t: number } | null>(null);
    const guardarDestino = (d: Destino | null) => {
        destino.current = d ? { d, t: Date.now() } : null;
    };
    const destinoPendiente = () => {
        const x = destino.current;
        if (!x) return null;
        if (Date.now() - x.t > 15 * 60 * 1000) {
            destino.current = null;
            return null;
        }
        return x.d;
    };

    useEffect(() => {
        (async () => {
            const [token, guardado] = await Promise.all([tokenStorage.getAccess(), tokenStorage.getUser()]);
            if (token && guardado) {
                try {
                    await api.get("/auth/protected/"); // valida el token (y lo renueva si expiró)
                    setUsuario(guardado);
                } catch (e: any) {
                    if (e?.response) await tokenStorage.clear(); // sesión inválida
                    else setUsuario(guardado); // sin conexión: conserva la sesión
                }
            }
            setCargando(false);
        })();
    }, []);

    const login = async (identificador: string, clave: string) => {
        const u = await authService.login(identificador, clave);
        setUsuario(u);
        return u;
    };

    const loginGoogle = async (idToken: string, tipo?: "usuario" | "restaurante") => {
        const u = await authService.loginConGoogle(idToken, tipo);
        setUsuario(u);
        return u;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch {
            /* aunque falle el servidor, se cierra la sesión local */
        } finally {
            await tokenStorage.clear();
            setUsuario(null);
        }
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, loginGoogle, logout, destinoPendiente, guardarDestino }}>
            {children}
        </AuthContext.Provider>
    );
}
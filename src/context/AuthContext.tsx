import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { tokenStorage } from "../services/tokenStorage";
import * as authService from "../services/auth";
import type { Usuario } from "../types";

type AuthState = {
    usuario: Usuario | null;
    cargando: boolean;
    login: (identificador: string, clave: string) => Promise<Usuario>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);

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

    const logout = async () => {
        await authService.logout();
        setUsuario(null);
    };

    return <AuthContext.Provider value={{ usuario, cargando, login, logout }}>{children}</AuthContext.Provider>;
}
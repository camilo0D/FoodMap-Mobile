import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { agregarFavorito, getFavoritos, quitarFavorito } from "../services/favorites";
import type { Restaurante } from "../types";

type FavoritesState = {
    favoritos: Restaurante[];
    esFavorito: (id: string) => boolean;
    toggle: (r: Restaurante) => Promise<void>;
    recargar: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesState>(null as unknown as FavoritesState);
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { usuario } = useAuth();
    const [favoritos, setFavoritos] = useState<Restaurante[]>([]);
    const ids = useMemo(() => new Set(favoritos.map((f) => f.id)), [favoritos]);

    const recargar = useCallback(async () => {
        try {
            setFavoritos(await getFavoritos());
        } catch {
            /* se conserva la lista actual */
        }
    }, []);

    useEffect(() => {
        if (usuario) recargar();
        else setFavoritos([]);
    }, [usuario, recargar]);

    const toggle = async (r: Restaurante) => {
        const era = ids.has(r.id);
        setFavoritos((prev) => (era ? prev.filter((x) => x.id !== r.id) : [r, ...prev]));
        try {
            if (era) await quitarFavorito(r.id);
            else await agregarFavorito(r.id);
        } catch {
            setFavoritos((prev) => (era ? [r, ...prev] : prev.filter((x) => x.id !== r.id)));
        }
    };

    return (
        <FavoritesContext.Provider value={{ favoritos, esFavorito: (id) => ids.has(id), toggle, recargar }}>
            {children}
        </FavoritesContext.Provider>
    );
}
import { useCallback, useEffect, useState } from "react";
import { getRestaurantes } from "../services/restaurant";
import type { Restaurante } from "../types";

export function useRestaurantes() {
    const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
    const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

    const cargar = useCallback(async () => {
        try {
            setRestaurantes(await getRestaurantes());
            setEstado("ok");
        } catch {
            setEstado("error");
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { restaurantes, estado, recargar: cargar };
}
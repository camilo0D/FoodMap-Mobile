import { useCallback, useState } from "react";
import * as Location from "expo-location";
import type { Coord } from "../utils/geo";

export type EstadoUbicacion = "inactiva" | "cargando" | "ok" | "denegada";

export function useUserLocation() {
    const [ubicacion, setUbicacion] = useState<Coord | null>(null);
    const [estado, setEstado] = useState<EstadoUbicacion>("inactiva");

    const solicitar = useCallback(async (): Promise<Coord | null> => {
        setEstado("cargando");
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setEstado("denegada");
                return null;
            }
            const pos = await Location.getCurrentPositionAsync({});
            const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUbicacion(c);
            setEstado("ok");
            return c;
        } catch {
            setEstado("denegada");
            return null;
        }
    }, []);

    return { ubicacion, estado, solicitar };
}
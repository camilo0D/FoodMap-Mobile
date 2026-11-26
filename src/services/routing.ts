import type { Coord } from "../utils/geo";

export type Modo = "carro" | "pie";
export type Ruta = { puntos: Coord[]; distanciaM: number; duracionS: number; estimada?: boolean };

// Servidores públicos de OSRM (OpenStreetMap). Son para uso razonable y no comercial:
// para publicar la app conviene un servidor propio o un proveedor de rutas.
const SERVIDORES: Record<Modo, string[]> = {
    carro: [
        "https://router.project-osrm.org/route/v1/driving",
        "https://routing.openstreetmap.de/routed-car/route/v1/driving",
    ],
    pie: [
        "https://routing.openstreetmap.de/routed-foot/route/v1/driving",
        "https://routing.openstreetmap.de/routed-foot/route/v1/foot",
    ],
};

const VELOCIDAD_A_PIE_MS = 5000 / 3600; // 5 km/h

async function pedir(base: string, a: Coord, b: Coord, signal?: AbortSignal): Promise<Ruta | null> {
    const coords = `${a.lng},${a.lat};${b.lng},${b.lat}`;
    const r = await fetch(`${base}/${coords}?overview=full&geometries=geojson`, { signal });
    if (!r.ok) return null;
    const d = await r.json();
    const ruta = d?.routes?.[0];
    if (d?.code !== "Ok" || !ruta?.geometry?.coordinates) return null;
    return {
        puntos: ruta.geometry.coordinates.map((c: number[]) => ({ lat: c[1], lng: c[0] })),
        distanciaM: ruta.distance,
        duracionS: ruta.duration,
    };
}

export async function obtenerRuta(a: Coord, b: Coord, modo: Modo, signal?: AbortSignal): Promise<Ruta> {
    for (const base of SERVIDORES[modo]) {
        try {
            const ruta = await pedir(base, a, b, signal);
            if (ruta) return ruta;
        } catch (e) {
            if (signal?.aborted) throw e;
        }
    }
    // Sin servidor de rutas a pie: se usa el trazado en carro con el tiempo a 5 km/h.
    if (modo === "pie") {
        for (const base of SERVIDORES.carro) {
            try {
                const ruta = await pedir(base, a, b, signal);
                if (ruta) return { ...ruta, duracionS: ruta.distanciaM / VELOCIDAD_A_PIE_MS, estimada: true };
            } catch (e) {
                if (signal?.aborted) throw e;
            }
        }
    }
    throw new Error("No se pudo calcular la ruta");
}
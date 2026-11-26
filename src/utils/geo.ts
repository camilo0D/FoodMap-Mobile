export type Coord = { lat: number; lng: number };

export function distanciaKm(a: Coord, b: Coord): number {
    const R = 6371;
    const rad = (x: number) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

// Polígono (GeoJSON) que aproxima un círculo de `radioM` metros alrededor de `c`.
export function circuloGeoJSON(c: Coord, radioM: number, pasos = 64) {
    const R = 6378137;
    const latR = (c.lat * Math.PI) / 180;
    const coords: [number, number][] = [];
    for (let i = 0; i <= pasos; i++) {
        const ang = (i / pasos) * 2 * Math.PI;
        const dLat = (radioM * Math.cos(ang)) / R;
        const dLng = (radioM * Math.sin(ang)) / (R * Math.cos(latR));
        coords.push([c.lng + (dLng * 180) / Math.PI, c.lat + (dLat * 180) / Math.PI]);
    }
    return {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Polygon" as const, coordinates: [coords] },
    };
}

export function lineaGeoJSON(puntos: Coord[]) {
    return {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: puntos.map((p) => [p.lng, p.lat]) },
    };
}

// Centro y zoom aproximado para que quepan todos los puntos en pantalla.
export function encuadre(puntos: Coord[]) {
    const lats = puntos.map((p) => p.lat);
    const lngs = puntos.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const span = Math.max(maxLat - minLat, maxLng - minLng, 0.0005);
    const zoom = Math.max(3, Math.min(17, Math.log2(420 / span)));
    return { centro: { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 }, zoom };
}

export function formatoDistancia(m: number): string {
    if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
    return `${(m / 1000).toFixed(1)} km`;
}

export function formatoDuracion(s: number): string {
    const min = Math.max(1, Math.round(s / 60));
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
}
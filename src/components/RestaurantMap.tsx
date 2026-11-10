import { useEffect } from "react";
import { View } from "react-native";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import type { Restaurante } from "../types";
import type { Coord } from "../utils/geo";

type Props = {
    restaurantes: Restaurante[];
    seleccionadoId?: string | null;
    onSelect: (r: Restaurante) => void;
    ubicacion?: Coord | null;
    centerSignal?: number;
};

function circulo(color: string, t: number) {
    return L.divIcon({
        className: "",
        html: `<div style="width:${t}px;height:${t}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [t, t],
        iconAnchor: [t / 2, t / 2],
    });
}

function Centrar({ ubicacion, senal }: { ubicacion?: Coord | null; senal?: number }) {
    const map = useMap();
    useEffect(() => {
        if (senal && ubicacion) map.flyTo([ubicacion.lat, ubicacion.lng], 15);
    }, [senal]);
    return null;
}

export default function RestaurantMap({ restaurantes, seleccionadoId, onSelect, ubicacion, centerSignal }: Props) {
    useEffect(() => {
        if (document.getElementById("leaflet-css")) return;
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }, []);

    return (
        <View style={{ flex: 1, zIndex: 0 }}>
            <MapContainer
                center={[3.8801, -77.0311]}
                zoom={13}
                zoomControl={false}
                style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            >
                <TileLayer attribution="© OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Centrar ubicacion={ubicacion} senal={centerSignal} />
                {restaurantes
                    .filter((r) => r.latitud && r.longitud)
                    .map((r) => (
                        <Marker
                            key={r.id}
                            position={[Number(r.latitud), Number(r.longitud)]}
                            icon={r.id === seleccionadoId ? circulo("#D83A1B", 38) : circulo("#F26A21", 30)}
                            eventHandlers={{ click: () => onSelect(r) }}
                        />
                    ))}
                {ubicacion && <Marker position={[ubicacion.lat, ubicacion.lng]} icon={circulo("#2F7CF6", 18)} />}
            </MapContainer>
        </View>
    );
}
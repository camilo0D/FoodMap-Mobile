import { useEffect } from "react";
import { View } from "react-native";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import type { Coord } from "../utils/geo";

type Props = {
    origen: Coord | null;
    destino: Coord;
    ruta: Coord[] | null;
    radioM: number;
    color: string;
    centrarSenal: number;
};

function punto(color: string, t: number) {
    return L.divIcon({
        className: "",
        html: `<div style="width:${t}px;height:${t}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
        iconSize: [t, t],
        iconAnchor: [t / 2, t / 2],
    });
}

function Ajustar({ origen, destino, ruta, senal }: { origen: Coord | null; destino: Coord; ruta: Coord[] | null; senal: number }) {
    const map = useMap();
    useEffect(() => {
        const base = ruta && ruta.length > 1 ? ruta : origen ? [origen, destino] : [destino];
        const pts = base.map((p) => [p.lat, p.lng] as [number, number]);
        if (pts.length > 1) {
            map.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [40, 90], paddingBottomRight: [40, 300], maxZoom: 17 });
        } else {
            map.setView(pts[0], 16);
        }
    }, [ruta, origen?.lat, origen?.lng, destino.lat, destino.lng, senal]);
    return null;
}

export default function RouteMap({ origen, destino, ruta, radioM, color, centrarSenal }: Props) {
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
                center={[destino.lat, destino.lng]}
                zoom={16}
                zoomControl={false}
                style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            >
                <TileLayer attribution="© OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Ajustar origen={origen} destino={destino} ruta={ruta} senal={centrarSenal} />
                <Circle
                    center={[destino.lat, destino.lng]}
                    radius={radioM}
                    pathOptions={{ color, weight: 2, dashArray: "6 6", fillColor: color, fillOpacity: 0.12 }}
                />
                {ruta && ruta.length > 1 && (
                    <>
                        <Polyline positions={ruta.map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ color: "#ffffff", weight: 11, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
                        <Polyline positions={ruta.map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ color, weight: 6, opacity: 1, lineCap: "round", lineJoin: "round" }} />
                    </>
                )}
                {origen && <Marker position={[origen.lat, origen.lng]} icon={punto("#2F7CF6", 20)} />}
                <Marker position={[destino.lat, destino.lng]} icon={punto(color, 34)} />
            </MapContainer>
        </View>
    );
}
import { useEffect } from "react";
import { View } from "react-native";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type Props = { lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void };

const pin = L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:#F26A21;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

function Clicks({ onChange }: { onChange: Props["onChange"] }) {
    useMapEvents({ click: (e) => onChange(e.latlng.lat, e.latlng.lng) });
    return null;
}

function Recentrar({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();
    useEffect(() => {
        if (lat == null || lng == null) return;
        if (!map.getBounds().contains([lat, lng])) map.flyTo([lat, lng], Math.max(map.getZoom(), 15));
    }, [lat, lng]);
    return null;
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
    useEffect(() => {
        if (document.getElementById("leaflet-css")) return;
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }, []);

    const centro: [number, number] = lat != null && lng != null ? [lat, lng] : [3.8801, -77.0311];

    return (
        <View style={{ height: 240, borderRadius: 16, overflow: "hidden", zIndex: 0 }}>
            <MapContainer
                center={centro}
                zoom={lat != null ? 16 : 13}
                zoomControl={false}
                style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            >
                <TileLayer attribution="© OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Clicks onChange={onChange} />
                <Recentrar lat={lat} lng={lng} />
                {lat != null && lng != null && (
                    <Marker
                        position={[lat, lng]}
                        icon={pin}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const p = (e.target as L.Marker).getLatLng();
                                onChange(p.lat, p.lng);
                            },
                        }}
                    />
                )}
            </MapContainer>
        </View>
    );
}
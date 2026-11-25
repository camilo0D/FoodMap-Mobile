import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Camera, Map, Marker } from "@maplibre/maplibre-react-native";

type Props = { lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void };

const osmStyle: any = {
    version: 8,
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
        },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export default function LocationPicker({ lat, lng, onChange }: Props) {
    const camara = useRef<any>(null);

    useEffect(() => {
        if (lat != null && lng != null) camara.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 500 });
    }, [lat, lng]);

    const alTocar = (e: any) => {
        const p = e?.nativeEvent?.lngLat ?? e?.nativeEvent?.coordinates;
        if (Array.isArray(p)) onChange(p[1], p[0]);
        else if (p && p.longitude != null) onChange(p.latitude, p.longitude);
    };

    return (
        <View style={styles.caja}>
            <Map style={{ flex: 1 }} mapStyle={osmStyle} onPress={alTocar}>
                <Camera
                    ref={camara}
                    initialViewState={{ center: [lng ?? -77.0311, lat ?? 3.8801], zoom: lat != null ? 16 : 13 }}
                />
                {lat != null && lng != null && (
                    <Marker lngLat={[lng, lat]}>
                        <View style={styles.pin} />
                    </Marker>
                )}
            </Map>
        </View>
    );
}

const styles = StyleSheet.create({
    caja: { height: 240, borderRadius: 16, overflow: "hidden" },
    pin: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F26A21", borderWidth: 3, borderColor: "#fff" },
});
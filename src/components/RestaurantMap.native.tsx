import { useEffect, useRef } from "react";
import { View } from "react-native";
import { Map, Camera, Marker, GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import { themed, useColors } from "../theme";
import type { Restaurante } from "../types";
import { circuloGeoJSON, type Coord } from "../utils/geo";

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

type Props = {
    restaurantes: Restaurante[];
    seleccionadoId?: string | null;
    onSelect: (r: Restaurante) => void;
    ubicacion?: Coord | null;
    centerSignal?: number;
    seleccionado?: Restaurante | null;
    radioM?: number;
    centro?: Coord | null;
    zoom?: number;
};

export default function RestaurantMap({
    restaurantes, seleccionadoId, onSelect, ubicacion, centerSignal, seleccionado, radioM, centro, zoom,
}: Props) {
    const styles = useStyles();
    const colors = useColors();
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        if (centerSignal && ubicacion) {
            cameraRef.current?.flyTo({ center: [ubicacion.lng, ubicacion.lat], zoom: 15, duration: 800 });
        }
    }, [centerSignal]);

    // Radio alrededor del local seleccionado (mismo comportamiento que en la web).
    const centroRadio: Coord | null =
        seleccionado && seleccionado.latitud && seleccionado.longitud
            ? { lat: Number(seleccionado.latitud), lng: Number(seleccionado.longitud) }
            : null;

    return (
        <Map style={{ flex: 1 }} mapStyle={osmStyle}>
            <Camera
                ref={cameraRef}
                initialViewState={{
                    center: centro ? [centro.lng, centro.lat] : [-77.0311, 3.8801],
                    zoom: zoom ?? 13,
                }}
            />

            {centroRadio && !!radioM && (
                <GeoJSONSource id="radio-local" data={circuloGeoJSON(centroRadio, radioM) as any}>
                    <Layer id="radio-local-relleno" type="fill" style={{ fillColor: colors.primary, fillOpacity: 0.14 }} />
                    <Layer
                        id="radio-local-borde"
                        type="line"
                        style={{ lineColor: colors.primary, lineWidth: 2, lineDasharray: [3, 2] }}
                    />
                </GeoJSONSource>
            )}

            {restaurantes
                .filter((r) => r.latitud && r.longitud)
                .map((r) => {
                    const activo = r.id === seleccionadoId;
                    return (
                        <Marker key={r.id} lngLat={[Number(r.longitud), Number(r.latitud)]} onPress={() => onSelect(r)}>
                            <View style={[styles.pin, activo && styles.pinActivo]}>
                                <Ionicons name="restaurant" size={activo ? 18 : 14} color="#fff" />
                            </View>
                        </Marker>
                    );
                })}
            {ubicacion && (
                <Marker lngLat={[ubicacion.lng, ubicacion.lat]}>
                    <View style={styles.yo} />
                </Marker>
            )}
        </Map>
    );
}

const useStyles = themed((colors) => ({
    pin: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary,
        borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center",
    },
    pinActivo: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#D83A1B" },
    yo: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#2F7CF6", borderWidth: 3, borderColor: "#fff" },
}));
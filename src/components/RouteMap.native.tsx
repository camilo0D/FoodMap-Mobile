import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Camera, GeoJSONSource, Layer, Map, Marker } from "@maplibre/maplibre-react-native";
import { circuloGeoJSON, Coord, encuadre, lineaGeoJSON } from "../utils/geo";

type Props = {
    origen: Coord | null;
    destino: Coord;
    ruta: Coord[] | null;
    radioM: number;
    color: string;
    centrarSenal: number;
};

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

export default function RouteMap({ origen, destino, ruta, radioM, color, centrarSenal }: Props) {
    const camara = useRef<any>(null);

    useEffect(() => {
        const base = ruta && ruta.length > 1 ? ruta : origen ? [origen, destino] : [destino];
        const { centro, zoom } = encuadre(base);
        // El encuadre deja espacio abajo para la tarjeta: se baja un poco el centro.
        camara.current?.flyTo({ center: [centro.lng, centro.lat - 0.0004 * Math.pow(2, 16 - zoom)], zoom: base.length > 1 ? zoom - 0.3 : 16, duration: 700 });
    }, [ruta, origen?.lat, origen?.lng, destino.lat, destino.lng, centrarSenal]);

    return (
        <View style={{ flex: 1 }}>
            <Map style={{ flex: 1 }} mapStyle={osmStyle}>
                <Camera ref={camara} initialViewState={{ center: [destino.lng, destino.lat], zoom: 15 }} />

                <GeoJSONSource id="radio" data={circuloGeoJSON(destino, radioM) as any}>
                    <Layer id="radio-relleno" type="fill" style={{ fillColor: color, fillOpacity: 0.14 }} />
                    <Layer id="radio-borde" type="line" style={{ lineColor: color, lineWidth: 2, lineDasharray: [3, 2] }} />
                </GeoJSONSource>

                {ruta && ruta.length > 1 && (
                    <GeoJSONSource id="ruta" data={lineaGeoJSON(ruta) as any}>
                        <Layer id="ruta-borde" type="line" style={{ lineColor: "#ffffff", lineWidth: 11, lineCap: "round", lineJoin: "round" }} />
                        <Layer id="ruta-linea" type="line" style={{ lineColor: color, lineWidth: 6, lineCap: "round", lineJoin: "round" }} />
                    </GeoJSONSource>
                )}

                {origen && (
                    <Marker lngLat={[origen.lng, origen.lat]}>
                        <View style={[styles.punto, { backgroundColor: "#2F7CF6", width: 20, height: 20, borderRadius: 10 }]} />
                    </Marker>
                )}
                <Marker lngLat={[destino.lng, destino.lat]}>
                    <View style={[styles.punto, { backgroundColor: color, width: 34, height: 34, borderRadius: 17 }]} />
                </Marker>
            </Map>
        </View>
    );
}

const styles = StyleSheet.create({
    punto: { borderWidth: 3, borderColor: "#fff" },
});
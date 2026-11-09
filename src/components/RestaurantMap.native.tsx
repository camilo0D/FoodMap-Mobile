import { StyleSheet, View } from "react-native";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import type { Restaurante } from "../types";

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

export default function RestaurantMap({ restaurantes }: { restaurantes: Restaurante[] }) {
    return (
        <Map style={{ flex: 1 }} mapStyle={osmStyle}>
            <Camera initialViewState={{ center: [-77.0311, 3.8801], zoom: 12 }} />
            {restaurantes.map((r) => (
                <Marker key={r.id} lngLat={[Number(r.longitud), Number(r.latitud)]}>
                    <View style={styles.pin} />
                </Marker>
            ))}
        </Map>
    );
}

const styles = StyleSheet.create({
    pin: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#F97316",
        borderWidth: 3,
        borderColor: "#fff",
    },
});
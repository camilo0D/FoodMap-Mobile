import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

type Restaurante = { id: string; nombre: string; latitud: string; longitud: string };

export default function App() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [estado, setEstado] = useState("Cargando...");

  useEffect(() => {
    fetch(`${API_URL}/restaurantes/`)
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : data.results ?? [];
        setRestaurantes(lista);
        setEstado(`${lista.length} restaurantes`);
      })
      .catch((e) => setEstado(`Error: ${e.message}`));
  }, []);

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={osmStyle}>
        <Camera initialViewState={{ center: [-77.0311, 3.8801], zoom: 12 }} />
        {restaurantes.map((r) => (
          <Marker key={r.id} lngLat={[Number(r.longitud), Number(r.latitud)]}>
            <View style={styles.pin} />
          </Marker>
        ))}
      </Map>
      <Text style={styles.estado}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pin: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#F97316", borderWidth: 3, borderColor: "#fff" },
  estado: { position: "absolute", top: 50, alignSelf: "center", backgroundColor: "#fff", padding: 8, borderRadius: 8 },
});
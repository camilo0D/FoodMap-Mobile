import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import RestaurantMap from "./src/components/RestaurantMap";
import { getRestaurantes } from "./src/services/restaurant";
import type { Restaurante } from "./src/types";

export default function App() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [estado, setEstado] = useState("Cargando...");

  useEffect(() => {
    getRestaurantes()
      .then((lista) => {
        setRestaurantes(lista);
        setEstado(`${lista.length} restaurantes`);
      })
      .catch((e) => setEstado(`Error: ${e.message}`));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <RestaurantMap restaurantes={restaurantes} />
      <Text style={styles.estado}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  estado: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
  },
});
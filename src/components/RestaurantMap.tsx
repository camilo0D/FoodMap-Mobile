import { Text, View } from "react-native";
import type { Restaurante } from "../types";

export default function RestaurantMap({ restaurantes }: { restaurantes: Restaurante[] }) {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FDF3EA" }}>
            <Text>El mapa solo está disponible en la app Android</Text>
            <Text>{restaurantes.length} restaurantes cargados</Text>
        </View>
    );
}
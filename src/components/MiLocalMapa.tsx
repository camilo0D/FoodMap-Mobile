import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RestaurantMap from "./RestaurantMap";
import { radius, themed, useColors } from "../theme";
import type { Restaurante } from "../types";

const RADIOS = [
    { m: 300, texto: "300 m" },
    { m: 500, texto: "500 m" },
    { m: 1000, texto: "1 km" },
];

// Mapa del propio restaurante para el panel del dueño: su ubicación y el radio a su alrededor.
export default function MiLocalMapa({ restaurante, alto = 220 }: { restaurante: Restaurante; alto?: number }) {
    const styles = useStyles();
    const colors = useColors();
    const [radioM, setRadioM] = useState(500);

    const lat = Number(restaurante.latitud);
    const lng = Number(restaurante.longitud);
    const tieneUbicacion = !!restaurante.latitud && !!restaurante.longitud && !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);

    if (!tieneUbicacion) {
        return (
            <View style={styles.vacio}>
                <Ionicons name="location-outline" size={24} color={colors.primary} />
                <Text style={styles.vacioTxt}>Aún no has marcado la ubicación de tu local.</Text>
            </View>
        );
    }

    return (
        <View style={styles.caja}>
            <View style={{ height: alto }} pointerEvents="none">
                <RestaurantMap
                    key={`${lat},${lng}`}
                    restaurantes={[restaurante]}
                    seleccionadoId={restaurante.id}
                    seleccionado={restaurante}
                    radioM={radioM}
                    centro={{ lat, lng }}
                    zoom={15}
                    onSelect={() => { }}
                />
            </View>
            <View style={styles.radios}>
                {RADIOS.map((r) => (
                    <Pressable key={r.m} onPress={() => setRadioM(r.m)} style={[styles.radio, radioM === r.m && styles.radioActivo]}>
                        <Text style={[styles.radioTxt, radioM === r.m && { color: "#fff" }]}>{r.texto}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    caja: { borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    radios: { flexDirection: "row", justifyContent: "center", gap: 8, padding: 10 },
    radio: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primarySoft },
    radioActivo: { backgroundColor: colors.primary },
    radioTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
    vacio: {
        borderRadius: radius.lg, padding: 20, alignItems: "center", gap: 8,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    },
    vacioTxt: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
}));
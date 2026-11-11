import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { estadoAbierto } from "../utils/horario";
import { colors, radius, spacing } from "../theme";
import type { Restaurante } from "../types";

type Props = { restaurante: Restaurante; distanciaKm?: number | null; onPress: () => void };

export default function RestaurantListItem({ restaurante: r, distanciaKm, onPress }: Props) {
    const estado = estadoAbierto(r.horario);
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View>
                {r.imagen ? (
                    <Image source={{ uri: r.imagen }} style={styles.foto} />
                ) : (
                    <View style={[styles.foto, styles.sinFoto]}>
                        <Ionicons name="restaurant" size={34} color={colors.primary} />
                    </View>
                )}
                <View style={styles.rating}>
                    <Ionicons name="star" size={13} color={colors.star} />
                    <Text style={styles.ratingTxt}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                </View>
                {distanciaKm != null && (
                    <View style={styles.distancia}>
                        <Ionicons name="location" size={12} color="#fff" />
                        <Text style={styles.distanciaTxt}>{distanciaKm.toFixed(1)} km</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                <Text style={styles.detalle} numberOfLines={1}>
                    {r.categoria?.nombre} · {r.direccion}
                </Text>
                {estado && (
                    <Text style={{ fontSize: 12, fontWeight: "700", color: estado.abierto ? "#1F7A44" : "#A12B1F" }}>
                        {estado.texto}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden", elevation: 2 },
    foto: { width: "100%", height: 150 },
    sinFoto: { backgroundColor: "#F3E4D6", alignItems: "center", justifyContent: "center" },
    rating: {
        position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "#fff", borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4,
    },
    ratingTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
    distancia: {
        position: "absolute", bottom: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 3,
        backgroundColor: "rgba(0,0,0,0.55)", borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4,
    },
    distanciaTxt: { fontSize: 12, fontWeight: "700", color: "#fff" },
    info: { padding: spacing.md, gap: 3 },
    nombre: { fontSize: 16, fontWeight: "700", color: colors.text },
    detalle: { fontSize: 12, color: colors.textMuted },
});
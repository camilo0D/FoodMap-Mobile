import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FavoriteButton from "./FavoriteButton";
import { colors, radius, spacing } from "../theme";
import type { Restaurante } from "../types";

type Props = {
    restaurante: Restaurante;
    distanciaKm?: number | null;
    onClose: () => void;
    onVerMas: () => void;
};

export default function RestaurantCard({ restaurante: r, distanciaKm, onClose, onVerMas }: Props) {
    return (
        <View style={styles.card}>
            {r.imagen ? (
                <Image source={{ uri: r.imagen }} style={styles.foto} />
            ) : (
                <View style={[styles.foto, styles.sinFoto]}>
                    <Ionicons name="restaurant" size={24} color={colors.primary} />
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                <Text style={styles.detalle} numberOfLines={1}>
                    {r.categoria?.nombre}
                    {distanciaKm != null ? ` · ${distanciaKm.toFixed(1)} km` : ""}
                </Text>
                <View style={styles.fila}>
                    <Ionicons name="star" size={14} color={colors.star} />
                    <Text style={styles.rating}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                    <FavoriteButton restaurante={r} size={22} />
                    <Pressable style={styles.boton} onPress={onVerMas}>
                        <Text style={styles.botonTexto}>Ver más</Text>
                    </Pressable>
                </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.cerrar}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.lg,
        padding: spacing.md, gap: spacing.md, elevation: 6,
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    },
    foto: { width: 76, height: 76, borderRadius: radius.md },
    sinFoto: { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
    info: { flex: 1, justifyContent: "space-between" },
    nombre: { fontSize: 16, fontWeight: "700", color: colors.text, paddingRight: 20 },
    detalle: { fontSize: 12, color: colors.textMuted },
    fila: { flexDirection: "row", alignItems: "center", gap: 8 },
    rating: { fontSize: 13, fontWeight: "600", color: colors.text, flex: 1 },
    boton: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
    botonTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
    cerrar: { position: "absolute", top: 8, right: 8 },
});
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Avatar from "../../components/Avatar";
import Stars from "../../components/Stars";
import { getMiRestaurante } from "../../services/owner";
import { getResenas } from "../../services/restaurant";
import { fechaCorta } from "../../utils/format";
import { colors, radius, spacing } from "../../theme";
import type { Restaurante, Resena } from "../../types";

export default function OwnerReviewsScreen() {
    const [r, setR] = useState<Restaurante | null>(null);
    const [resenas, setResenas] = useState<Resena[] | null>(null);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    const mio = await getMiRestaurante();
                    setR(mio);
                    if (mio) {
                        const x = await getResenas(mio.id);
                        setResenas(x.results);
                        setTotal(x.total);
                    } else setResenas([]);
                    setError(false);
                } catch {
                    setError(true);
                }
            })();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <FlatList
                data={resenas ?? []}
                keyExtractor={(x) => x.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
                ListHeaderComponent={
                    <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
                        <Text style={styles.titulo}>Reseñas recibidas</Text>
                        {r && (
                            <View style={styles.resumen}>
                                <Text style={styles.promedio}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                                <View style={{ gap: 4 }}>
                                    <Stars valor={Number(r.calificacion_promedio)} size={18} />
                                    <Text style={styles.sub}>{total} {total === 1 ? "reseña" : "reseñas"}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Avatar uri={item.usuario_avatar} nombre={item.usuario_username} size={38} />
                        <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.nombre}>{item.usuario_username}</Text>
                                <Text style={styles.sub}>{fechaCorta(item.created_at)}</Text>
                            </View>
                            <Stars valor={item.rating} size={13} />
                            {!!item.comment && <Text style={styles.comentario}>{item.comment}</Text>}
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons name={error ? "cloud-offline-outline" : "star-outline"} size={32} color={colors.primary} />
                        <Text style={styles.vacioTitulo}>
                            {resenas === null && !error ? "Cargando..." : error ? "No pudimos cargar las reseñas"
                                : !r ? "Primero registra tu restaurante" : "Aún no tienes reseñas"}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    resumen: { flexDirection: "row", alignItems: "center", gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
    promedio: { fontSize: 44, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    card: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    nombre: { fontSize: 14, fontWeight: "700", color: colors.text },
    comentario: { fontSize: 13, color: colors.text, lineHeight: 18 },
    vacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingBottom: 80 },
    vacioTitulo: { fontSize: 16, fontWeight: "700", color: colors.text },
});
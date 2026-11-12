import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ConfirmDialog from "../components/ConfirmDialog";
import Stars from "../components/Stars";
import { borrarResena, getMisResenas } from "../services/profile";
import { fechaCorta } from "../utils/format";
import { colors, radius, spacing } from "../theme";
import type { MiResena } from "../types";

export default function MyReviewsScreen() {
    const navigation = useNavigation<any>();
    const [resenas, setResenas] = useState<MiResena[] | null>(null);
    const [error, setError] = useState(false);
    const [aBorrar, setABorrar] = useState<MiResena | null>(null);

    useFocusEffect(
        useCallback(() => {
            getMisResenas().then((l) => { setResenas(l); setError(false); }).catch(() => setError(true));
        }, [])
    );

    const confirmarBorrado = async () => {
        if (!aBorrar) return;
        const r = aBorrar;
        setABorrar(null);
        try {
            await borrarResena(r.id);
            setResenas((prev) => prev?.filter((x) => x.id !== r.id) ?? null);
        } catch {
            setError(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={resenas ?? []}
                keyExtractor={(x) => x.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
                ListHeaderComponent={
                    <View style={{ marginBottom: spacing.md }}>
                        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: spacing.lg }}>
                            <Text style={styles.volver}>← Volver</Text>
                        </Pressable>
                        <Text style={styles.titulo}>Mis reseñas</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {item.restaurante.imagen ? (
                            <Image source={{ uri: item.restaurante.imagen }} style={styles.foto} />
                        ) : (
                            <View style={[styles.foto, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
                                <Ionicons name="restaurant" size={20} color={colors.primary} />
                            </View>
                        )}
                        <View style={{ flex: 1, gap: 3 }}>
                            <Text style={styles.nombre} numberOfLines={1}>{item.restaurante.nombre}</Text>
                            <Stars valor={item.rating} size={14} />
                            {!!item.comment && <Text style={styles.comentario}>{item.comment}</Text>}
                            <Text style={styles.fecha}>{fechaCorta(item.created_at)}</Text>
                        </View>
                        <Pressable onPress={() => setABorrar(item)} hitSlop={10}>
                            <Ionicons name="trash-outline" size={20} color="#B3261E" />
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons name={error ? "cloud-offline-outline" : "star-outline"} size={32} color={colors.primary} />
                        <Text style={styles.vacioTitulo}>
                            {resenas === null && !error ? "Cargando..." : error ? "No pudimos cargar tus reseñas" : "Aún no has escrito reseñas"}
                        </Text>
                        {!error && resenas !== null && (
                            <Text style={styles.vacioTexto}>Abre un restaurante y cuéntanos tu experiencia.</Text>
                        )}
                    </View>
                }
            />
            {aBorrar && (
                <ConfirmDialog
                    titulo="¿Eliminar esta reseña?"
                    texto={`Se borrará tu reseña de ${aBorrar.restaurante.nombre} y la calificación del restaurante se recalculará.`}
                    confirmarTxt="Eliminar reseña"
                    destructivo
                    onConfirm={confirmarBorrado}
                    onCancel={() => setABorrar(null)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    volver: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text },
    card: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    foto: { width: 56, height: 56, borderRadius: radius.md },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    comentario: { fontSize: 13, color: colors.text, lineHeight: 18 },
    fecha: { fontSize: 12, color: colors.textMuted },
    vacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingBottom: 80 },
    vacioTitulo: { fontSize: 16, fontWeight: "700", color: colors.text },
    vacioTexto: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
});
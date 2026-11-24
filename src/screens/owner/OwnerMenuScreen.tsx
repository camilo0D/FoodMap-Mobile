import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ConfirmDialog from "../../components/ConfirmDialog";
import { borrarPlato, cambiarDisponible, getMiRestaurante } from "../../services/owner";
import { getMenu } from "../../services/restaurant";
import { precioCOP } from "../../utils/format";
import { colors, radius, spacing } from "../../theme";
import type { Plato, Restaurante } from "../../types";

export default function OwnerMenuScreen() {
    const navigation = useNavigation<any>();
    const [r, setR] = useState<Restaurante | null>(null);
    const [platos, setPlatos] = useState<Plato[] | null>(null);
    const [error, setError] = useState(false);
    const [aBorrar, setABorrar] = useState<Plato | null>(null);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    const mio = await getMiRestaurante();
                    setR(mio);
                    setPlatos(mio ? await getMenu(mio.id) : []);
                    setError(false);
                } catch {
                    setError(true);
                }
            })();
        }, [])
    );

    const alternar = async (p: Plato) => {
        if (!r) return;
        setPlatos((prev) => prev?.map((x) => (x.id === p.id ? { ...x, disponible: !x.disponible } : x)) ?? null);
        try {
            await cambiarDisponible(r.id, p.id, !p.disponible);
        } catch {
            setPlatos((prev) => prev?.map((x) => (x.id === p.id ? { ...x, disponible: p.disponible } : x)) ?? null);
        }
    };

    const borrar = async () => {
        if (!r || !aBorrar) return;
        const p = aBorrar;
        setABorrar(null);
        try {
            await borrarPlato(r.id, p.id);
            setPlatos((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
        } catch {
            setError(true);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <FlatList
                data={platos ?? []}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, paddingBottom: 100 }}
                ListHeaderComponent={<Text style={styles.titulo}>Mi menú</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {item.imagen ? (
                            <Image source={{ uri: item.imagen }} style={styles.foto} />
                        ) : (
                            <View style={[styles.foto, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
                                <Ionicons name="fast-food-outline" size={22} color={colors.primary} />
                            </View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={styles.precio}>{precioCOP(item.precio)}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Switch value={item.disponible} onValueChange={() => alternar(item)} trackColor={{ true: colors.primary }} />
                                <Text style={styles.sub}>{item.disponible ? "Disponible" : "Agotado"}</Text>
                            </View>
                        </View>
                        <View style={{ gap: spacing.md }}>
                            <Pressable hitSlop={8} onPress={() => navigation.navigate("EditarPlato", { restauranteId: r!.id, plato: item })}>
                                <Ionicons name="create-outline" size={20} color={colors.primary} />
                            </Pressable>
                            <Pressable hitSlop={8} onPress={() => setABorrar(item)}>
                                <Ionicons name="trash-outline" size={20} color="#B3261E" />
                            </Pressable>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons name={error ? "cloud-offline-outline" : "restaurant-outline"} size={34} color={colors.primary} />
                        <Text style={styles.vacioTitulo}>
                            {platos === null && !error ? "Cargando..." : error ? "No pudimos cargar tu menú"
                                : !r ? "Primero registra tu restaurante" : "Aún no tienes platos"}
                        </Text>
                        {!r && platos !== null && <Text style={styles.sub}>Ve a «Mi local» para registrarlo.</Text>}
                    </View>
                }
            />

            {r && (
                <Pressable style={styles.fab} onPress={() => navigation.navigate("EditarPlato", { restauranteId: r.id })}>
                    <Ionicons name="add" size={22} color="#fff" />
                    <Text style={styles.fabTxt}>Agregar plato</Text>
                </Pressable>
            )}

            {aBorrar && (
                <ConfirmDialog
                    titulo="¿Eliminar este plato?"
                    texto={`«${aBorrar.nombre}» dejará de aparecer en tu menú.`}
                    confirmarTxt="Eliminar plato"
                    destructivo
                    onConfirm={borrar}
                    onCancel={() => setABorrar(null)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
    card: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    foto: { width: 72, height: 72, borderRadius: radius.md },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    precio: { fontWeight: "800", color: colors.primary },
    sub: { fontSize: 12, color: colors.textMuted },
    vacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingBottom: 80 },
    vacioTitulo: { fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" },
    fab: {
        position: "absolute", right: spacing.lg, bottom: spacing.lg, flexDirection: "row", gap: 6, alignItems: "center",
        backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 14, elevation: 6,
    },
    fabTxt: { color: "#fff", fontWeight: "700" },
});
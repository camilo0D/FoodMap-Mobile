import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getMiRestaurante } from "../../services/owner";
import { getMenu, getResenas } from "../../services/restaurant";
import { estadoAbierto } from "../../utils/horario";
import { colors, radius, spacing } from "../../theme";
import type { Restaurante } from "../../types";

function completitud(r: Restaurante, platos: number) {
    const pasos = [
        !!r.descripcion, !!r.telefono, !!r.imagen, !!r.direccion, !!r.categoria,
        !!r.horario && Object.keys(r.horario).length > 0,
        Number(r.latitud) !== 0 && Number(r.longitud) !== 0,
        platos > 0,
    ];
    return Math.round((pasos.filter(Boolean).length / pasos.length) * 100);
}

export default function OwnerHomeScreen() {
    const navigation = useNavigation<any>();
    const [cargando, setCargando] = useState(true);
    const [r, setR] = useState<Restaurante | null>(null);
    const [platos, setPlatos] = useState(0);
    const [resenas, setResenas] = useState(0);
    const [error, setError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    const mio = await getMiRestaurante();
                    setR(mio);
                    if (mio) {
                        const [m, x] = await Promise.all([getMenu(mio.id), getResenas(mio.id)]);
                        setPlatos(m.length);
                        setResenas(x.total);
                    }
                    setError(false);
                } catch {
                    setError(true);
                } finally {
                    setCargando(false);
                }
            })();
        }, [])
    );

    if (cargando) {
        return (
            <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, styles.centro]}>
                <Ionicons name="cloud-offline-outline" size={34} color={colors.primary} />
                <Text style={styles.vacioTitulo}>No pudimos cargar tu restaurante</Text>
            </SafeAreaView>
        );
    }

    if (!r) {
        return (
            <SafeAreaView style={[styles.container, styles.centro]}>
                <View style={styles.icono}>
                    <Ionicons name="storefront-outline" size={34} color={colors.primary} />
                </View>
                <Text style={styles.vacioTitulo}>Registra tu restaurante</Text>
                <Text style={styles.vacioTexto}>Agrega tu información, tu ubicación y tu menú para que tu barrio te encuentre.</Text>
                <Pressable style={styles.boton} onPress={() => navigation.navigate("EditarLocal")}>
                    <Text style={styles.botonTxt}>Registrar mi restaurante</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const pct = completitud(r, platos);
    const estado = estadoAbierto(r.horario);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                <Text style={styles.titulo}>Mi local</Text>

                <View style={styles.card}>
                    {r.imagen ? (
                        <Image source={{ uri: r.imagen }} style={styles.foto} />
                    ) : (
                        <View style={[styles.foto, { backgroundColor: "#F3E4D6", alignItems: "center", justifyContent: "center" }]}>
                            <Ionicons name="restaurant" size={40} color={colors.primary} />
                        </View>
                    )}
                    <View style={{ padding: spacing.lg, gap: 4 }}>
                        <Text style={styles.nombre}>{r.nombre}</Text>
                        <Text style={styles.sub}>{r.categoria?.nombre ?? "Sin categoría"} · {r.direccion || "Sin dirección"}</Text>
                        {estado && (
                            <Text style={{ fontWeight: "700", fontSize: 12, color: estado.abierto ? "#1F7A44" : "#A12B1F" }}>{estado.texto}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statNum}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                        <Text style={styles.statTxt}>Calificación</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statNum}>{resenas}</Text>
                        <Text style={styles.statTxt}>Reseñas</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statNum}>{platos}</Text>
                        <Text style={styles.statTxt}>Platos</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={{ padding: spacing.lg, gap: 8 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={styles.nombre}>Perfil completo</Text>
                            <Text style={[styles.nombre, { color: colors.primary }]}>{pct}%</Text>
                        </View>
                        <View style={styles.barra}>
                            <View style={[styles.barraRelleno, { width: `${pct}%` }]} />
                        </View>
                        {pct < 100 && <Text style={styles.sub}>Completa tu descripción, horario, ubicación, foto y menú para aparecer mejor.</Text>}
                    </View>
                </View>

                <Pressable style={styles.boton} onPress={() => navigation.navigate("EditarLocal", { restaurante: r })}>
                    <Text style={styles.botonTxt}>Editar información</Text>
                </Pressable>
                <Pressable style={styles.btnSec} onPress={() => navigation.navigate("Detalle", { restaurante: r })}>
                    <Text style={styles.btnSecTxt}>Ver cómo lo ven los clientes</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centro: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
    icono: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FBE3D3", alignItems: "center", justifyContent: "center" },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    vacioTitulo: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
    vacioTexto: { fontSize: 14, color: colors.textMuted, textAlign: "center", maxWidth: 280 },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden" },
    foto: { width: "100%", height: 160 },
    nombre: { fontSize: 17, fontWeight: "800", color: colors.text },
    sub: { fontSize: 13, color: colors.textMuted },
    stats: { flexDirection: "row", gap: spacing.md },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" },
    statNum: { fontSize: 24, fontWeight: "800", color: colors.text },
    statTxt: { fontSize: 12, color: colors.textMuted },
    barra: { height: 8, borderRadius: 4, backgroundColor: colors.border },
    barraRelleno: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: 24, alignItems: "center" },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    btnSec: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
    btnSecTxt: { color: colors.primary, fontWeight: "700" },
});
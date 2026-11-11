import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import RestaurantListItem from "../components/RestaurantListItem";
import FilterSheet, { Filtros, FILTROS_VACIOS } from "../components/FilterSheet";
import { useRestaurantes } from "../hooks/useRestaurantes";
import { useUserLocation } from "../hooks/useUserLocation";
import { distanciaKm } from "../utils/geo";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Orden = "rating" | "cerca";

export default function ExploreScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { restaurantes, estado, recargar } = useRestaurantes();
    const { ubicacion, estado: estadoUb, solicitar } = useUserLocation();
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<string | null>(null);
    const [orden, setOrden] = useState<Orden>("rating");
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
    const [verFiltros, setVerFiltros] = useState(false);
    const [refrescando, setRefrescando] = useState(false);

    const categorias = useMemo(() => {
        const vistas: Record<string, string> = {};
        restaurantes.forEach((r) => { if (r.categoria) vistas[r.categoria.id] = r.categoria.nombre; });
        return Object.entries(vistas).map(([id, nombre]) => ({ id, nombre }));
    }, [restaurantes]);

    const distancias = useMemo(() => {
        const m: Record<string, number> = {};
        if (ubicacion) {
            restaurantes.forEach((r) => {
                if (r.latitud && r.longitud)
                    m[r.id] = distanciaKm(ubicacion, { lat: Number(r.latitud), lng: Number(r.longitud) });
            });
        }
        return m;
    }, [restaurantes, ubicacion]);

    const lista = useMemo(() => {
        const base = restaurantes.filter(
            (r) =>
                (!categoriaId || r.categoria?.id === categoriaId) &&
                r.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
                (!filtros.minRating || Number(r.calificacion_promedio) >= filtros.minRating) &&
                (!filtros.distanciaKm || !ubicacion || (distancias[r.id] ?? Infinity) <= filtros.distanciaKm)
        );
        return [...base].sort((a, b) =>
            orden === "cerca" && ubicacion
                ? (distancias[a.id] ?? Infinity) - (distancias[b.id] ?? Infinity)
                : Number(b.calificacion_promedio) - Number(a.calificacion_promedio)
        );
    }, [restaurantes, categoriaId, busqueda, filtros, orden, ubicacion, distancias]);

    const elegirCerca = async () => {
        if (!ubicacion) {
            const c = await solicitar();
            if (!c) return;
        }
        setOrden("cerca");
    };

    const refrescar = async () => {
        setRefrescando(true);
        await recargar();
        setRefrescando(false);
    };

    const filtrosActivos = filtros.distanciaKm != null || filtros.minRating != null;

    const cabecera = (
        <View style={{ gap: spacing.md, paddingBottom: spacing.md }}>
            <Text style={styles.titulo}>Explorar</Text>
            <View style={styles.busquedaFila}>
                <View style={styles.busqueda}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar restaurantes..."
                        placeholderTextColor={colors.textMuted}
                        value={busqueda}
                        onChangeText={setBusqueda}
                    />
                </View>
                <Pressable style={styles.filtroBtn} onPress={() => setVerFiltros(true)}>
                    <Ionicons name="options" size={20} color="#fff" />
                    {filtrosActivos && <View style={styles.punto} />}
                </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                <Pressable onPress={() => setCategoriaId(null)} style={[styles.chip, !categoriaId && styles.chipActivo]}>
                    <Text style={[styles.chipTxt, !categoriaId && styles.chipTxtActivo]}>Todos</Text>
                </Pressable>
                {categorias.map((c) => {
                    const activo = c.id === categoriaId;
                    return (
                        <Pressable key={c.id} onPress={() => setCategoriaId(activo ? null : c.id)} style={[styles.chip, activo && styles.chipActivo]}>
                            <Text style={[styles.chipTxt, activo && styles.chipTxtActivo]}>{c.nombre}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.ordenFila}>
                <Text style={styles.contador}>
                    {lista.length} {lista.length === 1 ? "restaurante" : "restaurantes"}
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <Pressable onPress={() => setOrden("rating")} style={[styles.orden, orden === "rating" && styles.ordenActivo]}>
                        <Ionicons name="star" size={13} color={orden === "rating" ? "#fff" : colors.textMuted} />
                        <Text style={[styles.ordenTxt, orden === "rating" && { color: "#fff" }]}>Mejor calificados</Text>
                    </Pressable>
                    <Pressable onPress={elegirCerca} style={[styles.orden, orden === "cerca" && styles.ordenActivo]}>
                        <Ionicons name="location" size={13} color={orden === "cerca" ? "#fff" : colors.textMuted} />
                        <Text style={[styles.ordenTxt, orden === "cerca" && { color: "#fff" }]}>Más cercanos</Text>
                    </Pressable>
                </View>
            </View>
            {estadoUb === "denegada" && (
                <Text style={{ color: "#B3261E", fontSize: 12 }}>
                    No pudimos acceder a tu ubicación. Actívala en los ajustes para ordenar por cercanía.
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <FlatList
                data={lista}
                keyExtractor={(r) => r.id}
                ListHeaderComponent={cabecera}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
                refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.primary} />}
                renderItem={({ item }) => (
                    <RestaurantListItem
                        restaurante={item}
                        distanciaKm={distancias[item.id]}
                        onPress={() => navigation.navigate("Detalle", { restaurante: item, distanciaKm: distancias[item.id] })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Ionicons name={estado === "error" ? "cloud-offline-outline" : "search-outline"} size={30} color={colors.primary} />
                        <Text style={styles.vacioTitulo}>
                            {estado === "cargando" ? "Cargando..."
                                : estado === "error" ? "No pudimos cargar los restaurantes"
                                    : "No encontramos restaurantes"}
                        </Text>
                        {estado === "ok" && (
                            <Pressable onPress={() => { setFiltros(FILTROS_VACIOS); setCategoriaId(null); setBusqueda(""); }}>
                                <Text style={styles.vacioLink}>Limpiar filtros</Text>
                            </Pressable>
                        )}
                        {estado === "error" && (
                            <Pressable onPress={recargar}>
                                <Text style={styles.vacioLink}>Reintentar</Text>
                            </Pressable>
                        )}
                    </View>
                }
            />

            {verFiltros && (
                <FilterSheet
                    valor={filtros}
                    ubicacionActiva={!!ubicacion}
                    onApply={(f) => { setFiltros(f); setVerFiltros(false); }}
                    onClose={() => setVerFiltros(false)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    titulo: { fontSize: 28, fontWeight: "800", color: colors.text },
    busquedaFila: { flexDirection: "row", gap: spacing.sm },
    busqueda: {
        flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface,
        borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 46,
    },
    input: { flex: 1, color: colors.text, fontSize: 14, outlineStyle: "none" } as any,
    filtroBtn: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    punto: { position: "absolute", top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: "#fff", borderWidth: 2, borderColor: colors.primary },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { color: colors.text, fontSize: 13, fontWeight: "600" },
    chipTxtActivo: { color: "#fff" },
    ordenFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: spacing.sm },
    contador: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
    orden: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
    ordenActivo: { backgroundColor: colors.text },
    ordenTxt: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
    vacio: { alignItems: "center", gap: spacing.sm, padding: spacing.xl },
    vacioTitulo: { fontSize: 15, fontWeight: "700", color: colors.text, textAlign: "center" },
    vacioLink: { color: colors.primary, fontWeight: "700" },
});
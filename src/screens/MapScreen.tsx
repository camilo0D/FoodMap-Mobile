import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RestaurantMap from "../components/RestaurantMap";
import RestaurantCard from "../components/RestaurantCard";
import FilterSheet, { Filtros, FILTROS_VACIOS } from "../components/FilterSheet";
import { getRestaurantes } from "../services/restaurant";
import { useUserLocation } from "../hooks/useUserLocation";
import { distanciaKm } from "../utils/geo";
import { colors, radius, spacing } from "../theme";
import type { Restaurante } from "../types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

const DISTANCIAS = [1, 3, 5, 10];

export default function MapScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
    const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
    const [busqueda, setBusqueda] = useState("");
    const [categoriaId, setCategoriaId] = useState<string | null>(null);
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
    const [verFiltros, setVerFiltros] = useState(false);
    const [seleccionado, setSeleccionado] = useState<Restaurante | null>(null);
    const [centerSignal, setCenterSignal] = useState(0);
    const { ubicacion, estado: estadoUb, solicitar } = useUserLocation();

    useEffect(() => {
        getRestaurantes()
            .then((lista) => { setRestaurantes(lista); setEstado("ok"); })
            .catch(() => setEstado("error"));
    }, []);

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

    const filtrados = useMemo(
        () =>
            restaurantes.filter(
                (r) =>
                    (!categoriaId || r.categoria?.id === categoriaId) &&
                    r.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
                    (!filtros.minRating || Number(r.calificacion_promedio) >= filtros.minRating) &&
                    (!filtros.distanciaKm || !ubicacion || (distancias[r.id] ?? Infinity) <= filtros.distanciaKm)
            ),
        [restaurantes, categoriaId, busqueda, filtros, ubicacion, distancias]
    );

    const filtrosActivos = filtros.distanciaKm != null || filtros.minRating != null;
    const sinResultados = estado === "ok" && filtrados.length === 0;

    const irAMiUbicacion = async () => {
        const c = await solicitar();
        if (c) setCenterSignal((s) => s + 1);
    };

    const ampliarDistancia = () => {
        const siguiente = DISTANCIAS.find((d) => d > (filtros.distanciaKm ?? 0));
        setFiltros({ ...filtros, distanciaKm: siguiente ?? null });
    };

    const contador =
        estado === "cargando" ? "Cargando..."
            : estado === "error" ? "No pudimos cargar los restaurantes"
                : `${filtrados.length} ${filtrados.length === 1 ? "restaurante" : "restaurantes"}`;

    return (
        <View style={styles.container}>
            <RestaurantMap
                restaurantes={filtrados}
                seleccionadoId={seleccionado?.id}
                onSelect={setSeleccionado}
                ubicacion={ubicacion}
                centerSignal={centerSignal}
            />

            <SafeAreaView edges={["top"]} style={styles.top} pointerEvents="box-none">
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {categorias.map((c) => {
                        const activo = c.id === categoriaId;
                        return (
                            <Pressable
                                key={c.id}
                                onPress={() => setCategoriaId(activo ? null : c.id)}
                                style={[styles.chip, activo && styles.chipActivo]}
                            >
                                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{c.nombre}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <Text style={styles.contador}>{contador}</Text>
                {estadoUb === "denegada" && (
                    <Text style={[styles.contador, { color: "#B3261E" }]}>No pudimos acceder a tu ubicación</Text>
                )}
            </SafeAreaView>

            {sinResultados && !seleccionado && (
                <View style={styles.vacio}>
                    <Ionicons name="search-outline" size={26} color={colors.primary} />
                    <Text style={styles.vacioTitulo}>No encontramos restaurantes con estos filtros</Text>
                    <Text style={styles.vacioTexto}>Prueba con otra categoría, distancia o calificación.</Text>
                    {filtros.distanciaKm != null && (
                        <Pressable style={styles.vacioBtn} onPress={ampliarDistancia}>
                            <Text style={styles.vacioBtnTxt}>Ampliar distancia</Text>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={() => { setFiltros(FILTROS_VACIOS); setCategoriaId(null); setBusqueda(""); }}
                    >
                        <Text style={styles.vacioLink}>Limpiar filtros</Text>
                    </Pressable>
                </View>
            )}

            <Pressable style={[styles.ubicBtn, { bottom: seleccionado ? 140 : spacing.lg }]} onPress={irAMiUbicacion}>
                <Ionicons name={estadoUb === "ok" ? "locate" : "locate-outline"} size={22} color={colors.primary} />
            </Pressable>

            {seleccionado && (
                <View style={styles.tarjeta}>
                    <RestaurantCard
                        restaurante={seleccionado}
                        distanciaKm={distancias[seleccionado.id]}
                        onClose={() => setSeleccionado(null)}
                        onVerMas={() =>
                            navigation.navigate("Detalle", {
                                restaurante: seleccionado,
                                distanciaKm: distancias[seleccionado.id],
                            })
                        }
                    />
                </View>
            )}

            {verFiltros && (
                <FilterSheet
                    valor={filtros}
                    ubicacionActiva={!!ubicacion}
                    onApply={(f) => { setFiltros(f); setVerFiltros(false); }}
                    onClose={() => setVerFiltros(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    top: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, gap: spacing.sm },
    busquedaFila: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    busqueda: {
        flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm,
        backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 46, elevation: 4,
    },
    input: { flex: 1, color: colors.text, fontSize: 14 },
    filtroBtn: {
        width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primary,
        alignItems: "center", justifyContent: "center", elevation: 4,
    },
    punto: {
        position: "absolute", top: 8, right: 8, width: 9, height: 9, borderRadius: 5,
        backgroundColor: "#fff", borderWidth: 2, borderColor: colors.primary,
    },
    chips: { gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, elevation: 2 },
    chipActivo: { backgroundColor: colors.primary },
    chipTexto: { color: colors.text, fontSize: 13, fontWeight: "600" },
    chipTextoActivo: { color: "#fff" },
    contador: {
        alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: radius.pill,
        paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, color: colors.textMuted, overflow: "hidden",
    },
    tarjeta: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
    ubicBtn: {
        position: "absolute", right: spacing.lg, width: 46, height: 46, borderRadius: 23,
        backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", elevation: 5,
    },
    vacio: {
        position: "absolute", left: spacing.lg, right: spacing.lg, top: "38%", backgroundColor: colors.surface,
        borderRadius: radius.lg, padding: spacing.xl, alignItems: "center", gap: spacing.sm, elevation: 6,
    },
    vacioTitulo: { fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" },
    vacioTexto: { fontSize: 13, color: colors.textMuted, textAlign: "center" },
    vacioBtn: {
        backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 12,
        paddingHorizontal: 24, marginTop: spacing.sm,
    },
    vacioBtnTxt: { color: "#fff", fontWeight: "700" },
    vacioLink: { color: colors.primary, fontWeight: "700", marginTop: spacing.sm },
});
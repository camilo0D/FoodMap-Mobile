import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MapaModos from "../../components/MapaModos";
import { getRestaurantes } from "../../services/restaurant";
import { radius, spacing, themed, useColors } from "../../theme";
import type { Restaurante } from "../../types";

// Mapa de toda la plataforma para el administrador: todos los locales publicados,
// con filtro por categoría, vista de globo y radio alrededor del local elegido.
export default function AdminMapa() {
    const styles = useStyles();
    const colors = useColors();
    const navigation = useNavigation<any>();
    const [lista, setLista] = useState<Restaurante[] | null>(null);
    const [error, setError] = useState(false);
    const [categoriaId, setCategoriaId] = useState<string | null>(null);
    const [seleccionado, setSeleccionado] = useState<Restaurante | null>(null);

    const cargar = useCallback(async () => {
        try { setLista(await getRestaurantes()); setError(false); } catch { setError(true); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const categorias = useMemo(() => {
        const vistas: Record<string, string> = {};
        (lista ?? []).forEach((r: any) => { if (r.categoria) vistas[r.categoria.id] = r.categoria.nombre; });
        return Object.entries(vistas).map(([id, nombre]) => ({ id, nombre }));
    }, [lista]);

    const visibles = useMemo(
        () => (lista ?? []).filter((r: any) => !categoriaId || r.categoria?.id === categoriaId),
        [lista, categoriaId]
    );

    const sinUbicacion = (lista ?? []).filter((r) => !Number(r.latitud) && !Number(r.longitud)).length;

    return (
        <View style={{ flex: 1 }}>
            <MapaModos
                restaurantes={visibles}
                seleccionado={seleccionado}
                onSelect={setSeleccionado}
                ubicacion={null}
                baseControles={seleccionado ? 150 : 16}
            />

            <View style={styles.top} pointerEvents="box-none">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    <Pressable onPress={() => setCategoriaId(null)} style={[styles.chip, !categoriaId && styles.chipActivo]}>
                        <Text style={[styles.chipTxt, !categoriaId && { color: "#fff" }]}>Todos</Text>
                    </Pressable>
                    {categorias.map((c) => {
                        const activo = c.id === categoriaId;
                        return (
                            <Pressable key={c.id} onPress={() => setCategoriaId(activo ? null : c.id)} style={[styles.chip, activo && styles.chipActivo]}>
                                <Text style={[styles.chipTxt, activo && { color: "#fff" }]}>{c.nombre}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
                <View style={styles.resumen}>
                    <Ionicons name="map" size={13} color={colors.primary} />
                    <Text style={styles.resumenTxt}>
                        {error ? "No pudimos cargar el mapa" : lista === null ? "Cargando..." : `${visibles.length} locales en el mapa`}
                        {sinUbicacion > 0 ? ` · ${sinUbicacion} sin ubicación` : ""}
                    </Text>
                </View>
            </View>

            {seleccionado && (
                <View style={styles.tarjeta}>
                    <View style={styles.tarjetaCab}>
                        <View style={styles.icono}><Ionicons name="restaurant" size={20} color={colors.primary} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nombre} numberOfLines={1}>{seleccionado.nombre}</Text>
                            <Text style={styles.sub} numberOfLines={1}>
                                {(seleccionado as any).categoria?.nombre ?? "Sin categoría"} · {seleccionado.direccion || "Sin dirección"}
                            </Text>
                        </View>
                        <Pressable onPress={() => setSeleccionado(null)} hitSlop={10}>
                            <Ionicons name="close" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>
                    <View style={styles.tarjetaPie}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="star" size={14} color={colors.star} />
                            <Text style={styles.sub}>{Number(seleccionado.calificacion_promedio).toFixed(1)} · {seleccionado.total_calificaciones} calif.</Text>
                        </View>
                        <Pressable style={styles.btn} onPress={() => navigation.navigate("Detalle", { restaurante: seleccionado })}>
                            <Text style={styles.btnTxt}>Ver detalle</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const useStyles = themed((colors) => ({
    top: { position: "absolute", top: spacing.sm, left: 0, right: 0, gap: spacing.sm },
    chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, elevation: 2 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { color: colors.text, fontSize: 13, fontWeight: "700" },
    resumen: {
        flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginLeft: spacing.lg,
        backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, elevation: 2,
    },
    resumenTxt: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    tarjeta: {
        position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg, backgroundColor: colors.surface,
        borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, elevation: 6,
    },
    tarjetaCab: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    icono: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 16, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    tarjetaPie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    btn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
    btnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
}));
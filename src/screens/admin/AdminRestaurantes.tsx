import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmDialog from "../../components/ConfirmDialog";
import EstadoBadge from "../../components/EstadoBadge";
import Paginador from "../../components/Paginador";
import { cambiarEstadoRestaurante, eliminarRestauranteAdmin, getRestaurantesAdmin } from "../../services/admin";
import { colors, radius, spacing } from "../../theme";
import type { AdminRestaurante } from "../../types";

const POR_PAGINA = 6;
const ESTADOS = [["todos", "Todos"], ["activo", "Activos"], ["inactivo", "Inactivos"], ["suspendido", "Suspendidos"]] as const;

type Accion = { tipo: "suspender" | "activar" | "eliminar"; r: AdminRestaurante };

function textoDialogo(a: Accion) {
    if (a.tipo === "suspender")
        return { titulo: `¿Suspender ${a.r.nombre}?`, texto: "Dejará de aparecer en el mapa y en las búsquedas. Podrás reactivarlo cuando quieras.", boton: "Suspender restaurante", rojo: true };
    if (a.tipo === "activar")
        return { titulo: `¿Publicar ${a.r.nombre}?`, texto: "Volverá a aparecer en el mapa y en las búsquedas.", boton: "Publicar restaurante", rojo: false };
    return { titulo: `¿Eliminar ${a.r.nombre}?`, texto: "Dejará de aparecer en FoodMap. Esta acción no se puede deshacer desde la app.", boton: "Eliminar restaurante", rojo: true };
}

export default function AdminRestaurantes() {
    const [lista, setLista] = useState<AdminRestaurante[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState<string>("todos");
    const [pagina, setPagina] = useState(1);
    const [accion, setAccion] = useState<Accion | null>(null);
    const [refrescando, setRefrescando] = useState(false);

    const cargar = useCallback(async () => {
        try {
            const todos = await getRestaurantesAdmin();
            setLista(todos.filter((r) => r.estado !== "eliminado"));
            setError(null);
        } catch { setError("No pudimos cargar los restaurantes."); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);
    useEffect(() => { setPagina(1); }, [busqueda, estado]);

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return (lista ?? []).filter(
            (r) => (estado === "todos" || r.estado === estado) &&
                (!q || r.nombre.toLowerCase().includes(q) || (r.dueno_username ?? "").toLowerCase().includes(q))
        );
    }, [lista, busqueda, estado]);

    const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    const confirmar = async () => {
        if (!accion) return;
        const { tipo, r } = accion;
        setAccion(null);
        try {
            if (tipo === "eliminar") {
                await eliminarRestauranteAdmin(r.id);
                setLista((p) => p?.filter((x) => x.id !== r.id) ?? null);
            } else {
                const nuevo = tipo === "suspender" ? "suspendido" : "activo";
                await cambiarEstadoRestaurante(r.id, nuevo);
                setLista((p) => p?.map((x) => (x.id === r.id ? { ...x, estado: nuevo } : x)) ?? null);
            }
            setError(null);
        } catch {
            setError("No pudimos completar la acción. Intenta de nuevo.");
        }
    };

    const dlg = accion ? textoDialogo(accion) : null;

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={visibles}
                keyExtractor={(r) => r.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
                refreshing={refrescando}
                onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }}
                ListHeaderComponent={
                    <View style={{ gap: spacing.md }}>
                        <View>
                            <Text style={styles.titulo}>Restaurantes</Text>
                            <Text style={styles.sub}>{lista?.length ?? 0} restaurantes en la plataforma.</Text>
                        </View>
                        <View style={styles.busqueda}>
                            <Ionicons name="search" size={18} color={colors.textMuted} />
                            <TextInput style={styles.input} placeholder="Buscar por nombre o dueño" placeholderTextColor={colors.textMuted} value={busqueda} onChangeText={setBusqueda} autoCapitalize="none" />
                        </View>
                        <View style={styles.chips}>
                            {ESTADOS.map(([id, label]) => (
                                <Pressable key={id} onPress={() => setEstado(id)} style={[styles.chip, estado === id && styles.chipActivo]}>
                                    <Text style={[styles.chipTxt, estado === id && { color: "#fff" }]}>{label}</Text>
                                </Pressable>
                            ))}
                        </View>
                        {!!error && <Text style={styles.error}>{error}</Text>}
                        <Text style={styles.sub}>Mostrando {visibles.length} de {filtrados.length} restaurantes</Text>
                    </View>
                }
                renderItem={({ item: r }) => (
                    <View style={styles.fila}>
                        <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                            <View style={styles.icono}>
                                <Ionicons name="restaurant" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                                <Text style={styles.sub} numberOfLines={1}>Dueño: {r.dueno_username ?? "sin asignar"}</Text>
                            </View>
                            <EstadoBadge estado={r.estado} />
                        </View>
                        <View style={styles.pie}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Ionicons name="star" size={13} color={colors.star} />
                                <Text style={styles.sub}>{Number(r.calificacion_promedio).toFixed(1)} · {r.total_calificaciones} calif.</Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: spacing.lg, alignItems: "center" }}>
                                {r.estado === "activo" ? (
                                    <Pressable onPress={() => setAccion({ tipo: "suspender", r })}><Text style={styles.accionRoja}>Suspender</Text></Pressable>
                                ) : (
                                    <Pressable onPress={() => setAccion({ tipo: "activar", r })}><Text style={styles.accion}>Publicar</Text></Pressable>
                                )}
                                <Pressable onPress={() => setAccion({ tipo: "eliminar", r })} hitSlop={8}>
                                    <Ionicons name="trash-outline" size={18} color="#B3261E" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", padding: spacing.xl }}>
                        <Text style={styles.nombre}>{lista === null && !error ? "Cargando..." : "No hay restaurantes con estos filtros"}</Text>
                    </View>
                }
                ListFooterComponent={<Paginador pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} onChange={setPagina} />}
            />
            {accion && dlg && (
                <ConfirmDialog titulo={dlg.titulo} texto={dlg.texto} confirmarTxt={dlg.boton} destructivo={dlg.rojo} onConfirm={confirmar} onCancel={() => setAccion(null)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    busqueda: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 44 },
    input: { flex: 1, color: colors.text, fontSize: 14, outlineStyle: "none" } as any,
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
    error: { color: "#B3261E", fontSize: 13 },
    fila: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
    icono: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FBE3D3", alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    pie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    accion: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    accionRoja: { color: "#B3261E", fontWeight: "700", fontSize: 13 },
});
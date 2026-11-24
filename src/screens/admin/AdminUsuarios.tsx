import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import EstadoBadge from "../../components/EstadoBadge";
import Paginador from "../../components/Paginador";
import { useAuth } from "../../context/AuthContext";
import { cambiarEstadoUsuario, eliminarUsuario, getUsuariosAdmin } from "../../services/admin";
import { colors, radius, spacing } from "../../theme";
import type { AdminUsuario } from "../../types";

const POR_PAGINA = 6;
const ESTADOS = [["todos", "Todos"], ["activo", "Activos"], ["inactivo", "Inactivos"], ["suspendido", "Suspendidos"]] as const;

type Accion = { tipo: "suspender" | "activar" | "eliminar"; u: AdminUsuario };

function textoDialogo(a: Accion) {
    const quien = `${a.u.username} (${a.u.email || "sin correo"})`;
    if (a.tipo === "suspender")
        return { titulo: `¿Suspender a ${a.u.username}?`, texto: `${quien}\n\nNo podrá iniciar sesión mientras esté suspendida. Su cuenta y sus reseñas se conservan. Podrás reactivar su acceso desde Usuarios.`, boton: "Suspender usuario", rojo: true };
    if (a.tipo === "activar")
        return { titulo: `¿Reactivar a ${a.u.username}?`, texto: `${quien}\n\nPodrá volver a iniciar sesión.`, boton: "Reactivar usuario", rojo: false };
    return { titulo: `¿Eliminar a ${a.u.username}?`, texto: `${quien}\n\nPerderá el acceso a FoodMap. Esta acción no se puede deshacer desde la app.`, boton: "Eliminar usuario", rojo: true };
}

export default function AdminUsuarios() {
    const { usuario: yo } = useAuth();
    const [lista, setLista] = useState<AdminUsuario[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState<string>("todos");
    const [pagina, setPagina] = useState(1);
    const [accion, setAccion] = useState<Accion | null>(null);
    const [refrescando, setRefrescando] = useState(false);

    const cargar = useCallback(async () => {
        try { setLista(await getUsuariosAdmin()); setError(null); } catch { setError("No pudimos cargar los usuarios."); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);
    useEffect(() => { setPagina(1); }, [busqueda, estado]);

    const conteo = useMemo(() => {
        const c = { activo: 0, inactivo: 0, suspendido: 0 } as Record<string, number>;
        lista?.forEach((u) => { c[u.estado] = (c[u.estado] ?? 0) + 1; });
        return c;
    }, [lista]);

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return (lista ?? []).filter(
            (u) => (estado === "todos" || u.estado === estado) &&
                (!q || u.username.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
        );
    }, [lista, busqueda, estado]);

    const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

    const confirmar = async () => {
        if (!accion) return;
        const { tipo, u } = accion;
        setAccion(null);
        try {
            if (tipo === "eliminar") {
                await eliminarUsuario(u.id);
                setLista((p) => p?.filter((x) => x.id !== u.id) ?? null);
            } else {
                const nuevo = tipo === "suspender" ? "suspendido" : "activo";
                await cambiarEstadoUsuario(u.id, nuevo);
                setLista((p) => p?.map((x) => (x.id === u.id ? { ...x, estado: nuevo } : x)) ?? null);
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
                keyExtractor={(u) => u.id}
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
                refreshing={refrescando}
                onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }}
                ListHeaderComponent={
                    <View style={{ gap: spacing.md }}>
                        <View>
                            <Text style={styles.titulo}>Usuarios</Text>
                            <Text style={styles.sub}>Cuida de quienes forman parte de FoodMap. {lista?.length ?? 0} usuarios registrados.</Text>
                        </View>
                        <View style={styles.grid}>
                            {[["Activos", conteo.activo], ["Inactivos", conteo.inactivo], ["Suspendidos", conteo.suspendido], ["Total", lista?.length ?? 0]].map(([t, v]) => (
                                <View key={String(t)} style={styles.stat}>
                                    <Text style={styles.statTitulo}>{t}</Text>
                                    <Text style={styles.statValor}>{v ?? 0}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.busqueda}>
                            <Ionicons name="search" size={18} color={colors.textMuted} />
                            <TextInput style={styles.input} placeholder="Buscar por nombre o correo" placeholderTextColor={colors.textMuted} value={busqueda} onChangeText={setBusqueda} autoCapitalize="none" />
                        </View>
                        <View style={styles.chips}>
                            {ESTADOS.map(([id, label]) => (
                                <Pressable key={id} onPress={() => setEstado(id)} style={[styles.chip, estado === id && styles.chipActivo]}>
                                    <Text style={[styles.chipTxt, estado === id && { color: "#fff" }]}>{label}</Text>
                                </Pressable>
                            ))}
                        </View>
                        {!!error && <Text style={styles.error}>{error}</Text>}
                        <Text style={styles.sub}>Mostrando {visibles.length} de {filtrados.length} usuarios</Text>
                    </View>
                }
                renderItem={({ item: u }) => {
                    const soyYo = u.id === yo?.id;
                    return (
                        <View style={styles.fila}>
                            <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                                <Avatar nombre={u.username} size={40} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nombre} numberOfLines={1}>{u.username}</Text>
                                    <Text style={styles.sub} numberOfLines={1}>{u.email || "Sin correo"}</Text>
                                </View>
                                <EstadoBadge estado={u.estado} />
                            </View>
                            <View style={styles.pie}>
                                <Text style={styles.rol}>{u.roles.join(" · ") || "Sin rol"}</Text>
                                {soyYo ? (
                                    <Text style={styles.sub}>Eres tú</Text>
                                ) : (
                                    <View style={{ flexDirection: "row", gap: spacing.lg, alignItems: "center" }}>
                                        {u.estado === "activo" ? (
                                            <Pressable onPress={() => setAccion({ tipo: "suspender", u })}><Text style={styles.accionRoja}>Suspender</Text></Pressable>
                                        ) : (
                                            <Pressable onPress={() => setAccion({ tipo: "activar", u })}><Text style={styles.accion}>{u.estado === "suspendido" ? "Reactivar" : "Activar"}</Text></Pressable>
                                        )}
                                        <Pressable onPress={() => setAccion({ tipo: "eliminar", u })} hitSlop={8}>
                                            <Ionicons name="trash-outline" size={18} color="#B3261E" />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        <Text style={styles.nombre}>{lista === null && !error ? "Cargando..." : "No hay usuarios con estos filtros"}</Text>
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
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    stat: { width: "48.5%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    statTitulo: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    statValor: { fontSize: 26, fontWeight: "800", color: colors.text },
    busqueda: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 44 },
    input: { flex: 1, color: colors.text, fontSize: 14, outlineStyle: "none" } as any,
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
    error: { color: "#B3261E", fontSize: 13 },
    fila: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    pie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    rol: { fontSize: 12, color: colors.textMuted, textTransform: "capitalize" },
    accion: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    accionRoja: { color: "#B3261E", fontWeight: "700", fontSize: 13 },
    vacio: { alignItems: "center", padding: spacing.xl },
});
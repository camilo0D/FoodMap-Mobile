import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import EstadoBadge from "../../components/EstadoBadge";
import Paginador from "../../components/Paginador";
import {
    asignarDueno, cambiarEstadoRestaurante, eliminarRestauranteAdmin, getRestaurantesAdmin, getUsuariosAdmin,
} from "../../services/admin";
import { radius, spacing, themed, useColors } from "../../theme";
import type { AdminRestaurante, AdminUsuario } from "../../types";

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

/* Hoja para elegir el dueño de un restaurante entre los usuarios con rol "restaurante". */
function AsignarDuenoSheet({ restaurante, onClose, onDone }: { restaurante: AdminRestaurante; onClose: () => void; onDone: (username: string) => void }) {
    const styles = useStyles();
    const colors = useColors();
    const [duenos, setDuenos] = useState<AdminUsuario[] | null>(null);
    const [q, setQ] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getUsuariosAdmin()
            .then((us) => setDuenos(us.filter((u) => u.roles.includes("restaurante") && u.estado === "activo")))
            .catch(() => { setDuenos([]); setError("No pudimos cargar los usuarios."); });
    }, []);

    const lista = (duenos ?? []).filter((u) => !q.trim() || u.username.toLowerCase().includes(q.trim().toLowerCase()));

    const elegir = async (u: AdminUsuario) => {
        setGuardando(true);
        try {
            await asignarDueno(restaurante.id, u.id);
            onDone(u.username);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? "No pudimos asignar el dueño.");
            setGuardando(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <Pressable style={styles.fondo} onPress={onClose} />
            <View style={styles.hoja}>
                <View style={styles.asa} />
                <Text style={styles.hojaTitulo}>Asignar dueño</Text>
                <Text style={styles.sub}>Elige quién administrará {restaurante.nombre}. Solo aparecen usuarios con rol de dueño.</Text>
                <View style={[styles.busqueda, { marginTop: spacing.md }]}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput style={styles.input} placeholder="Buscar usuario" placeholderTextColor={colors.textMuted} value={q} onChangeText={setQ} autoCapitalize="none" />
                </View>
                {!!error && <Text style={styles.error}>{error}</Text>}
                <ScrollView style={{ maxHeight: 300, marginTop: spacing.md }} contentContainerStyle={{ gap: spacing.sm }}>
                    {duenos === null && <ActivityIndicator color={colors.primary} />}
                    {duenos?.length === 0 && !error && (
                        <Text style={styles.sub}>No hay usuarios con rol de dueño. Dáselo primero desde Usuarios → Roles.</Text>
                    )}
                    {lista.map((u) => (
                        <Pressable key={u.id} style={styles.duenoFila} disabled={guardando} onPress={() => elegir(u)}>
                            <Avatar uri={(u as any).avatar} nombre={u.username} size={38} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nombre} numberOfLines={1}>{u.username}</Text>
                                <Text style={styles.sub} numberOfLines={1}>{u.email || "Sin correo"}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </Pressable>
                    ))}
                </ScrollView>
                <Pressable onPress={onClose} style={{ alignItems: "center", paddingVertical: 12 }}>
                    <Text style={styles.accion}>Cancelar</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function AdminRestaurantes() {
    const styles = useStyles();
    const colors = useColors();
    const [lista, setLista] = useState<AdminRestaurante[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState<string>("todos");
    const [pagina, setPagina] = useState(1);
    const [accion, setAccion] = useState<Accion | null>(null);
    const [asignar, setAsignar] = useState<AdminRestaurante | null>(null);
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

    const mostrarAviso = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 4000); };

    const conteo = useMemo(() => {
        const l = lista ?? [];
        return {
            total: l.length,
            activos: l.filter((r) => r.estado === "activo").length,
            suspendidos: l.filter((r) => r.estado === "suspendido").length,
            sinDueno: l.filter((r) => !r.dueno_username).length,
        };
    }, [lista]);

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
                mostrarAviso(`${r.nombre} fue eliminado.`);
            } else {
                await cambiarEstadoRestaurante(r.id, tipo === "suspender" ? "suspendido" : "activo");
                mostrarAviso(tipo === "suspender" ? `${r.nombre} fue suspendido y ya no aparece en el mapa.` : `${r.nombre} fue publicado.`);
            }
            setError(null);
            await cargar();
        } catch (e: any) {
            setAviso(null);
            setError(e?.response?.data?.error ?? "No pudimos completar la acción. Intenta de nuevo.");
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
                            <Text style={styles.titulo}>Locales</Text>
                            <Text style={styles.sub}>Los restaurantes de la plataforma y quién los administra.</Text>
                        </View>
                        <View style={styles.grid}>
                            {[
                                ["Total", conteo.total, "storefront", colors.primary],
                                ["Activos", conteo.activos, "checkmark-circle", "#2E9E5B"],
                                ["Suspendidos", conteo.suspendidos, "ban", "#E5383B"],
                                ["Sin dueño", conteo.sinDueno, "person-add", "#F5B301"],
                            ].map(([t, v, ic, c]) => (
                                <View key={String(t)} style={styles.stat}>
                                    <Ionicons name={ic as any} size={18} color={String(c)} />
                                    <Text style={styles.statValor}>{v as number}</Text>
                                    <Text style={styles.statTitulo}>{t as string}</Text>
                                </View>
                            ))}
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
                        {!!aviso && (
                            <View style={styles.aviso}>
                                <Ionicons name="checkmark-circle" size={18} color="#1F7A44" />
                                <Text style={styles.avisoTxt}>{aviso}</Text>
                            </View>
                        )}
                        {!!error && <Text style={styles.error}>{error}</Text>}
                        <Text style={styles.sub}>Mostrando {visibles.length} de {filtrados.length} restaurantes</Text>
                    </View>
                }
                renderItem={({ item: r }) => (
                    <View style={[styles.fila, r.estado === "suspendido" && styles.filaSuspendida]}>
                        {r.estado === "suspendido" && (
                            <View style={styles.banda}>
                                <Ionicons name="ban" size={13} color="#fff" />
                                <Text style={styles.bandaTxt}>Suspendido · oculto en el mapa</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                            <View style={styles.icono}>
                                <Ionicons name="restaurant" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Ionicons name="star" size={12} color={colors.star} />
                                    <Text style={styles.sub}>{Number(r.calificacion_promedio).toFixed(1)} · {r.total_calificaciones} calif.</Text>
                                </View>
                            </View>
                            <EstadoBadge estado={r.estado} />
                        </View>

                        <Pressable style={styles.dueno} onPress={() => setAsignar(r)}>
                            <Ionicons name={r.dueno_username ? "person-circle" : "person-add-outline"} size={20} color={r.dueno_username ? colors.primary : "#F5B301"} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.duenoEt}>Dueño</Text>
                                <Text style={styles.duenoNombre}>{r.dueno_username ?? "Sin asignar"}</Text>
                            </View>
                            <Text style={styles.accion}>{r.dueno_username ? "Cambiar" : "Asignar"}</Text>
                        </Pressable>

                        <View style={styles.pie}>
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
            {asignar && (
                <AsignarDuenoSheet
                    restaurante={asignar}
                    onClose={() => setAsignar(null)}
                    onDone={(u) => { mostrarAviso(`${asignar.nombre} ahora es de ${u}.`); setAsignar(null); cargar(); }}
                />
            )}
        </View>
    );
}

const useStyles = themed((colors) => ({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    grid: { flexDirection: "row", gap: spacing.sm },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 2, alignItems: "flex-start" },
    statValor: { fontSize: 22, fontWeight: "800", color: colors.text },
    statTitulo: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    busqueda: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 44 },
    input: { flex: 1, color: colors.text, fontSize: 14, ...({ outlineStyle: "none" } as any) },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
    error: { color: "#B3261E", fontSize: 13 },
    aviso: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#E3F4EA", borderRadius: radius.md, padding: spacing.md },
    avisoTxt: { color: "#1F7A44", fontWeight: "600", fontSize: 13, flex: 1 },
    fila: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
    filaSuspendida: { borderWidth: 1.5, borderColor: "#B3261E" },
    banda: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "#B3261E", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    bandaTxt: { color: "#fff", fontSize: 11, fontWeight: "800" },
    icono: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    dueno: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
    duenoEt: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    duenoNombre: { fontSize: 14, fontWeight: "700", color: colors.text },
    pie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    accion: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    accionRoja: { color: "#B3261E", fontWeight: "700", fontSize: 13 },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", zIndex: 50 },
    fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
    hoja: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, paddingTop: spacing.md },
    asa: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
    hojaTitulo: { fontSize: 20, fontWeight: "800", color: colors.text },
    duenoFila: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
}));
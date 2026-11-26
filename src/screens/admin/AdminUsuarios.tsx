import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import EstadoBadge from "../../components/EstadoBadge";
import Paginador from "../../components/Paginador";
import { useAuth } from "../../context/AuthContext";
import { cambiarEstadoUsuario, eliminarUsuario, getUsuariosAdmin } from "../../services/admin";
import { radius, spacing, themed, useColors } from "../../theme";
import type { AdminUsuario } from "../../types";
import RolesSheet from "./RolesSheet";

const POR_PAGINA = 6;
const ESTADOS = [["todos", "Todos"], ["activo", "Activos"], ["inactivo", "Inactivos"], ["suspendido", "Suspendidos"]] as const;
const ETIQUETA_ROL: Record<string, string> = { usuario: "Comensal", restaurante: "Dueño", admin: "Admin" };

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
    const styles = useStyles();
    const colors = useColors();
    const { usuario: yo } = useAuth();
    const [lista, setLista] = useState<AdminUsuario[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState<string>("todos");
    const [pagina, setPagina] = useState(1);
    const [accion, setAccion] = useState<Accion | null>(null);
    const [rolesDe, setRolesDe] = useState<AdminUsuario | null>(null);
    const [refrescando, setRefrescando] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);

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
                setAviso(`${u.username} fue eliminado.`);
            } else {
                const nuevo = tipo === "suspender" ? "suspendido" : "activo";
                await cambiarEstadoUsuario(u.id, nuevo);
                setAviso(tipo === "suspender" ? `${u.username} fue suspendido y ya no puede iniciar sesión.` : `${u.username} fue reactivado.`);
            }
            setError(null);
            await cargar(); // el servidor es la fuente de verdad: así el estado siempre coincide
            setTimeout(() => setAviso(null), 4000);
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
                            {[["Activos", conteo.activo, "checkmark-circle"], ["Inactivos", conteo.inactivo, "moon"], ["Suspendidos", conteo.suspendido, "ban"], ["Total", lista?.length ?? 0, "people"]].map(([t, v, ic]) => (
                                <View key={String(t)} style={styles.stat}>
                                    <View style={styles.statIcono}>
                                        <Ionicons name={ic as any} size={16} color={colors.primary} />
                                    </View>
                                    <Text style={styles.statValor}>{v ?? 0}</Text>
                                    <Text style={styles.statTitulo}>{t}</Text>
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
                        {!!aviso && (
                            <View style={styles.aviso}>
                                <Ionicons name="checkmark-circle" size={18} color="#1F7A44" />
                                <Text style={styles.avisoTxt}>{aviso}</Text>
                            </View>
                        )}
                        {!!error && <Text style={styles.error}>{error}</Text>}
                        <Text style={styles.sub}>Mostrando {visibles.length} de {filtrados.length} usuarios</Text>
                    </View>
                }
                renderItem={({ item: u }) => {
                    const soyYo = u.id === yo?.id;
                    return (
                        <View style={[styles.fila, u.estado === "suspendido" && styles.filaSuspendida]}>
                            {u.estado === "suspendido" && (
                                <View style={styles.bandaSusp}>
                                    <Ionicons name="ban" size={13} color="#fff" />
                                    <Text style={styles.bandaSuspTxt}>Cuenta suspendida</Text>
                                </View>
                            )}
                            <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                                <Avatar uri={(u as any).avatar} nombre={u.username} size={42} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nombre} numberOfLines={1}>{u.username}{soyYo ? "  (tú)" : ""}</Text>
                                    <Text style={styles.sub} numberOfLines={1}>{u.email || "Sin correo"}</Text>
                                </View>
                                <EstadoBadge estado={u.estado} />
                            </View>

                            <View style={styles.roles}>
                                {(u.roles.length ? u.roles : ["sin rol"]).map((r) => (
                                    <View key={r} style={[styles.rolChip, r === "admin" && { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.rolChipTxt, r === "admin" && { color: "#fff" }]}>{ETIQUETA_ROL[r] ?? r}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.pie}>
                                <Pressable style={styles.btnRoles} onPress={() => setRolesDe(u)}>
                                    <Ionicons name="key-outline" size={15} color={colors.primary} />
                                    <Text style={styles.accion}>Roles</Text>
                                </Pressable>
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
            {rolesDe && (
                <RolesSheet
                    usuario={rolesDe}
                    esYo={rolesDe.id === yo?.id}
                    onClose={() => setRolesDe(null)}
                    onSaved={(roles) => {
                        setLista((p) => p?.map((x) => (x.id === rolesDe.id ? { ...x, roles } : x)) ?? null);
                        setRolesDe((u) => (u ? { ...u, roles } : u));
                    }}
                />
            )}
        </View>
    );
}

const useStyles = themed((colors) => ({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    stat: { width: "48.5%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
    statIcono: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    statTitulo: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    statValor: { fontSize: 26, fontWeight: "800", color: colors.text },
    busqueda: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 44 },
    input: { flex: 1, color: colors.text, fontSize: 14, ...({ outlineStyle: "none" } as any) },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
    error: { color: "#B3261E", fontSize: 13 },
    fila: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    roles: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    rolChip: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    rolChipTxt: { fontSize: 11, fontWeight: "700", color: colors.text },
    pie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    btnRoles: { flexDirection: "row", alignItems: "center", gap: 5 },
    accion: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    accionRoja: { color: "#B3261E", fontWeight: "700", fontSize: 13 },
    aviso: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#E3F4EA", borderRadius: radius.md, padding: spacing.md },
    avisoTxt: { color: "#1F7A44", fontWeight: "600", fontSize: 13, flex: 1 },
    filaSuspendida: { borderWidth: 1.5, borderColor: "#B3261E" },
    bandaSusp: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "#B3261E", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    bandaSuspTxt: { color: "#fff", fontSize: 11, fontWeight: "800" },
    vacio: { alignItems: "center", padding: spacing.xl },
}));
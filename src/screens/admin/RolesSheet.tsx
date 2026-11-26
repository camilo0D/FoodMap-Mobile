import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { asignarDueno, getRestaurantesAdmin, actualizarRolesUsuario } from "../../services/admin";
import { radius, spacing, themed, useColors } from "../../theme";
import type { AdminRestaurante, AdminUsuario } from "../../types";

const ROLES = [
    { id: "usuario", titulo: "Comensal", texto: "Explora restaurantes, guarda favoritos y escribe reseñas.", icono: "person-outline" },
    { id: "restaurante", titulo: "Dueño de restaurante", texto: "Administra su local, su menú y sus reseñas.", icono: "storefront-outline" },
    { id: "admin", titulo: "Administrador", texto: "Gestiona usuarios, restaurantes, categorías y roles.", icono: "shield-checkmark-outline" },
] as const;

type Props = {
    usuario: AdminUsuario;
    esYo: boolean;
    onClose: () => void;
    onSaved: (roles: string[]) => void;
};

function mensaje(e: any, defecto: string) {
    return e?.response?.data?.error ?? defecto;
}

export default function RolesSheet({ usuario, esYo, onClose, onSaved }: Props) {
    const styles = useStyles();
    const colors = useColors();
    const [roles, setRoles] = useState<string[]>(usuario.roles);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paso, setPaso] = useState<"roles" | "restaurante">("roles");
    const [locales, setLocales] = useState<AdminRestaurante[] | null>(null);
    const [asignado, setAsignado] = useState<string | null>(null);

    useEffect(() => {
        if (paso === "restaurante" && locales === null) {
            getRestaurantesAdmin().then(setLocales).catch(() => { setLocales([]); setError("No pudimos cargar los restaurantes."); });
        }
    }, [paso]);

    const alternar = (id: string) => {
        setError(null);
        setRoles((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
    };

    const cambio = roles.slice().sort().join() !== usuario.roles.slice().sort().join();

    const guardar = async () => {
        if (roles.length === 0) { setError("Elige al menos un rol."); return; }
        setGuardando(true);
        try {
            await actualizarRolesUsuario(usuario.id, roles);
            onSaved(roles);
        } catch (e) {
            setError(mensaje(e, "No pudimos guardar los roles."));
        } finally {
            setGuardando(false);
        }
    };

    const elegirLocal = async (r: AdminRestaurante) => {
        setGuardando(true);
        try {
            await asignarDueno(r.id, usuario.id);
            setAsignado(r.nombre);
            setError(null);
        } catch (e) {
            setError(mensaje(e, "No pudimos asignar el restaurante."));
        } finally {
            setGuardando(false);
        }
    };

    const esDueno = usuario.roles.includes("restaurante");

    return (
        <View style={styles.overlay}>
            <Pressable style={styles.fondo} onPress={onClose} />
            <View style={styles.hoja}>
                <View style={styles.asa} />
                {paso === "roles" ? (
                    <>
                        <Text style={styles.titulo}>Roles de {usuario.username}</Text>
                        <Text style={styles.sub}>Un usuario puede tener varios roles a la vez.</Text>

                        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                            {ROLES.map((r) => {
                                const activo = roles.includes(r.id);
                                const bloqueado = esYo && r.id === "admin";
                                return (
                                    <Pressable
                                        key={r.id}
                                        onPress={() => !bloqueado && alternar(r.id)}
                                        style={[styles.rol, activo && styles.rolActivo, bloqueado && { opacity: 0.6 }]}
                                    >
                                        <View style={[styles.rolIcono, activo && { backgroundColor: colors.primary }]}>
                                            <Ionicons name={r.icono as any} size={20} color={activo ? "#fff" : colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.rolTitulo}>{r.titulo}</Text>
                                            <Text style={styles.sub}>{bloqueado ? "No puedes quitarte este rol a ti mismo." : r.texto}</Text>
                                        </View>
                                        <Ionicons name={activo ? "checkmark-circle" : "ellipse-outline"} size={24} color={activo ? colors.primary : colors.textMuted} />
                                    </Pressable>
                                );
                            })}
                        </View>

                        {!!error && <Text style={styles.error}>{error}</Text>}

                        <Pressable style={[styles.boton, (!cambio || guardando) && { opacity: 0.5 }]} disabled={!cambio || guardando} onPress={guardar}>
                            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Guardar roles</Text>}
                        </Pressable>

                        {(esDueno || roles.includes("restaurante")) && !cambio && (
                            <Pressable style={styles.btnSec} onPress={() => setPaso("restaurante")}>
                                <Ionicons name="link-outline" size={18} color={colors.primary} />
                                <Text style={styles.btnSecTxt}>Asignar a un restaurante</Text>
                            </Pressable>
                        )}
                        {roles.includes("restaurante") && cambio && (
                            <Text style={styles.sub}>Guarda primero los roles; luego podrás asignarle un restaurante.</Text>
                        )}
                        <Pressable onPress={onClose} style={{ alignItems: "center", paddingVertical: 10 }}>
                            <Text style={styles.cerrar}>Cerrar</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Pressable onPress={() => { setPaso("roles"); setAsignado(null); setError(null); }} style={styles.volver}>
                            <Ionicons name="chevron-back" size={18} color={colors.primary} />
                            <Text style={styles.cerrar}>Roles</Text>
                        </Pressable>
                        <Text style={styles.titulo}>Asignar restaurante</Text>
                        <Text style={styles.sub}>Elige el local que administrará {usuario.username}.</Text>

                        {!!asignado && (
                            <View style={styles.exito}>
                                <Ionicons name="checkmark-circle" size={18} color="#1F7A44" />
                                <Text style={styles.exitoTxt}>{asignado} ahora es de {usuario.username}.</Text>
                            </View>
                        )}
                        {!!error && <Text style={styles.error}>{error}</Text>}

                        <ScrollView style={{ maxHeight: 320, marginTop: spacing.md }} contentContainerStyle={{ gap: spacing.sm }}>
                            {locales === null && <ActivityIndicator color={colors.primary} />}
                            {locales?.length === 0 && <Text style={styles.sub}>No hay restaurantes para asignar.</Text>}
                            {locales?.map((r) => {
                                const actual = (r as any).dueno_username ?? (r as any).dueno?.username ?? null;
                                return (
                                    <Pressable key={r.id} style={styles.local} disabled={guardando} onPress={() => elegirLocal(r)}>
                                        <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.rolTitulo} numberOfLines={1}>{r.nombre}</Text>
                                            <Text style={styles.sub} numberOfLines={1}>{actual ? `Dueño actual: ${actual}` : "Sin dueño asignado"}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </>
                )}
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", zIndex: 50 },
    fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
    hoja: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, paddingTop: spacing.md, gap: 4 },
    asa: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
    titulo: { fontSize: 20, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    rol: {
        flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface,
        borderRadius: radius.lg, padding: spacing.md, borderWidth: 1.5, borderColor: "transparent",
    },
    rolActivo: { borderColor: colors.primary },
    rolIcono: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    rolTitulo: { fontSize: 15, fontWeight: "700", color: colors.text },
    error: { color: "#B3261E", fontSize: 13, marginTop: spacing.sm },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    btnSec: {
        flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5,
        borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, marginTop: spacing.sm,
    },
    btnSecTxt: { color: colors.primary, fontWeight: "700" },
    cerrar: { color: colors.primary, fontWeight: "700" },
    volver: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
    local: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    exito: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#E3F4EA", borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
    exitoTxt: { color: "#1F7A44", fontWeight: "600", fontSize: 13, flex: 1 },
}));
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRolesAdmin } from "../../services/admin";
import { mezclar, radius, spacing, themed, useColors } from "../../theme";
import type { AdminRol } from "../../types";

const INFO: Record<string, { titulo: string; texto: string; icono: string; color: string }> = {
    usuario: { titulo: "Comensal", texto: "Explora el mapa, guarda favoritos y escribe reseñas.", icono: "person", color: "#2F7CF6" },
    restaurante: { titulo: "Dueño de restaurante", texto: "Administra su local, su menú, sus reseñas y su espacio de negocio.", icono: "storefront", color: "#F26A21" },
    admin: { titulo: "Administrador", texto: "Gestiona usuarios, locales, categorías y roles de toda la plataforma.", icono: "shield-checkmark", color: "#8B5CF6" },
};

const etiqueta = (clave: string) => {
    const t = clave.replace(/_/g, " ");
    return t.charAt(0).toUpperCase() + t.slice(1);
};

export default function AdminRoles() {
    const styles = useStyles();
    const colors = useColors();
    const [roles, setRoles] = useState<AdminRol[] | null>(null);
    const [error, setError] = useState(false);
    const [refrescando, setRefrescando] = useState(false);

    const cargar = useCallback(async () => {
        try { setRoles(await getRolesAdmin()); setError(false); } catch { setError(true); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const total = useMemo(() => (roles ?? []).reduce((s, r) => s + r.usuarios, 0), [roles]);

    return (
        <ScrollView
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            refreshControl={<RefreshControl refreshing={refrescando} tintColor={colors.primary}
                onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} />}
        >
            <View>
                <Text style={styles.titulo}>Roles</Text>
                <Text style={styles.sub}>Qué puede hacer cada tipo de cuenta. Para cambiar el rol de alguien, ve a Usuarios → Roles.</Text>
            </View>

            {error && (
                <View style={{ alignItems: "center", gap: 8, padding: spacing.xl }}>
                    <Ionicons name="cloud-offline-outline" size={30} color={colors.primary} />
                    <Text style={styles.sub}>No pudimos cargar los roles</Text>
                </View>
            )}
            {roles === null && !error && <Text style={styles.sub}>Cargando...</Text>}

            {roles && roles.length > 0 && (
                <View style={styles.resumen}>
                    <Text style={styles.resumenTitulo}>Reparto de roles</Text>
                    <View style={styles.apilada}>
                        {roles.filter((r) => r.usuarios > 0).map((r) => (
                            <View key={r.id} style={{ flex: r.usuarios, backgroundColor: INFO[r.nombre]?.color ?? colors.primary }} />
                        ))}
                    </View>
                    <View style={{ gap: 6 }}>
                        {roles.map((r) => (
                            <View key={r.id} style={styles.leyenda}>
                                <View style={[styles.punto, { backgroundColor: INFO[r.nombre]?.color ?? colors.primary }]} />
                                <Text style={styles.leyendaTxt}>{INFO[r.nombre]?.titulo ?? etiqueta(r.nombre)}</Text>
                                <Text style={styles.leyendaNum}>{r.usuarios}{total ? ` · ${Math.round((r.usuarios / total) * 100)}%` : ""}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {roles?.map((r) => {
                const info = INFO[r.nombre];
                const color = info?.color ?? colors.primary;
                const permisos = Object.entries(r.permisos ?? {}).filter(([, v]) => v === true);
                return (
                    <View key={r.id} style={styles.card}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                            <View style={[styles.rolIcono, { backgroundColor: mezclar(color, "#FFFFFF", 0.2) }]}>
                                <Ionicons name={(info?.icono ?? "key") as any} size={22} color={color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nombre}>{info?.titulo ?? etiqueta(r.nombre)}</Text>
                                <Text style={styles.sub}>{info?.texto ?? "Rol personalizado."}</Text>
                            </View>
                        </View>
                        <View style={styles.cuenta}>
                            <Ionicons name="people-outline" size={14} color={color} />
                            <Text style={[styles.cuentaTxt, { color }]}>{r.usuarios} {r.usuarios === 1 ? "usuario" : "usuarios"}</Text>
                        </View>
                        {permisos.length === 0 ? (
                            <Text style={styles.sub}>Sin permisos específicos definidos.</Text>
                        ) : (
                            <View style={styles.chips}>
                                {permisos.map(([k]) => (
                                    <View key={k} style={styles.chip}>
                                        <Ionicons name="checkmark" size={12} color="#1F7A44" />
                                        <Text style={styles.chipTxt}>{etiqueta(k)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

const useStyles = themed((colors) => ({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    resumen: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
    resumenTitulo: { fontSize: 16, fontWeight: "800", color: colors.text },
    apilada: { flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden", gap: 2 },
    leyenda: { flexDirection: "row", alignItems: "center", gap: 8 },
    punto: { width: 10, height: 10, borderRadius: 5 },
    leyendaTxt: { flex: 1, fontSize: 13, color: colors.text, fontWeight: "600" },
    leyendaNum: { fontSize: 13, color: colors.textMuted, fontWeight: "700" },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
    rolIcono: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 17, fontWeight: "800", color: colors.text },
    cuenta: { flexDirection: "row", alignItems: "center", gap: 6 },
    cuentaTxt: { fontSize: 13, fontWeight: "800" },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E3F5E8", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
    chipTxt: { fontSize: 12, fontWeight: "600", color: "#1F7A44" },
}));
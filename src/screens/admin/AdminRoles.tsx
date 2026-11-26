import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRolesAdmin } from "../../services/admin";
import { radius, spacing, themed, useColors } from "../../theme";
import type { AdminRol } from "../../types";

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

    return (
        <ScrollView
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            refreshControl={<RefreshControl refreshing={refrescando} tintColor={colors.primary}
                onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} />}
        >
            <View>
                <Text style={styles.titulo}>Roles</Text>
                <Text style={styles.sub}>Qué puede hacer cada tipo de cuenta.</Text>
            </View>

            {error && (
                <View style={{ alignItems: "center", gap: 8, padding: spacing.xl }}>
                    <Ionicons name="cloud-offline-outline" size={30} color={colors.primary} />
                    <Text style={styles.sub}>No pudimos cargar los roles</Text>
                </View>
            )}
            {roles === null && !error && <Text style={styles.sub}>Cargando...</Text>}

            {roles?.map((r) => {
                const permisos = Object.entries(r.permisos ?? {}).filter(([, v]) => v === true);
                return (
                    <View key={r.id} style={styles.card}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.nombre}>{r.nombre}</Text>
                            <View style={styles.cuenta}>
                                <Ionicons name="people-outline" size={14} color={colors.primary} />
                                <Text style={styles.cuentaTxt}>{r.usuarios} {r.usuarios === 1 ? "usuario" : "usuarios"}</Text>
                            </View>
                        </View>
                        {permisos.length === 0 ? (
                            <Text style={styles.sub}>Sin permisos definidos.</Text>
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
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
    nombre: { fontSize: 18, fontWeight: "800", color: colors.text, textTransform: "capitalize" },
    cuenta: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
    cuentaTxt: { fontSize: 12, fontWeight: "700", color: colors.primary },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E3F5E8", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
    chipTxt: { fontSize: 12, fontWeight: "600", color: "#1F7A44" },
}));
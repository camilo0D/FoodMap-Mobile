import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getResumenAdmin } from "../../services/admin";
import { colors, radius, spacing } from "../../theme";
import type { AdminResumen as Resumen } from "../../types";

function Tarjeta({ titulo, valor, nota }: { titulo: string; valor: number; nota?: string }) {
    return (
        <View style={styles.tarjeta}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.valor}>{valor}</Text>
            {!!nota && <Text style={styles.nota}>{nota}</Text>}
        </View>
    );
}

export default function AdminResumen() {
    const [r, setR] = useState<Resumen | null>(null);
    const [error, setError] = useState(false);
    const [refrescando, setRefrescando] = useState(false);

    const cargar = useCallback(async () => {
        try { setR(await getResumenAdmin()); setError(false); } catch { setError(true); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    if (error) {
        return (
            <View style={styles.centro}>
                <Ionicons name="cloud-offline-outline" size={32} color={colors.primary} />
                <Text style={styles.msg}>No pudimos cargar el resumen</Text>
            </View>
        );
    }
    if (!r) return <View style={styles.centro}><Text style={styles.msg}>Cargando...</Text></View>;

    const inactivosU = r.usuarios.total - r.usuarios.activos - r.usuarios.suspendidos;
    const inactivosR = r.restaurantes.total - r.restaurantes.activos - r.restaurantes.suspendidos;

    return (
        <ScrollView
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            refreshControl={<RefreshControl refreshing={refrescando} tintColor={colors.primary}
                onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} />}
        >
            <Text style={styles.seccion}>Usuarios</Text>
            <View style={styles.grid}>
                <Tarjeta titulo="Activos" valor={r.usuarios.activos} />
                <Tarjeta titulo="Inactivos" valor={inactivosU} />
                <Tarjeta titulo="Suspendidos" valor={r.usuarios.suspendidos} />
                <Tarjeta titulo="Total" valor={r.usuarios.total} />
            </View>
            <Text style={styles.seccion}>Restaurantes</Text>
            <View style={styles.grid}>
                <Tarjeta titulo="Activos" valor={r.restaurantes.activos} />
                <Tarjeta titulo="Inactivos" valor={inactivosR} />
                <Tarjeta titulo="Suspendidos" valor={r.restaurantes.suspendidos} />
                <Tarjeta titulo="Total" valor={r.restaurantes.total} />
            </View>
            <Text style={styles.seccion}>Reseñas</Text>
            <View style={styles.grid}>
                <Tarjeta titulo="Total publicadas" valor={r.resenas.total} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
    msg: { color: colors.textMuted, fontWeight: "600" },
    seccion: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    tarjeta: { width: "47.5%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
    titulo: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
    valor: { fontSize: 32, fontWeight: "800", color: colors.text, marginTop: 2 },
    nota: { fontSize: 11, color: colors.textMuted },
});
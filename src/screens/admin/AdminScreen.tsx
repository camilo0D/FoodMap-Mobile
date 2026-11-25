import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Logo from "../../components/Logo";
import AdminResumen from "./AdminResumen";
import AdminUsuarios from "./AdminUsuarios";
import AdminRestaurantes from "./AdminRestaurantes";
import AdminCategorias from "./AdminCategorias";
import AdminRoles from "./AdminRoles";
import { colors, radius, spacing } from "../../theme";

const TABS = [
    ["resumen", "Resumen"], ["usuarios", "Usuarios"], ["restaurantes", "Restaurantes"],
    ["categorias", "Categorías"], ["roles", "Roles"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function AdminScreen() {
    const navigation = useNavigation<any>();
    const [tab, setTab] = useState<Tab>("resumen");

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Logo size={34} />
                    <Text style={styles.marca}>FoodMap</Text>
                </View>
                <Pressable onPress={() => navigation.navigate("Configuracion")} hitSlop={10}>
                    <Ionicons name="person-circle-outline" size={30} color={colors.text} />
                </Pressable>
            </View>
            <Text style={styles.panel}>Panel administrativo</Text>

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {TABS.map(([id, label]) => (
                        <Pressable key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActiva]}>
                            <Text style={[styles.tabTxt, tab === id && { color: "#fff" }]}>{label}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
                {tab === "resumen" && <AdminResumen />}
                {tab === "usuarios" && <AdminUsuarios />}
                {tab === "restaurantes" && <AdminRestaurantes />}
                {tab === "categorias" && <AdminCategorias />}
                {tab === "roles" && <AdminRoles />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    marca: { fontSize: 18, fontWeight: "800", color: colors.text },
    panel: { paddingHorizontal: spacing.lg, marginTop: spacing.md, fontSize: 13, fontWeight: "600", color: colors.textMuted },
    tabs: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    tab: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
    tabActiva: { backgroundColor: colors.primary },
    tabTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
});
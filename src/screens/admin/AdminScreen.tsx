import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getPerfil } from "../../services/profile";
import Avatar from "../../components/Avatar";
import ThemeSwitch from "../../components/ThemeSwitch";
import { useAuth } from "../../context/AuthContext";
import AdminResumen from "./AdminResumen";
import AdminUsuarios from "./AdminUsuarios";
import AdminRestaurantes from "./AdminRestaurantes";
import AdminMapa from "./AdminMapa";
import AdminCategorias from "./AdminCategorias";
import AdminRoles from "./AdminRoles";
import { radius, spacing, themed, useColors } from "../../theme";

const TABS = [
    { id: "resumen", label: "Resumen", icono: "stats-chart" },
    { id: "usuarios", label: "Usuarios", icono: "people" },
    { id: "restaurantes", label: "Locales", icono: "storefront" },
    { id: "mapa", label: "Mapa", icono: "map" },
    { id: "categorias", label: "Categorías", icono: "pricetags" },
    { id: "roles", label: "Roles", icono: "shield-checkmark" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function saludo() {
    const h = new Date().getHours();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export default function AdminScreen() {
    const styles = useStyles();
    const colors = useColors();
    const navigation = useNavigation<any>();
    const { usuario } = useAuth();
    const [tab, setTab] = useState<Tab>("resumen");
    const aparece = useRef(new Animated.Value(0)).current;
    const [foto, setFoto] = useState<string | null>(null);

    // Trae la foto de perfil cada vez que vuelves de "Mi perfil".
    useFocusEffect(
        useCallback(() => {
            getPerfil().then((p) => setFoto(p.avatar)).catch(() => { });
        }, [])
    );

    useEffect(() => {
        aparece.setValue(0);
        Animated.timing(aparece, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    }, [tab]);

    const nombre = usuario?.username ?? "admin";

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.hero}>
                <View style={styles.burbuja1} />
                <View style={styles.burbuja2} />

                <View style={styles.heroFila}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.heroSaludo}>{saludo()},</Text>
                        <Text style={styles.heroNombre} numberOfLines={1}>{nombre}</Text>
                        <View style={styles.insignia}>
                            <Ionicons name="shield-checkmark" size={12} color="#fff" />
                            <Text style={styles.insigniaTxt}>Administrador</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => navigation.navigate("EditarPerfil")} style={styles.avatarBtn} hitSlop={8}>
                        <Avatar uri={foto} nombre={nombre} size={56} />
                        <View style={styles.lapiz}>
                            <Ionicons name="pencil" size={11} color={colors.primary} />
                        </View>
                    </Pressable>
                </View>

                <View style={styles.accionesFila}>
                    <Pressable style={styles.accion} onPress={() => navigation.navigate("EditarPerfil")}>
                        <Ionicons name="person-outline" size={16} color="#fff" />
                        <Text style={styles.accionTxt}>Mi perfil</Text>
                    </Pressable>
                    <Pressable style={styles.accion} onPress={() => navigation.navigate("Configuracion")}>
                        <Ionicons name="settings-outline" size={16} color="#fff" />
                        <Text style={styles.accionTxt}>Configuración</Text>
                    </Pressable>
                    <View style={{ flex: 1 }} />
                    <ThemeSwitch />
                </View>
            </View>

            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {TABS.map((t) => {
                        const activa = tab === t.id;
                        return (
                            <Pressable key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, activa && styles.tabActiva]}>
                                <Ionicons name={(activa ? t.icono : `${t.icono}-outline`) as any} size={16} color={activa ? "#fff" : colors.textMuted} />
                                <Text style={[styles.tabTxt, activa && { color: "#fff" }]}>{t.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <Animated.View
                style={{
                    flex: 1,
                    opacity: aparece,
                    transform: [{ translateY: aparece.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                }}
            >
                {tab === "resumen" && <AdminResumen />}
                {tab === "usuarios" && <AdminUsuarios />}
                {tab === "restaurantes" && <AdminRestaurantes />}
                {tab === "mapa" && <AdminMapa />}
                {tab === "categorias" && <AdminCategorias />}
                {tab === "roles" && <AdminRoles />}
            </Animated.View>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    hero: {
        backgroundColor: colors.primary, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: 28,
        padding: spacing.lg, gap: spacing.lg, overflow: "hidden",
    },
    burbuja1: { position: "absolute", width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.12)", top: -60, right: -40 },
    burbuja2: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.09)", bottom: -40, left: 70 },
    heroFila: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    heroSaludo: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
    heroNombre: { color: "#fff", fontSize: 26, fontWeight: "800" },
    insignia: {
        flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 6,
        backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    },
    insigniaTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
    avatarBtn: { borderRadius: 30, borderWidth: 2, borderColor: "rgba(255,255,255,0.8)" },
    lapiz: {
        position: "absolute", right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11,
        backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    },
    accionesFila: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    accion: {
        flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
    },
    accionTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
    tabs: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    tab: {
        flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface,
        borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.border,
    },
    tabActiva: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabTxt: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
}));
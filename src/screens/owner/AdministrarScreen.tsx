import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, themed, useColors } from "../../theme";

// Dirección de "Mi espacio" (la app independiente de administración).
// Se configura en .env: EXPO_PUBLIC_ESPACIO_URL=https://...
const ESPACIO_URL = process.env.EXPO_PUBLIC_ESPACIO_URL ?? "";

const BENEFICIOS = [
    { icono: "cash-outline", titulo: "Ventas y gastos", texto: "Registra lo que entra y sale de tu local y ve tu balance del mes." },
    { icono: "flag-outline", titulo: "Metas del mes", texto: "Define tus metas y sigue qué tan cerca estás de cumplirlas." },
    { icono: "sparkles-outline", titulo: "Recomendaciones a tu medida", texto: "Consejos que se adaptan a tu tipo de negocio y a tus cifras." },
    { icono: "document-text-outline", titulo: "Informe en PDF", texto: "Descarga el resumen de cómo va tu negocio cada mes." },
];

export default function AdministrarScreen() {
    const styles = useStyles();
    const colors = useColors();

    const abrir = () => {
        if (ESPACIO_URL) Linking.openURL(ESPACIO_URL);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                <View style={styles.hero}>
                    <View style={styles.burbuja} />
                    <View style={styles.icono}>
                        <Ionicons name="analytics" size={30} color={colors.primary} />
                    </View>
                    <Text style={styles.heroTitulo}>Administra tu negocio</Text>
                    <Text style={styles.heroTexto}>
                        Tu espacio para llevar las ventas, las metas y las finanzas de tu restaurante en un solo lugar.
                    </Text>
                    <View style={styles.etiqueta}>
                        <Ionicons name="time-outline" size={13} color="#fff" />
                        <Text style={styles.etiquetaTxt}>Disponible con suscripción</Text>
                    </View>
                </View>

                <View style={{ gap: spacing.md }}>
                    {BENEFICIOS.map((b) => (
                        <View key={b.titulo} style={styles.beneficio}>
                            <View style={styles.beneficioIcono}>
                                <Ionicons name={b.icono as any} size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.beneficioTitulo}>{b.titulo}</Text>
                                <Text style={styles.beneficioTexto}>{b.texto}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Pressable style={[styles.boton, !ESPACIO_URL && { opacity: 0.55 }]} onPress={abrir} disabled={!ESPACIO_URL}>
                    <Ionicons name="open-outline" size={18} color="#fff" />
                    <Text style={styles.botonTxt}>{ESPACIO_URL ? "Abrir mi espacio" : "Muy pronto"}</Text>
                </Pressable>
                {!ESPACIO_URL && (
                    <Text style={styles.nota}>Estamos terminando este módulo. Aquí podrás suscribirte y abrir tu espacio.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { backgroundColor: colors.primary, borderRadius: 28, padding: spacing.xl, gap: spacing.sm, overflow: "hidden" },
    burbuja: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.13)", top: -60, right: -50 },
    icono: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
    heroTitulo: { color: "#fff", fontSize: 26, fontWeight: "800" },
    heroTexto: { color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 20 },
    etiqueta: {
        flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: spacing.sm,
        backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
    },
    etiquetaTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
    beneficio: { flexDirection: "row", gap: spacing.md, alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    beneficioIcono: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    beneficioTitulo: { fontSize: 15, fontWeight: "800", color: colors.text },
    beneficioTexto: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    boton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15 },
    botonTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
    nota: { textAlign: "center", color: colors.textMuted, fontSize: 12 },
}));
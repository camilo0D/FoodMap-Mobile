import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getProductosNegocio, ProductoNegocio, ResumenInventario } from "../../services/negocio";
import { precioCOP } from "../../utils/format";
import { radius, spacing, themed, useColors } from "../../theme";

const PROXIMAMENTE = [
    { icono: "cash-outline", titulo: "Ventas y caja", texto: "Registra lo que vendes y cierra tu caja." },
    { icono: "people-outline", titulo: "Clientes", texto: "Tus clientes frecuentes y sus compras." },
    { icono: "wallet-outline", titulo: "Gastos", texto: "Controla lo que sale de tu negocio." },
    { icono: "document-text-outline", titulo: "Reportes en PDF", texto: "El resumen de cada mes, listo para descargar." },
] as const;

export default function AdministrarScreen() {
    const styles = useStyles();
    const colors = useColors();
    const navigation = useNavigation<any>();
    const [resumen, setResumen] = useState<ResumenInventario | null>(null);
    const [alertas, setAlertas] = useState<ProductoNegocio[]>([]);

    useFocusEffect(
        useCallback(() => {
            getProductosNegocio()
                .then((d) => { setResumen(d.resumen); setAlertas(d.productos.filter((p) => p.agotado || p.bajo).slice(0, 4)); })
                .catch(() => { });
        }, [])
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                <View style={styles.hero}>
                    <View style={styles.burbuja} />
                    <Text style={styles.heroTitulo}>Administra tu negocio</Text>
                    <Text style={styles.heroTexto}>Tus datos, tus productos y tus existencias en un solo lugar.</Text>
                    {resumen && resumen.con_control > 0 && (
                        <View style={styles.heroValor}>
                            <Text style={styles.heroValorLbl}>Valor del inventario</Text>
                            <Text style={styles.heroValorNum}>{precioCOP(resumen.valor_inventario)}</Text>
                        </View>
                    )}
                </View>

                {alertas.length > 0 && (
                    <View style={styles.alertas}>
                        <View style={styles.alertasCab}>
                            <Ionicons name="warning" size={16} color="#C77700" />
                            <Text style={styles.alertasTitulo}>Necesitan atención</Text>
                        </View>
                        {alertas.map((p) => (
                            <Pressable key={p.id} style={styles.alerta} onPress={() => navigation.navigate("ProductoInventario", { producto: p })}>
                                <Text style={styles.alertaNombre} numberOfLines={1}>{p.nombre}</Text>
                                <Text style={[styles.alertaEstado, { color: p.agotado ? "#B3261E" : "#C77700" }]}>
                                    {p.agotado ? "Agotado" : `Quedan ${Number(p.cantidad)} ${p.unidad}`}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                <Text style={styles.seccion}>Tu negocio</Text>
                <Pressable style={styles.modulo} onPress={() => navigation.navigate("Negocio")}>
                    <View style={styles.moduloIcono}><Ionicons name="business-outline" size={22} color={colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.moduloTitulo}>Datos del negocio</Text>
                        <Text style={styles.moduloTexto}>Razón social, NIT, contacto y mensaje de tus reportes.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable style={styles.modulo} onPress={() => navigation.navigate("Inventario")}>
                    <View style={styles.moduloIcono}><Ionicons name="cube-outline" size={22} color={colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.moduloTitulo}>Productos e inventario</Text>
                        <Text style={styles.moduloTexto}>
                            {resumen ? `${resumen.total} productos · ${resumen.agotados} agotados · ${resumen.bajos} por agotarse` : "Existencias, entradas y salidas."}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>

                <Text style={styles.seccion}>Próximamente</Text>
                {PROXIMAMENTE.map((m) => (
                    <View key={m.titulo} style={[styles.modulo, { opacity: 0.6 }]}>
                        <View style={styles.moduloIcono}><Ionicons name={m.icono as any} size={22} color={colors.textMuted} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.moduloTitulo}>{m.titulo}</Text>
                            <Text style={styles.moduloTexto}>{m.texto}</Text>
                        </View>
                        <View style={styles.pronto}><Text style={styles.prontoTxt}>Pronto</Text></View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    hero: { backgroundColor: colors.primary, borderRadius: 28, padding: spacing.xl, gap: spacing.sm, overflow: "hidden" },
    burbuja: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.13)", top: -60, right: -50 },
    heroTitulo: { color: "#fff", fontSize: 26, fontWeight: "800" },
    heroTexto: { color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 20 },
    heroValor: { marginTop: spacing.sm, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: radius.md, padding: spacing.md },
    heroValorLbl: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },
    heroValorNum: { color: "#fff", fontSize: 22, fontWeight: "800" },
    alertas: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: "#C77700" },
    alertasCab: { flexDirection: "row", alignItems: "center", gap: 6 },
    alertasTitulo: { fontSize: 14, fontWeight: "800", color: colors.text },
    alerta: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md, paddingVertical: 4 },
    alertaNombre: { flex: 1, color: colors.text, fontSize: 14 },
    alertaEstado: { fontSize: 13, fontWeight: "800" },
    seccion: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
    modulo: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    moduloIcono: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    moduloTitulo: { fontSize: 15, fontWeight: "800", color: colors.text },
    moduloTexto: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    pronto: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
    prontoTxt: { fontSize: 11, fontWeight: "800", color: colors.primary },
}));
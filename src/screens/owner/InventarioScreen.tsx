import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import PantallaHeader from "../../components/PantallaHeader";
import { getProductosNegocio, mensajeError, ProductoNegocio, ResumenInventario } from "../../services/negocio";
import { precioCOP } from "../../utils/format";
import { radius, spacing, themed, useColors } from "../../theme";

type Filtro = "todos" | "alertas" | "control";

const num = (v: string) => String(Number(v)); // 12.00 -> "12"

export default function InventarioScreen() {
    const styles = useStyles();
    const colors = useColors();
    const navigation = useNavigation<any>();
    const [productos, setProductos] = useState<ProductoNegocio[]>([]);
    const [resumen, setResumen] = useState<ResumenInventario | null>(null);
    const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState<Filtro>("todos");

    const cargar = useCallback(() => {
        getProductosNegocio()
            .then((d) => { setProductos(d.productos); setResumen(d.resumen); setEstado("ok"); })
            .catch((e) => { setError(mensajeError(e)); setEstado("error"); });
    }, []);

    useFocusEffect(cargar);

    const lista = productos.filter((p) =>
        filtro === "alertas" ? p.agotado || p.bajo : filtro === "control" ? p.controla_stock : true
    );

    const cabecera = (
        <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
            <PantallaHeader titulo="Productos e inventario" subtitulo="Controla tus existencias" />
            {resumen && (
                <View style={styles.kpis}>
                    <View style={styles.kpi}><Text style={styles.kpiNum}>{resumen.total}</Text><Text style={styles.kpiTxt}>Productos</Text></View>
                    <View style={styles.kpi}><Text style={[styles.kpiNum, resumen.agotados > 0 && { color: "#B3261E" }]}>{resumen.agotados}</Text><Text style={styles.kpiTxt}>Agotados</Text></View>
                    <View style={styles.kpi}><Text style={[styles.kpiNum, resumen.bajos > 0 && { color: "#C77700" }]}>{resumen.bajos}</Text><Text style={styles.kpiTxt}>Por agotarse</Text></View>
                </View>
            )}
            {resumen && resumen.con_control > 0 && (
                <Text style={styles.valor}>Valor del inventario: <Text style={{ fontWeight: "800", color: colors.text }}>{precioCOP(resumen.valor_inventario)}</Text></Text>
            )}
            <View style={styles.chips}>
                {([["todos", "Todos"], ["alertas", "Alertas"], ["control", "Con control"]] as [Filtro, string][]).map(([id, label]) => (
                    <Pressable key={id} onPress={() => setFiltro(id)} style={[styles.chip, filtro === id && styles.chipActivo]}>
                        <Text style={[styles.chipTxt, filtro === id && { color: "#fff" }]}>{label}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <FlatList
                data={estado === "ok" ? lista : []}
                keyExtractor={(p) => p.id}
                ListHeaderComponent={cabecera}
                contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
                ListEmptyComponent={
                    <View style={styles.vacio}>
                        {estado === "cargando" && <ActivityIndicator />}
                        {estado === "error" && <Text style={styles.vacioTxt}>{error}</Text>}
                        {estado === "ok" && (
                            <Text style={styles.vacioTxt}>
                                {productos.length === 0 ? "Aún no tienes productos. Agrégalos desde la pestaña Menú." : "No hay productos en este filtro."}
                            </Text>
                        )}
                    </View>
                }
                renderItem={({ item: p }) => (
                    <Pressable style={styles.fila} onPress={() => navigation.navigate("ProductoInventario", { producto: p })}>
                        {p.imagen ? (
                            <Image source={{ uri: p.imagen }} style={styles.foto} />
                        ) : (
                            <View style={[styles.foto, styles.sinFoto]}><Ionicons name="fast-food-outline" size={20} color={colors.primary} /></View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.nombre} numberOfLines={1}>{p.nombre}</Text>
                            <Text style={styles.sub}>{precioCOP(p.precio)}</Text>
                        </View>
                        {p.controla_stock ? (
                            <View style={[styles.stock, p.agotado && styles.stockRojo, p.bajo && styles.stockAmbar]}>
                                <Text style={[styles.stockNum, (p.agotado || p.bajo) && { color: "#fff" }]}>{num(p.cantidad)}</Text>
                                <Text style={[styles.stockUni, (p.agotado || p.bajo) && { color: "#fff" }]}>{p.agotado ? "Agotado" : p.unidad}</Text>
                            </View>
                        ) : (
                            <Text style={styles.sinControl}>Sin control</Text>
                        )}
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                )}
            />
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    kpis: { flexDirection: "row", gap: spacing.md },
    kpi: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    kpiNum: { fontSize: 24, fontWeight: "800", color: colors.text },
    kpiTxt: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    valor: { fontSize: 13, color: colors.textMuted },
    chips: { flexDirection: "row", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
    chipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipTxt: { color: colors.text, fontSize: 13, fontWeight: "600" },
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    foto: { width: 48, height: 48, borderRadius: radius.md },
    sinFoto: { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    stock: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4, minWidth: 58 },
    stockRojo: { backgroundColor: "#B3261E" },
    stockAmbar: { backgroundColor: "#C77700" },
    stockNum: { fontSize: 16, fontWeight: "800", color: colors.text },
    stockUni: { fontSize: 10, fontWeight: "600", color: colors.textMuted },
    sinControl: { fontSize: 11, color: colors.textMuted },
    vacio: { alignItems: "center", padding: spacing.xl },
    vacioTxt: { color: colors.textMuted, textAlign: "center" },
}));
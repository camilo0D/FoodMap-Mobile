import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import PantallaHeader from "../../components/PantallaHeader";
import TextField from "../../components/TextField";
import {
    configurarInventario, getMovimientos, mensajeError, Movimiento, ProductoNegocio, registrarMovimiento,
} from "../../services/negocio";
import { fechaCorta, precioCOP } from "../../utils/format";
import { radius, spacing, themed, useColors } from "../../theme";

const TIPOS: { id: Movimiento["tipo"]; label: string; icono: keyof typeof Ionicons.glyphMap }[] = [
    { id: "entrada", label: "Entrada", icono: "add-circle-outline" },
    { id: "salida", label: "Salida", icono: "remove-circle-outline" },
    { id: "ajuste", label: "Ajuste", icono: "create-outline" },
];

const num = (v: string) => String(Number(v));
const limpiar = (v: string) => v.replace(",", ".").trim();

export default function ProductoInventarioScreen() {
    const styles = useStyles();
    const colors = useColors();
    const route = useRoute<any>();
    const [p, setP] = useState<ProductoNegocio>(route.params.producto);
    const [minimo, setMinimo] = useState(num(p.stock_minimo));
    const [costo, setCosto] = useState(num(p.costo));
    const [unidad, setUnidad] = useState(p.unidad);
    const [tipo, setTipo] = useState<Movimiento["tipo"]>("entrada");
    const [cantidad, setCantidad] = useState("");
    const [nota, setNota] = useState("");
    const [movs, setMovs] = useState<Movimiento[]>([]);
    const [ocupado, setOcupado] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

    const cargarMovs = useCallback(() => {
        getMovimientos(p.id).then(setMovs).catch(() => { });
    }, [p.id]);

    useEffect(cargarMovs, [cargarMovs]);

    const aviso = (ok: boolean, texto: string) => setMsg({ ok, texto });

    const alternarControl = async (valor: boolean) => {
        setOcupado(true);
        setMsg(null);
        try {
            setP(await configurarInventario(p.id, { controla_stock: valor }));
        } catch (e) {
            aviso(false, mensajeError(e));
        } finally {
            setOcupado(false);
        }
    };

    const guardarConfig = async () => {
        setOcupado(true);
        setMsg(null);
        try {
            setP(await configurarInventario(p.id, { stock_minimo: limpiar(minimo) || "0", costo: limpiar(costo) || "0", unidad: unidad.trim() || "und" }));
            aviso(true, "Configuración guardada.");
        } catch (e) {
            aviso(false, mensajeError(e));
        } finally {
            setOcupado(false);
        }
    };

    const registrar = async () => {
        const c = limpiar(cantidad);
        if (!c || Number.isNaN(Number(c))) return aviso(false, "Escribe una cantidad válida.");
        setOcupado(true);
        setMsg(null);
        try {
            setP(await registrarMovimiento(p.id, { tipo, cantidad: c, nota: nota.trim() }));
            setCantidad("");
            setNota("");
            aviso(true, "Movimiento registrado.");
            cargarMovs();
        } catch (e) {
            aviso(false, mensajeError(e));
        } finally {
            setOcupado(false);
        }
    };

    const estadoTxt = !p.controla_stock ? null : p.agotado ? "Agotado" : p.bajo ? "Por agotarse" : "En stock";
    const estadoColor = p.agotado ? "#B3261E" : p.bajo ? "#C77700" : "#1F7A44";

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
                <PantallaHeader titulo={p.nombre} subtitulo={`Precio de venta ${precioCOP(p.precio)}`} />

                <View style={styles.tarjeta}>
                    <View style={styles.filaSwitch}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.titulo}>Controlar existencias</Text>
                            <Text style={styles.sub}>Lleva la cuenta de cuántas unidades tienes.</Text>
                        </View>
                        <Switch value={p.controla_stock} onValueChange={alternarControl} disabled={ocupado} trackColor={{ true: colors.primary }} />
                    </View>
                    {p.controla_stock && (
                        <View style={styles.existencias}>
                            <Text style={styles.cantidadGrande}>{num(p.cantidad)} <Text style={styles.unidad}>{p.unidad}</Text></Text>
                            {!!estadoTxt && <Text style={[styles.estado, { color: estadoColor }]}>{estadoTxt}</Text>}
                        </View>
                    )}
                </View>

                {p.controla_stock && (
                    <>
                        <View style={styles.tarjeta}>
                            <Text style={styles.titulo}>Registrar movimiento</Text>
                            <View style={styles.tipos}>
                                {TIPOS.map((t) => (
                                    <Pressable key={t.id} onPress={() => setTipo(t.id)} style={[styles.tipo, tipo === t.id && styles.tipoActivo]}>
                                        <Ionicons name={t.icono} size={16} color={tipo === t.id ? "#fff" : colors.textMuted} />
                                        <Text style={[styles.tipoTxt, tipo === t.id && { color: "#fff" }]}>{t.label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Text style={styles.sub}>
                                {tipo === "entrada" ? "Suma unidades (compras o producción)."
                                    : tipo === "salida" ? "Resta unidades (ventas, mermas o daños)."
                                        : "Define la cantidad real que tienes ahora."}
                            </Text>
                            <TextField label={tipo === "ajuste" ? "Cantidad total" : "Cantidad"} icono="calculator-outline" value={cantidad} onChangeText={setCantidad} keyboardType="decimal-pad" />
                            <TextField label="Nota (opcional)" icono="create-outline" value={nota} onChangeText={setNota} autoCapitalize="sentences" />
                            <Pressable style={[styles.boton, ocupado && { opacity: 0.6 }]} onPress={registrar} disabled={ocupado}>
                                {ocupado ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Registrar</Text>}
                            </Pressable>
                        </View>

                        <View style={styles.tarjeta}>
                            <Text style={styles.titulo}>Alertas y costo</Text>
                            <TextField label="Avisarme cuando queden" icono="alert-circle-outline" value={minimo} onChangeText={setMinimo} keyboardType="decimal-pad" />
                            <TextField label="Costo por unidad" icono="pricetag-outline" value={costo} onChangeText={setCosto} keyboardType="decimal-pad" />
                            <TextField label="Unidad (und, kg, porción…)" icono="cube-outline" value={unidad} onChangeText={setUnidad} />
                            <Pressable style={[styles.botonSec, ocupado && { opacity: 0.6 }]} onPress={guardarConfig} disabled={ocupado}>
                                <Text style={styles.botonSecTxt}>Guardar configuración</Text>
                            </Pressable>
                        </View>
                    </>
                )}

                {!!msg && <Text style={[styles.msg, { color: msg.ok ? "#1F7A44" : "#B3261E" }]}>{msg.texto}</Text>}

                {p.controla_stock && movs.length > 0 && (
                    <View style={styles.tarjeta}>
                        <Text style={styles.titulo}>Últimos movimientos</Text>
                        {movs.slice(0, 15).map((m) => (
                            <View key={m.id} style={styles.mov}>
                                <Ionicons
                                    name={m.tipo === "entrada" ? "arrow-down-circle" : m.tipo === "salida" ? "arrow-up-circle" : "swap-horizontal"}
                                    size={20}
                                    color={m.tipo === "entrada" ? "#1F7A44" : m.tipo === "salida" ? "#B3261E" : colors.primary}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.movTxt}>
                                        {m.tipo === "entrada" ? "+" : m.tipo === "salida" ? "−" : "="}{num(m.cantidad)} · saldo {num(m.saldo)}
                                    </Text>
                                    {!!m.nota && <Text style={styles.sub} numberOfLines={1}>{m.nota}</Text>}
                                </View>
                                <Text style={styles.sub}>{fechaCorta(m.created_at)}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    tarjeta: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
    titulo: { fontSize: 16, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    filaSwitch: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    existencias: { alignItems: "center", paddingTop: spacing.sm },
    cantidadGrande: { fontSize: 38, fontWeight: "800", color: colors.text },
    unidad: { fontSize: 15, fontWeight: "600", color: colors.textMuted },
    estado: { fontSize: 13, fontWeight: "800" },
    tipos: { flexDirection: "row", gap: spacing.sm },
    tipo: { flex: 1, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, borderRadius: radius.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
    tipoActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
    tipoTxt: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
    botonTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
    botonSec: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
    botonSecTxt: { color: colors.primary, fontWeight: "800" },
    msg: { fontSize: 13, fontWeight: "600", textAlign: "center" },
    mov: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    movTxt: { fontSize: 14, fontWeight: "700", color: colors.text },
}));
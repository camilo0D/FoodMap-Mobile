import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Logo from "../components/Logo";
import ThemeSwitch from "../components/ThemeSwitch";
import { getRestaurantes } from "../services/restaurant";
import { radius, spacing, themed, useColors } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { Restaurante } from "../types";

const PASOS = [
    { icono: "map-outline", titulo: "Explora el mapa", texto: "Mira los restaurantes de tu barrio sobre el mapa, con su distancia y calificación." },
    { icono: "restaurant-outline", titulo: "Elige tu próxima mesa", texto: "Consulta el menú, el horario y las fotos antes de salir de casa." },
    { icono: "star-outline", titulo: "Cuéntanos cómo te fue", texto: "Deja tu reseña y ayuda a otros a decidir. Guarda tus favoritos." },
] as const;

function saludo() {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
}

function Contador({ valor }: { valor: number }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        let raf = 0;
        const ini = Date.now();
        const paso = () => {
            const t = Math.min(1, (Date.now() - ini) / 900);
            setN(Math.round(valor * (1 - Math.pow(1 - t, 3))));
            if (t < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
        return () => cancelAnimationFrame(raf);
    }, [valor]);
    return <Text>{n}</Text>;
}

function Pulso() {
    const styles = useStyles();
    const colors = useColors();
    const a = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(a, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== "web" })
        );
        anim.start();
        return () => anim.stop();
    }, [a]);
    const escala = a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });
    const opacidad = a.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
    return (
        <View style={styles.pulsoCaja}>
            <Animated.View style={[styles.anillo, { transform: [{ scale: escala }], opacity: opacidad }]} />
            <View style={styles.pin}>
                <Ionicons name="restaurant" size={22} color={colors.primary} />
            </View>
        </View>
    );
}

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Inicio">) {
    const styles = useStyles();
    const colors = useColors();
    const [lista, setLista] = useState<Restaurante[]>([]);
    const [cat, setCat] = useState<string | null>(null);
    const [abierto, setAbierto] = useState<number | null>(0);
    const [q, setQ] = useState("");

    useEffect(() => {
        getRestaurantes().then(setLista).catch(() => { });
    }, []);

    const categorias = useMemo(() => {
        const m: Record<string, { nombre: string; icono: string }> = {};
        lista.forEach((r) => { if (r.categoria) m[r.categoria.id] = { nombre: r.categoria.nombre, icono: r.categoria.icono }; });
        return Object.entries(m).map(([id, c]) => ({ id, ...c }));
    }, [lista]);

    const destacados = useMemo(
        () =>
            [...lista]
                .filter((r) => !cat || r.categoria?.id === cat)
                .sort((a, b) => Number(b.calificacion_promedio) - Number(a.calificacion_promedio))
                .slice(0, 8),
        [lista, cat]
    );

    const totalResenas = lista.reduce((s, r) => s + (Number((r as any).total_resenas) || 0), 0);
    const irALogin = () => navigation.navigate("Login");
    const buscar = () => navigation.navigate("ExplorarInvitado", { busqueda: q.trim() || undefined });

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.marca}>
                    <Logo size={34} />
                    <Text style={styles.marcaTxt}>FoodMap</Text>
                </View>
                <ThemeSwitch />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={{ flex: 1, gap: spacing.sm }}>
                        <Text style={styles.heroSaludo}>{saludo()} 👋</Text>
                        <Text style={styles.heroTitulo}>¿Qué se te antoja hoy?</Text>
                        <View style={styles.buscador}>
                            <Ionicons name="search" size={18} color={colors.textMuted} />
                            <TextInput
                                style={styles.buscadorInput}
                                value={q}
                                onChangeText={setQ}
                                placeholder="Buscar restaurantes cerca de ti"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="search"
                                onSubmitEditing={buscar}
                            />
                            {!!q && (
                                <Pressable onPress={buscar} hitSlop={8}>
                                    <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
                                </Pressable>
                            )}
                        </View>
                    </View>
                    <Pulso />
                </View>

                <View style={styles.acciones}>
                    <Pressable style={styles.btnPrimario} onPress={irALogin}>
                        <Text style={styles.btnPrimarioTxt}>Iniciar sesión</Text>
                    </Pressable>
                    <Pressable style={styles.btnSecundario} onPress={() => navigation.navigate("Registro")}>
                        <Text style={styles.btnSecundarioTxt}>Crear cuenta</Text>
                    </Pressable>
                </View>

                <View style={styles.acciones}>
                    <Pressable style={styles.atajo} onPress={() => navigation.navigate("ExplorarInvitado")}>
                        <Ionicons name="compass-outline" size={18} color={colors.primary} />
                        <Text style={styles.atajoTxt}>Explorar</Text>
                    </Pressable>
                    <Pressable style={styles.atajo} onPress={() => navigation.navigate("MapaInvitado")}>
                        <Ionicons name="map-outline" size={18} color={colors.primary} />
                        <Text style={styles.atajoTxt}>Ver mapa</Text>
                    </Pressable>
                </View>

                <View style={styles.stats}>
                    {[["restaurant", "Restaurantes", lista.length], ["grid", "Categorías", categorias.length], ["chatbubbles", "Reseñas", totalResenas]].map(([ic, t, v]) => (
                        <View key={String(t)} style={styles.stat}>
                            <Ionicons name={ic as any} size={18} color={colors.primary} />
                            <Text style={styles.statNum}><Contador valor={Number(v)} /></Text>
                            <Text style={styles.statTxt}>{t}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.seccion}>Antojos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    <Pressable onPress={() => setCat(null)} style={[styles.chip, !cat && styles.chipActivo]}>
                        <Text style={[styles.chipTxt, !cat && styles.chipTxtActivo]}>✨ Todos</Text>
                    </Pressable>
                    {categorias.map((c) => {
                        const activo = c.id === cat;
                        return (
                            <Pressable key={c.id} onPress={() => setCat(activo ? null : c.id)} style={[styles.chip, activo && styles.chipActivo]}>
                                <Text style={[styles.chipTxt, activo && styles.chipTxtActivo]}>{c.icono} {c.nombre}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <FlatList
                    horizontal
                    data={destacados}
                    keyExtractor={(r) => r.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingVertical: spacing.md }}
                    snapToInterval={236}
                    decelerationRate="fast"
                    ListEmptyComponent={<Text style={styles.vacio}>Aún no hay restaurantes en esta categoría.</Text>}
                    renderItem={({ item: r }) => (
                        <Pressable
                            onPress={() => navigation.navigate("Detalle", { restaurante: r })}
                            style={({ pressed }) => [styles.tarjeta, pressed && { transform: [{ scale: 0.97 }] }]}
                        >
                            {r.imagen ? (
                                <Image source={{ uri: r.imagen }} style={styles.foto} />
                            ) : (
                                <View style={[styles.foto, { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }]}>
                                    <Ionicons name="restaurant" size={34} color={colors.primary} />
                                </View>
                            )}
                            <View style={styles.nota}>
                                <Ionicons name="star" size={12} color={colors.star} />
                                <Text style={styles.notaTxt}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                            </View>
                            <View style={{ padding: spacing.md, gap: 2 }}>
                                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                                <Text style={styles.detalle} numberOfLines={1}>{r.categoria?.icono} {r.categoria?.nombre}</Text>
                            </View>
                        </Pressable>
                    )}
                />

                <Text style={styles.seccion}>Así funciona</Text>
                <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
                    {PASOS.map((p, i) => {
                        const activo = abierto === i;
                        return (
                            <Pressable key={p.titulo} onPress={() => setAbierto(activo ? null : i)} style={[styles.paso, activo && styles.pasoActivo]}>
                                <View style={styles.pasoCabecera}>
                                    <View style={[styles.pasoIcono, activo && { backgroundColor: colors.primary }]}>
                                        <Ionicons name={p.icono} size={18} color={activo ? "#fff" : colors.primary} />
                                    </View>
                                    <Text style={styles.pasoTitulo}>{i + 1}. {p.titulo}</Text>
                                    <Ionicons name={activo ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                                </View>
                                {activo && <Text style={styles.pasoTexto}>{p.texto}</Text>}
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.negocio}>
                    <Text style={styles.negocioPre}>¿Tienes un restaurante?</Text>
                    <Text style={styles.negocioTitulo}>Tu negocio, visible y en tus manos</Text>
                    <Text style={styles.negocioTexto}>Comparte tu carta, actualiza tus horarios y deja que tu barrio te encuentre.</Text>
                    <Pressable style={styles.negocioBtn} onPress={() => navigation.navigate("Registro", { tipo: "restaurante" })}>
                        <Text style={styles.negocioBtnTxt}>Registrar mi restaurante</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    marca: { flexDirection: "row", alignItems: "center", gap: 8 },
    marcaTxt: { fontSize: 18, fontWeight: "800", color: colors.text },
    hero: {
        flexDirection: "row", alignItems: "center", gap: spacing.md, marginHorizontal: spacing.lg,
        backgroundColor: colors.primary, borderRadius: 28, padding: spacing.xl,
    },
    heroSaludo: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },
    heroTitulo: { color: "#fff", fontSize: 26, fontWeight: "800", lineHeight: 31 },
    buscador: {
        flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface,
        borderRadius: radius.pill, paddingHorizontal: spacing.md, height: 42, marginTop: spacing.sm,
    },
    buscadorInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 0 },
    atajo: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
    atajoTxt: { color: colors.text, fontWeight: "700" },
    pulsoCaja: { width: 84, height: 84, alignItems: "center", justifyContent: "center" },
    anillo: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: "#fff" },
    pin: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4 },
    acciones: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
    btnPrimario: { flex: 1, backgroundColor: colors.text, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
    btnPrimarioTxt: { color: colors.background, fontWeight: "700" },
    btnSecundario: { flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" },
    btnSecundarioTxt: { color: colors.primary, fontWeight: "700" },
    stats: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: "center", gap: 2, borderWidth: 1, borderColor: colors.border },
    statNum: { fontSize: 22, fontWeight: "800", color: colors.text },
    statTxt: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    seccion: { fontSize: 20, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },
    chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.border },
    chipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipTxt: { color: colors.text, fontSize: 13, fontWeight: "600" },
    chipTxtActivo: { color: "#fff" },
    vacio: { color: colors.textMuted, paddingVertical: spacing.lg },
    tarjeta: { width: 224, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
    foto: { width: "100%", height: 130 },
    nota: {
        position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 3,
        backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3,
    },
    notaTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    detalle: { fontSize: 12, color: colors.textMuted },
    paso: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    pasoActivo: { borderColor: colors.primary },
    pasoCabecera: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    pasoIcono: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    pasoTitulo: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text },
    pasoTexto: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: spacing.sm, marginLeft: 46 },
    negocio: { backgroundColor: colors.surface, margin: spacing.lg, marginTop: spacing.xl, borderRadius: radius.lg, padding: spacing.xl, gap: 6, borderWidth: 1, borderColor: colors.border },
    negocioPre: { fontSize: 12, fontWeight: "700", color: colors.primary },
    negocioTitulo: { fontSize: 20, fontWeight: "800", color: colors.text },
    negocioTexto: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
    negocioBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing.sm },
    negocioBtnTxt: { color: "#fff", fontWeight: "700" },
}));
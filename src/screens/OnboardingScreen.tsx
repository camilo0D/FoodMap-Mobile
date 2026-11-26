import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { prefs } from "../services/prefs";
import { radius, spacing, themed, useColors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const nativo = Platform.OS !== "web";
const AZUL = "#2F7CF6";

function usePop(retraso = 0) {
    const v = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.sequence([Animated.delay(retraso), Animated.spring(v, { toValue: 1, friction: 5, tension: 90, useNativeDriver: nativo })]).start();
    }, []);
    return v;
}

function rebote(v: Animated.Value) {
    Animated.sequence([
        Animated.timing(v, { toValue: 1.35, duration: 120, useNativeDriver: nativo }),
        Animated.spring(v, { toValue: 1, friction: 3, tension: 140, useNativeDriver: nativo }),
    ]).start();
}

// ─── 1. Mapa con pines que aparecen; toca uno para ver el restaurante ──────────
const PINES = [
    { x: "22%", y: "34%", nombre: "La Fonda Paisa · 4.1 ★", icono: "restaurant" },
    { x: "62%", y: "24%", nombre: "Sushi Mar · 4.6 ★", icono: "fish" },
    { x: "46%", y: "58%", nombre: "Pizza Napolitana · 4.5 ★", icono: "pizza" },
] as const;

function IlustracionMapa() {
    const styles = useStyles();
    const colors = useColors();
    const pops = [usePop(250), usePop(550), usePop(850)];
    const botes = useRef(PINES.map(() => new Animated.Value(1))).current;
    const [activo, setActivo] = useState(1);

    return (
        <View style={styles.lienzo}>
            <View style={[styles.calle, { top: 46, left: -10, right: -10, transform: [{ rotate: "-10deg" }] }]} />
            <View style={[styles.calle, { top: 112, left: -10, right: -10, transform: [{ rotate: "7deg" }] }]} />
            <View style={[styles.calleV, { left: "30%" }]} />
            <View style={[styles.calleV, { left: "70%" }]} />
            {PINES.map((p, i) => (
                <Animated.View key={p.nombre} style={{ position: "absolute", left: p.x as any, top: p.y as any, transform: [{ scale: Animated.multiply(pops[i], botes[i]) }] }}>
                    <Pressable onPress={() => { setActivo(i); rebote(botes[i]); }} hitSlop={8}>
                        <View style={[styles.pin, i === activo && { backgroundColor: colors.primary, borderColor: "#fff" }]}>
                            <Ionicons name={p.icono as any} size={20} color={i === activo ? "#fff" : colors.primary} />
                        </View>
                    </Pressable>
                </Animated.View>
            ))}
            <View style={styles.etiqueta}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={styles.etiquetaTxt}>{PINES[activo].nombre}</Text>
            </View>
            <Text style={styles.pista}>Toca un pin</Text>
        </View>
    );
}

// ─── 2. Radar de cercanía; toca un punto para ver la distancia ─────────────────
const PUNTOS = [
    { x: 28, y: -42, m: "350 m" },
    { x: -52, y: 18, m: "720 m" },
    { x: 38, y: 56, m: "1,1 km" },
] as const;

function Anillo({ retraso }: { retraso: number }) {
    const styles = useStyles();
    const a = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const l = Animated.loop(Animated.timing(a, { toValue: 1, duration: 2600, delay: retraso, easing: Easing.out(Easing.quad), useNativeDriver: nativo }));
        l.start();
        return () => l.stop();
    }, []);
    return (
        <Animated.View
            style={[styles.anillo, { opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }), transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }] }]}
        />
    );
}

function IlustracionRadar() {
    const styles = useStyles();
    const colors = useColors();
    const pops = [usePop(400), usePop(800), usePop(1200)];
    const botes = useRef(PUNTOS.map(() => new Animated.Value(1))).current;
    const [activo, setActivo] = useState<number | null>(null);

    return (
        <View style={[styles.lienzo, { alignItems: "center", justifyContent: "center" }]}>
            <Anillo retraso={0} />
            <Anillo retraso={870} />
            <Anillo retraso={1740} />
            <View style={styles.tu}>
                <View style={styles.tuNucleo} />
            </View>
            {PUNTOS.map((p, i) => (
                <Animated.View key={p.m} style={{ position: "absolute", transform: [{ translateX: p.x * 1.5 }, { translateY: p.y * 1.2 }, { scale: Animated.multiply(pops[i], botes[i]) }] }}>
                    <Pressable onPress={() => { setActivo(i); rebote(botes[i]); }} hitSlop={10}>
                        <View style={[styles.punto, activo === i && { backgroundColor: colors.primary }]}>
                            <Ionicons name="restaurant" size={14} color={activo === i ? "#fff" : colors.primary} />
                        </View>
                    </Pressable>
                </Animated.View>
            ))}
            <View style={styles.etiqueta}>
                <Ionicons name="navigate" size={13} color={colors.primary} />
                <Text style={styles.etiquetaTxt}>{activo === null ? "Toca un restaurante" : `A ${PUNTOS[activo].m} de ti`}</Text>
            </View>
        </View>
    );
}

// ─── 3. Calificación con estrellas que se llenan al tocarlas ───────────────────
const FRASES = ["Cuéntanos tu experiencia", "Podría mejorar", "Estuvo bien", "¡Muy buena!", "¡Me encantó!", "¡Una joya! 🏆"];

function IlustracionResenas() {
    const styles = useStyles();
    const colors = useColors();
    const entrada = usePop(300);
    const [nota, setNota] = useState(0);
    const botes = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;

    const calificar = (n: number) => {
        setNota(n);
        botes.slice(0, n).forEach((b, i) => setTimeout(() => rebote(b), i * 70));
    };

    return (
        <View style={[styles.lienzo, { alignItems: "center", justifyContent: "center", gap: spacing.md }]}>
            <Animated.View style={[styles.tarjetaResena, { transform: [{ scale: entrada }], opacity: entrada }]}>
                <Text style={styles.resenaNombre}>Uramba Cocina</Text>
                <View style={{ flexDirection: "row", gap: 6, marginVertical: 6 }}>
                    {botes.map((b, i) => (
                        <Pressable key={i} onPress={() => calificar(i + 1)} hitSlop={6}>
                            <Animated.View style={{ transform: [{ scale: b }] }}>
                                <Ionicons name={i < nota ? "star" : "star-outline"} size={34} color={colors.star} />
                            </Animated.View>
                        </Pressable>
                    ))}
                </View>
                <Text style={styles.resenaFrase}>{FRASES[nota]}</Text>
            </Animated.View>
            <View style={styles.etiqueta}>
                <Ionicons name="chatbubble-ellipses" size={13} color={colors.primary} />
                <Text style={styles.etiquetaTxt}>Tu opinión ayuda a otros</Text>
            </View>
        </View>
    );
}

const SLIDES = [
    { Ilustracion: IlustracionMapa, titulo: "Explora joyas gastronómicas seleccionadas para ti", texto: "Descubre mesas, sabores y lugares ocultos de tu ciudad sobre un mapa interactivo." },
    { Ilustracion: IlustracionRadar, titulo: "Encuentra restaurantes cerca de ti", texto: "Activa tu ubicación y mira qué hay a pocos pasos, con la distancia y la ruta para llegar." },
    { Ilustracion: IlustracionResenas, titulo: "Lee opiniones y deja la tuya", texto: "Consulta el menú, el horario y las reseñas antes de elegir tu próxima mesa." },
];

export default function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Onboarding">) {
    const styles = useStyles();
    const [ancho, setAncho] = useState(0);
    const [pagina, setPagina] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const lista = useRef<any>(null);
    const w = ancho || 1;
    const ultima = pagina === SLIDES.length - 1;

    const terminar = async () => {
        await prefs.set("onboardingVisto", "1");
        navigation.replace("Inicio");
    };

    const siguiente = () => {
        if (ultima) return terminar();
        lista.current?.scrollTo({ x: ancho * (pagina + 1), animated: true });
        setPagina(pagina + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable style={styles.omitir} onPress={terminar} hitSlop={10}>
                <Text style={styles.omitirTxt}>Omitir</Text>
            </Pressable>

            <View style={{ flex: 1 }} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
                <Animated.ScrollView
                    ref={lista}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    onMomentumScrollEnd={(e) => setPagina(Math.round(e.nativeEvent.contentOffset.x / w))}
                >
                    {SLIDES.map((s, i) => {
                        const rango = [(i - 1) * w, i * w, (i + 1) * w];
                        const desliza = scrollX.interpolate({ inputRange: rango, outputRange: [w * 0.4, 0, -w * 0.4], extrapolate: "clamp" });
                        const escala = scrollX.interpolate({ inputRange: rango, outputRange: [0.8, 1, 0.8], extrapolate: "clamp" });
                        const opacidad = scrollX.interpolate({ inputRange: rango, outputRange: [0, 1, 0], extrapolate: "clamp" });
                        return (
                            <View key={s.titulo} style={{ width: ancho, padding: spacing.xl, justifyContent: "center", gap: spacing.xl }}>
                                <Animated.View style={{ opacity: opacidad, transform: [{ translateX: desliza }, { scale: escala }] }}>
                                    <s.Ilustracion />
                                </Animated.View>
                                <Animated.View style={{ opacity: opacidad, transform: [{ translateX: Animated.multiply(desliza, 0.5) }], gap: spacing.md }}>
                                    <Text style={styles.titulo}>{s.titulo}</Text>
                                    <Text style={styles.texto}>{s.texto}</Text>
                                </Animated.View>
                            </View>
                        );
                    })}
                </Animated.ScrollView>
            </View>

            <View style={styles.puntos}>
                {SLIDES.map((_, i) => {
                    const rango = [(i - 1) * w, i * w, (i + 1) * w];
                    return (
                        <Animated.View
                            key={i}
                            style={[
                                styles.punto2,
                                {
                                    width: scrollX.interpolate({ inputRange: rango, outputRange: [7, 26, 7], extrapolate: "clamp" }),
                                    opacity: scrollX.interpolate({ inputRange: rango, outputRange: [0.4, 1, 0.4], extrapolate: "clamp" }),
                                },
                            ]}
                        />
                    );
                })}
            </View>

            <Pressable style={styles.boton} onPress={siguiente}>
                <Text style={styles.botonTxt}>{ultima ? "Comenzar experiencia" : "Siguiente"}</Text>
                <Ionicons name={ultima ? "rocket" : "arrow-forward"} size={18} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    omitir: { alignSelf: "flex-end", paddingHorizontal: spacing.xl, paddingTop: spacing.md },
    omitirTxt: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text, textAlign: "center" },
    texto: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 21 },
    puntos: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginVertical: spacing.lg },
    punto2: { height: 7, borderRadius: 4, backgroundColor: colors.primary },
    boton: {
        flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary,
        borderRadius: radius.md, paddingVertical: 15, marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    lienzo: { height: 250, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    calle: { position: "absolute", height: 16, backgroundColor: colors.background },
    calleV: { position: "absolute", top: 0, bottom: 0, width: 13, backgroundColor: colors.background },
    pin: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 5 },
    etiqueta: {
        position: "absolute", bottom: 38, alignSelf: "center", flexDirection: "row", gap: 6, alignItems: "center",
        backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border,
    },
    etiquetaTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
    pista: { position: "absolute", bottom: 12, alignSelf: "center", fontSize: 11, color: colors.textMuted },
    anillo: { position: "absolute", width: 300, height: 300, borderRadius: 150, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft },
    tu: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(47,124,246,0.25)", alignItems: "center", justifyContent: "center" },
    tuNucleo: { width: 16, height: 16, borderRadius: 8, backgroundColor: AZUL, borderWidth: 3, borderColor: "#fff" },
    punto: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 4 },
    tarjetaResena: { alignItems: "center", backgroundColor: colors.background, borderRadius: 24, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, gap: 2 },
    resenaNombre: { fontSize: 16, fontWeight: "800", color: colors.text },
    resenaFrase: { fontSize: 13, color: colors.textMuted, fontWeight: "600", minHeight: 18 },
}));
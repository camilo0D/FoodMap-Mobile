import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { themed, useColors } from "../theme";

const nativo = Platform.OS !== "web";
const LETRAS = "FoodMap".split("");
const COMIDA = [
    { e: "🍔", x: "10%", y: "16%", d: 2600 },
    { e: "🍕", x: "78%", y: "12%", d: 3000 },
    { e: "🌮", x: "7%", y: "68%", d: 2800 },
    { e: "🍣", x: "80%", y: "64%", d: 3200 },
    { e: "🍰", x: "44%", y: "86%", d: 2400 },
    { e: "🥤", x: "48%", y: "7%", d: 2900 },
];

function Flotante({ e, x, y, d }: { e: string; x: string; y: string; d: number }) {
    const styles = useStyles();
    const a = useRef(new Animated.Value(0)).current;
    const aparece = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(aparece, { toValue: 1, duration: 600, delay: 500, useNativeDriver: nativo }).start();
        const l = Animated.loop(
            Animated.sequence([
                Animated.timing(a, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: nativo }),
                Animated.timing(a, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: nativo }),
            ])
        );
        l.start();
        return () => l.stop();
    }, []);
    const ty = a.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
    const rot = a.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "10deg"] });
    return (
        <Animated.Text
            style={[styles.comida, { left: x as any, top: y as any, opacity: aparece, transform: [{ translateY: ty }, { rotate: rot }] }]}
        >
            {e}
        </Animated.Text>
    );
}

function Onda({ retraso }: { retraso: number }) {
    const styles = useStyles();
    const a = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const l = Animated.loop(
            Animated.timing(a, { toValue: 1, duration: 2200, delay: retraso, easing: Easing.out(Easing.quad), useNativeDriver: nativo })
        );
        l.start();
        return () => l.stop();
    }, []);
    const escala = a.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
    const opacidad = a.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
    return <Animated.View style={[styles.onda, { opacity: opacidad, transform: [{ scale: escala }] }]} />;
}

export default function SplashScreen() {
    const styles = useStyles();
    const colors = useColors();
    const logo = useRef(new Animated.Value(0)).current;
    const caida = useRef(new Animated.Value(-70)).current;
    const letras = useRef(LETRAS.map(() => new Animated.Value(0))).current;
    const lema = useRef(new Animated.Value(0)).current;
    const progreso = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(logo, { toValue: 1, friction: 4, tension: 70, useNativeDriver: nativo }).start();
        Animated.timing(caida, { toValue: 0, duration: 900, delay: 350, easing: Easing.bounce, useNativeDriver: nativo }).start();
        Animated.sequence([
            Animated.delay(800),
            Animated.stagger(
                70,
                letras.map((v) => Animated.spring(v, { toValue: 1, friction: 6, tension: 120, useNativeDriver: nativo }))
            ),
        ]).start();
        Animated.timing(lema, { toValue: 1, duration: 700, delay: 1700, useNativeDriver: nativo }).start();
        Animated.timing(progreso, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start();
    }, []);

    const ancho = progreso.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

    return (
        <View style={styles.container}>
            <View style={[styles.mancha, { top: -80, left: -60, width: 260, height: 260 }]} />
            <View style={[styles.mancha, { bottom: -100, right: -70, width: 300, height: 300 }]} />
            {COMIDA.map((c) => (
                <Flotante key={c.e} {...c} />
            ))}

            <View style={styles.centro}>
                <View style={styles.logoCaja}>
                    <Onda retraso={0} />
                    <Onda retraso={1100} />
                    <Animated.View style={[styles.logo, { transform: [{ scale: logo }] }]}>
                        <Animated.View style={{ transform: [{ translateY: caida }] }}>
                            <Ionicons name="location" size={46} color="#fff" />
                        </Animated.View>
                    </Animated.View>
                </View>

                <View style={styles.letras}>
                    {LETRAS.map((l, i) => (
                        <Animated.Text
                            key={i}
                            style={[
                                styles.letra,
                                i >= 4 && { color: colors.primary },
                                {
                                    opacity: letras[i],
                                    transform: [{ translateY: letras[i].interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }, { scale: letras[i] }],
                                },
                            ]}
                        >
                            {l}
                        </Animated.Text>
                    ))}
                </View>

                <Animated.Text style={[styles.lema, { opacity: lema, transform: [{ translateY: lema.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
                    Descubre sabores cerca de ti
                </Animated.Text>
            </View>

            <View style={styles.barra}>
                <Animated.View style={[styles.barraRelleno, { width: ancho }]} />
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    mancha: { position: "absolute", borderRadius: 999, backgroundColor: colors.primarySoft, opacity: 0.7 },
    comida: { position: "absolute", fontSize: 30 },
    centro: { alignItems: "center", gap: 10 },
    logoCaja: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
    onda: { position: "absolute", width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary },
    logo: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 8 },
    letras: { flexDirection: "row", marginTop: 6 },
    letra: { fontSize: 38, fontWeight: "800", color: colors.text },
    lema: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
    barra: { position: "absolute", bottom: 70, width: 140, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
    barraRelleno: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
}));
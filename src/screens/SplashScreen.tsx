import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Logo from "../components/Logo";
import { colors } from "../theme";

export default function SplashScreen() {
    const progreso = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progreso, { toValue: 1, duration: 1600, useNativeDriver: false }).start();
    }, [progreso]);

    const ancho = progreso.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

    return (
        <View style={styles.container}>
            <View style={styles.centro}>
                <Logo size={84} />
                <Text style={styles.marca}>FoodMap</Text>
                <Text style={styles.sub}>Descubre sabores cerca de ti</Text>
            </View>
            <View style={styles.barra}>
                <Animated.View style={[styles.barraRelleno, { width: ancho }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
    centro: { alignItems: "center", gap: 8 },
    marca: { fontSize: 30, fontWeight: "800", color: colors.text, marginTop: 8 },
    sub: { fontSize: 14, color: colors.textMuted },
    barra: { position: "absolute", bottom: 70, width: 120, height: 4, borderRadius: 2, backgroundColor: colors.border },
    barraRelleno: { height: 4, borderRadius: 2, backgroundColor: colors.primary },
});
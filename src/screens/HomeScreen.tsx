import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Logo from "../components/Logo";
import MapIllustration from "../components/MapIllustration";
import { getRestaurantes } from "../services/restaurant";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { Restaurante } from "../types";

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Inicio">) {
    const [destacados, setDestacados] = useState<Restaurante[]>([]);

    useEffect(() => {
        getRestaurantes()
            .then((l) =>
                setDestacados([...l].sort((a, b) => Number(b.calificacion_promedio) - Number(a.calificacion_promedio)).slice(0, 3))
            )
            .catch(() => { });
    }, []);

    const irALogin = () => navigation.navigate("Login");

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.marca}>
                    <Logo size={34} />
                    <Text style={styles.marcaTxt}>FoodMap</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <Pressable onPress={irALogin}>
                        <Text style={styles.link}>Iniciar sesión</Text>
                    </Pressable>
                    <Pressable style={styles.btnReg} onPress={() => navigation.navigate("Registro")}>
                        <Text style={styles.btnRegTxt}>Registrarme</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
                <View style={styles.hero}>
                    <View style={styles.heroCard}>
                        <Text style={styles.heroTitulo}>Descubre dónde comer, sin dudas</Text>
                        <Text style={styles.heroTexto}>
                            Encuentra sabores en tu barrio. Mira fotos, conoce las opiniones y elige tu próxima mesa.
                        </Text>
                        <Pressable style={styles.heroBtn} onPress={irALogin}>
                            <Text style={styles.heroBtnTxt}>Explorar el mapa</Text>
                        </Pressable>
                    </View>
                    <MapIllustration />
                </View>

                <View style={{ padding: spacing.xl, gap: spacing.md }}>
                    <Text style={styles.seccion}>Restaurantes destacados</Text>
                    <Text style={styles.seccionSub}>Lugares cercanos que vale la pena conocer.</Text>
                    {destacados.map((r) => (
                        <View key={r.id} style={styles.item}>
                            {r.imagen ? (
                                <Image source={{ uri: r.imagen }} style={styles.foto} />
                            ) : (
                                <View style={[styles.foto, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
                                    <Ionicons name="restaurant" size={22} color={colors.primary} />
                                </View>
                            )}
                            <View style={{ flex: 1, justifyContent: "space-between" }}>
                                <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                                <Text style={styles.detalle} numberOfLines={1}>{r.categoria?.nombre}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Ionicons name="star" size={13} color={colors.star} />
                                    <Text style={styles.rating}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                                </View>
                            </View>
                            <Pressable style={styles.verMas} onPress={irALogin}>
                                <Text style={styles.verMasTxt}>Ver más</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>

                <View style={styles.negocio}>
                    <Text style={styles.negocioPre}>¿Tienes un restaurante?</Text>
                    <Text style={styles.negocioTitulo}>Tu negocio, visible y en tus manos</Text>
                    <Text style={styles.negocioTexto}>
                        Comparte tu carta, actualiza tus horarios y deja que tu barrio te encuentre.
                    </Text>
                    <Pressable style={styles.negocioBtn} onPress={() => navigation.navigate("Registro", { tipo: "restaurante" })}>
                        <Text style={styles.heroBtnTxt}>Registrar mi restaurante</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    },
    marca: { flexDirection: "row", alignItems: "center", gap: 8 },
    marcaTxt: { fontSize: 17, fontWeight: "800", color: colors.text },
    link: { fontSize: 13, fontWeight: "600", color: colors.text },
    btnReg: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
    btnRegTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
    hero: { backgroundColor: colors.primary, padding: spacing.lg, gap: spacing.md },
    heroCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
    heroTitulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    heroTexto: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
    heroBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing.sm },
    heroBtnTxt: { color: "#fff", fontWeight: "700" },
    seccion: { fontSize: 20, fontWeight: "800", color: colors.text },
    seccionSub: { fontSize: 13, color: colors.textMuted, marginTop: -8 },
    item: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: "center" },
    foto: { width: 64, height: 64, borderRadius: radius.md },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    detalle: { fontSize: 12, color: colors.textMuted },
    rating: { fontSize: 12, fontWeight: "700", color: colors.text },
    verMas: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
    verMasTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
    negocio: {
        backgroundColor: colors.surface, margin: spacing.xl, marginTop: 0, borderRadius: radius.lg,
        padding: spacing.xl, gap: 6,
    },
    negocioPre: { fontSize: 12, fontWeight: "700", color: colors.primary },
    negocioTitulo: { fontSize: 20, fontWeight: "800", color: colors.text },
    negocioTexto: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
    negocioBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing.sm },
});
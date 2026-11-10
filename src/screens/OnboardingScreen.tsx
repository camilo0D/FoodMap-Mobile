import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapIllustration from "../components/MapIllustration";
import { prefs } from "../services/prefs";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const SLIDES = [
    {
        titulo: "Explora joyas gastronómicas seleccionadas para ti",
        texto: "Accede a mesas exclusivas, recomendaciones de chefs y lugares ocultos en tu ciudad.",
    },
    {
        titulo: "Encuentra restaurantes cerca de ti",
        texto: "Activa tu ubicación y descubre sabores a pocos pasos, con la distancia en cada tarjeta.",
    },
    {
        titulo: "Lee opiniones y deja la tuya",
        texto: "Consulta el menú, los horarios y las reseñas antes de elegir tu próxima mesa.",
    },
];

export default function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Onboarding">) {
    const [ancho, setAncho] = useState(0);
    const [pagina, setPagina] = useState(0);
    const scroll = useRef<ScrollView>(null);
    const ultima = pagina === SLIDES.length - 1;

    const terminar = async () => {
        await prefs.set("onboardingVisto", "1");
        navigation.replace("Inicio");
    };

    const siguiente = () => {
        if (ultima) return terminar();
        scroll.current?.scrollTo({ x: ancho * (pagina + 1), animated: true });
        setPagina(pagina + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable style={styles.omitir} onPress={terminar} hitSlop={10}>
                <Text style={styles.omitirTxt}>Omitir</Text>
            </Pressable>

            <View style={{ flex: 1 }} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
                <ScrollView
                    ref={scroll}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => setPagina(Math.round(e.nativeEvent.contentOffset.x / (ancho || 1)))}
                >
                    {SLIDES.map((s) => (
                        <View key={s.titulo} style={{ width: ancho, padding: spacing.xl, justifyContent: "center", gap: spacing.lg }}>
                            <MapIllustration />
                            <Text style={styles.titulo}>{s.titulo}</Text>
                            <Text style={styles.texto}>{s.texto}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.puntos}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.punto, i === pagina && styles.puntoActivo]} />
                ))}
            </View>

            <Pressable style={styles.boton} onPress={siguiente}>
                <Text style={styles.botonTxt}>{ultima ? "Comenzar experiencia" : "Siguiente"}</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    omitir: { alignSelf: "flex-end", paddingHorizontal: spacing.xl, paddingTop: spacing.md },
    omitirTxt: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text, textAlign: "center" },
    texto: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 21 },
    puntos: { flexDirection: "row", justifyContent: "center", gap: 6, marginVertical: spacing.lg },
    punto: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
    puntoActivo: { width: 22, backgroundColor: colors.primary },
    boton: {
        backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center",
        marginHorizontal: spacing.xl, marginBottom: spacing.xl,
    },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
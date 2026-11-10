import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Stars from "./Stars";
import { crearResena } from "../services/restaurant";
import { colors, radius, spacing } from "../theme";

type Props = { restauranteId: string; onClose: () => void; onSent: () => void };

export default function ReviewForm({ restauranteId, onClose, onSent }: Props) {
    const [rating, setRating] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enviar = async () => {
        if (rating === 0) return setError("Elige una calificación de 1 a 5 estrellas.");
        setEnviando(true);
        setError(null);
        try {
            await crearResena(restauranteId, rating, comentario.trim());
            onSent();
        } catch (e: any) {
            const status = e?.response?.status;
            const d = e?.response?.data;
            if (status === 401) setError("Inicia sesión para escribir una reseña.");
            else setError(d?.non_field_errors?.[0] ?? d?.rating?.[0] ?? d?.detail ?? "No pudimos enviar tu reseña.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <View style={styles.sheet}>
                <Text style={styles.titulo}>Escribir una reseña</Text>
                <Stars valor={rating} size={34} onChange={setRating} />
                <TextInput
                    style={styles.input}
                    placeholder="Cuéntanos tu experiencia (opcional)"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={comentario}
                    onChangeText={setComentario}
                />
                {error && <Text style={styles.error}>{error}</Text>}
                <Pressable style={styles.boton} onPress={enviar} disabled={enviando}>
                    {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Publicar reseña</Text>}
                </Pressable>
                <Pressable onPress={onClose} style={{ alignItems: "center", paddingVertical: 8 }}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>Cancelar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.md },
    titulo: { fontSize: 20, fontWeight: "700", color: colors.text },
    input: {
        minHeight: 90, borderRadius: radius.md, backgroundColor: colors.background, padding: spacing.md,
        color: colors.text, textAlignVertical: "top",
    },
    error: { color: "#B3261E", fontSize: 13 },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
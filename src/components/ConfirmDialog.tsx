import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type Props = {
    titulo: string;
    texto: string;
    confirmarTxt: string;
    destructivo?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({ titulo, texto, confirmarTxt, destructivo, onConfirm, onCancel }: Props) {
    return (
        <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
            <View style={styles.caja}>
                <Text style={styles.titulo}>{titulo}</Text>
                <Text style={styles.texto}>{texto}</Text>
                <Pressable style={styles.cancelar} onPress={onCancel}>
                    <Text style={styles.cancelarTxt}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.confirmar, destructivo && { backgroundColor: "#D83A1B" }]} onPress={onConfirm}>
                    <Text style={styles.confirmarTxt}>{confirmarTxt}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
    caja: { width: "100%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
    titulo: { fontSize: 18, fontWeight: "800", color: colors.text },
    texto: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
    cancelar: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
    cancelarTxt: { fontWeight: "700", color: colors.text },
    confirmar: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
    confirmarTxt: { color: "#fff", fontWeight: "700" },
});
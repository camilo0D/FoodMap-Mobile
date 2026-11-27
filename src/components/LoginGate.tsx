import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, themed, useColors } from "../theme";

type Props = {
    titulo: string;
    texto: string;
    onLogin: () => void;
    onRegistro: () => void;
};

// Tarjeta que invita a iniciar sesión para ver el contenido completo (modo invitado).
export default function LoginGate({ titulo, texto, onLogin, onRegistro }: Props) {
    const styles = useStyles();
    const colors = useColors();
    return (
        <View style={styles.caja}>
            <View style={styles.icono}>
                <Ionicons name="lock-closed" size={22} color={colors.primary} />
            </View>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.texto}>{texto}</Text>
            <Pressable style={styles.btn} onPress={onLogin}>
                <Text style={styles.btnTxt}>Iniciar sesión</Text>
            </Pressable>
            <Pressable onPress={onRegistro}>
                <Text style={styles.link}>Crear cuenta gratis</Text>
            </Pressable>
        </View>
    );
}

const useStyles = themed((colors) => ({
    caja: {
        backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
        padding: spacing.xl, alignItems: "center", gap: spacing.sm,
    },
    icono: {
        width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft,
        alignItems: "center", justifyContent: "center",
    },
    titulo: { fontSize: 16, fontWeight: "800", color: colors.text, textAlign: "center" },
    texto: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 19 },
    btn: {
        alignSelf: "stretch", backgroundColor: colors.primary, borderRadius: radius.md,
        paddingVertical: 13, alignItems: "center", marginTop: spacing.sm,
    },
    btnTxt: { color: "#fff", fontWeight: "700" },
    link: { color: colors.primary, fontWeight: "700", marginTop: 4 },
}));
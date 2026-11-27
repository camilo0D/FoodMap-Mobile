import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { spacing, themed, useColors } from "../theme";

// Encabezado con botón de volver para las pantallas del panel del negocio.
export default function PantallaHeader({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
    const styles = useStyles();
    const colors = useColors();
    const navigation = useNavigation<any>();
    return (
        <View style={styles.fila}>
            <Pressable style={styles.atras} onPress={() => navigation.goBack()} hitSlop={8}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
            <View style={{ flex: 1 }}>
                <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
                {!!subtitulo && <Text style={styles.sub} numberOfLines={1}>{subtitulo}</Text>}
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    atras: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
        alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
    },
    titulo: { fontSize: 22, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
}));
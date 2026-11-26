import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACENTOS, radius, spacing, themed, useTheme } from "../theme";

type Props = { visible: boolean; onClose: () => void };

export default function ThemeSheet({ visible, onClose }: Props) {
    const styles = useStyles();
    const { oscuro, acento, alternarModo, setAcento, colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.hoja}>
                    <View style={styles.cabecera}>
                        <Text style={styles.titulo}>Apariencia</Text>
                        <Pressable onPress={onClose} hitSlop={10}>
                            <Ionicons name="close" size={22} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.fila}>
                        <View style={styles.icono}>
                            <Ionicons name={oscuro ? "moon" : "sunny"} size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.filaTitulo}>Modo oscuro</Text>
                            <Text style={styles.filaSub}>{oscuro ? "Activado" : "Desactivado"}</Text>
                        </View>
                        <Switch value={oscuro} onValueChange={alternarModo} trackColor={{ true: colors.primary }} />
                    </View>

                    <Text style={styles.etiqueta}>Color de la app</Text>
                    <View style={styles.colores}>
                        {ACENTOS.map((a) => {
                            const activo = a.color === acento;
                            return (
                                <Pressable
                                    key={a.id}
                                    onPress={() => setAcento(a.color)}
                                    style={[styles.punto, { backgroundColor: a.color }, activo && styles.puntoActivo]}
                                    accessibilityLabel={a.nombre}
                                >
                                    {activo && <Ionicons name="checkmark" size={20} color="#fff" />}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const useStyles = themed((colors) => ({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", alignItems: "center" },
    hoja: {
        width: "100%", maxWidth: 420, backgroundColor: colors.surface, borderTopLeftRadius: 24,
        borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.lg,
    },
    cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    titulo: { fontSize: 20, fontWeight: "800", color: colors.text },
    fila: {
        flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.background,
        borderRadius: radius.lg, padding: spacing.md,
    },
    icono: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    filaTitulo: { fontSize: 15, fontWeight: "700", color: colors.text },
    filaSub: { fontSize: 12, color: colors.textMuted },
    etiqueta: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
    colores: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, paddingBottom: spacing.lg },
    punto: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "transparent" },
    puntoActivo: { borderColor: colors.text },
}));
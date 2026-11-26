import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemeSheet from "./ThemeSheet";
import { themed, useTheme } from "../theme";

export default function ThemeSwitch() {
    const styles = useStyles();
    const { oscuro, alternarModo, colors } = useTheme();
    const [abierto, setAbierto] = useState(false);

    return (
        <View style={styles.fila}>
            <Pressable onPress={alternarModo} style={styles.btn} accessibilityLabel="Cambiar entre modo claro y oscuro">
                <Ionicons name={oscuro ? "sunny" : "moon"} size={18} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => setAbierto(true)} style={styles.btn} accessibilityLabel="Cambiar el color de la app">
                <Ionicons name="color-palette" size={18} color={colors.primary} />
            </Pressable>
            <ThemeSheet visible={abierto} onClose={() => setAbierto(false)} />
        </View>
    );
}

const useStyles = themed((colors) => ({
    fila: { flexDirection: "row", gap: 8 },
    btn: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
        alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
    },
}));
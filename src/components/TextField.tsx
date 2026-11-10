import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

type Props = TextInputProps & {
    label: string;
    icono: keyof typeof Ionicons.glyphMap;
    error?: string;
    secure?: boolean;
};

export default function TextField({ label, icono, error, secure, ...rest }: Props) {
    const [oculto, setOculto] = useState(!!secure);
    return (
        <View style={{ gap: 6 }}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.caja, !!error && styles.cajaError]}>
                <Ionicons name={icono} size={18} color={colors.textMuted} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={oculto}
                    autoCapitalize="none"
                    {...rest}
                />
                {secure && (
                    <Pressable onPress={() => setOculto(!oculto)} hitSlop={8}>
                        <Ionicons name={oculto ? "eye-outline" : "eye-off-outline"} size={18} color={colors.textMuted} />
                    </Pressable>
                )}
            </View>
            {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    caja: {
        flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface,
        borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 50,
    },
    cajaError: { borderColor: "#B3261E" },
    input: { flex: 1, color: colors.text, fontSize: 15, outlineStyle: "none" } as any,
    error: { color: "#B3261E", fontSize: 12 },
});
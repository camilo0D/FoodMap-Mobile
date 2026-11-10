import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { colors, radius, spacing } from "../theme";

export default function ProfileScreen() {
    const { usuario, logout } = useAuth();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.cabecera}>
                <View style={styles.avatar}>
                    <Text style={styles.inicial}>{usuario?.username.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.nombre}>{usuario?.username}</Text>
                <Text style={styles.sub}>{usuario?.email}</Text>
                <Text style={styles.rol}>{usuario?.roles?.join(" · ")}</Text>
            </View>
            <Pressable style={styles.salir} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#B3261E" />
                <Text style={styles.salirTxt}>Cerrar sesión</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
    cabecera: { alignItems: "center", gap: 4, marginTop: spacing.xl },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    inicial: { color: "#fff", fontSize: 34, fontWeight: "800" },
    nombre: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: spacing.md },
    sub: { color: colors.textMuted },
    rol: { color: colors.primary, fontWeight: "700", marginTop: 4, textTransform: "capitalize" },
    salir: {
        flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 40,
        backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14,
    },
    salirTxt: { color: "#B3261E", fontWeight: "700" },
});
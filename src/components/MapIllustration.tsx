import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export default function MapIllustration() {
    return (
        <View style={styles.card}>
            <View style={[styles.calle, { top: 40, left: -10, right: -10, transform: [{ rotate: "-12deg" }] }]} />
            <View style={[styles.calle, { top: 90, left: -10, right: -10, transform: [{ rotate: "8deg" }] }]} />
            <View style={[styles.calleV, { left: "30%" }]} />
            <View style={[styles.calleV, { left: "68%" }]} />
            <View style={styles.pin}>
                <Ionicons name="restaurant" size={22} color="#fff" />
            </View>
            <View style={styles.etiqueta}>
                <Ionicons name="sparkles" size={12} color={colors.primary} />
                <Text style={styles.etiquetaTxt}>Selección del Chef</Text>
            </View>
            <View style={styles.pie}>
                <View style={styles.chip}>
                    <Ionicons name="star-outline" size={12} color={colors.primary} />
                    <Text style={styles.chipTxt}>Experiencias de autor</Text>
                </View>
                <View style={styles.chip}>
                    <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                    <Text style={styles.chipTxt}>Reservas prioritarias</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 190, borderRadius: radius.lg, backgroundColor: "#EFE6DC", overflow: "hidden",
        alignItems: "center", justifyContent: "center",
    },
    calle: { position: "absolute", height: 14, backgroundColor: "#fff" },
    calleV: { position: "absolute", top: 0, bottom: 0, width: 12, backgroundColor: "#fff", opacity: 0.8 },
    pin: {
        width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, borderWidth: 3,
        borderColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 6,
    },
    etiqueta: {
        flexDirection: "row", gap: 4, alignItems: "center", backgroundColor: "#fff", borderRadius: radius.pill,
        paddingHorizontal: 10, paddingVertical: 4, marginTop: spacing.sm,
    },
    etiquetaTxt: { fontSize: 11, fontWeight: "700", color: colors.text },
    pie: { position: "absolute", bottom: 10, left: 10, right: 10, flexDirection: "row", gap: 6 },
    chip: {
        flex: 1, flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "center",
        backgroundColor: "#fff", borderRadius: radius.pill, paddingVertical: 6,
    },
    chipTxt: { fontSize: 10, fontWeight: "600", color: colors.text },
});
import { StyleSheet, Text, View } from "react-native";

const COLORES: Record<string, { fondo: string; texto: string }> = {
    activo: { fondo: "#E3F5E8", texto: "#1F7A44" },
    inactivo: { fondo: "#ECE8E4", texto: "#6B625B" },
    suspendido: { fondo: "#FBE4E1", texto: "#A12B1F" },
};

export default function EstadoBadge({ estado }: { estado: string }) {
    const c = COLORES[estado] ?? COLORES.inactivo;
    return (
        <View style={[styles.caja, { backgroundColor: c.fondo }]}>
            <Text style={[styles.txt, { color: c.texto }]}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    caja: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
    txt: { fontSize: 11, fontWeight: "700" },
});
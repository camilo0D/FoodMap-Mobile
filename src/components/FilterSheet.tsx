import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export type Filtros = { distanciaKm: number | null; minRating: number | null };
export const FILTROS_VACIOS: Filtros = { distanciaKm: null, minRating: null };

type Props = {
    valor: Filtros;
    ubicacionActiva: boolean;
    onApply: (f: Filtros) => void;
    onClose: () => void;
};

function Opcion({ texto, activo, deshabilitado, onPress }: {
    texto: string; activo: boolean; deshabilitado?: boolean; onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={deshabilitado}
            style={[styles.opcion, activo && styles.opcionActiva, deshabilitado && { opacity: 0.4 }]}
        >
            <Text style={[styles.opcionTxt, activo && styles.opcionTxtActiva]}>{texto}</Text>
        </Pressable>
    );
}

export default function FilterSheet({ valor, ubicacionActiva, onApply, onClose }: Props) {
    const [b, setB] = useState<Filtros>(valor);

    return (
        <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <View style={styles.sheet}>
                <Text style={styles.titulo}>Filtros</Text>

                <Text style={styles.label}>Distancia</Text>
                <View style={styles.fila}>
                    {[1, 3, 5, 10].map((km) => (
                        <Opcion
                            key={km}
                            texto={`${km} km`}
                            activo={b.distanciaKm === km}
                            deshabilitado={!ubicacionActiva}
                            onPress={() => setB({ ...b, distanciaKm: b.distanciaKm === km ? null : km })}
                        />
                    ))}
                </View>
                {!ubicacionActiva && (
                    <Text style={styles.nota}>Activa tu ubicación con el botón del mapa para filtrar por distancia.</Text>
                )}

                <Text style={styles.label}>Calificación mínima</Text>
                <View style={styles.fila}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Opcion
                            key={n}
                            texto={`★ ${n}`}
                            activo={b.minRating === n}
                            onPress={() => setB({ ...b, minRating: b.minRating === n ? null : n })}
                        />
                    ))}
                </View>

                <Pressable style={styles.aplicar} onPress={() => onApply(b)}>
                    <Text style={styles.aplicarTxt}>Aplicar filtros</Text>
                </Pressable>
                <Pressable style={styles.limpiar} onPress={() => onApply(FILTROS_VACIOS)}>
                    <Text style={styles.limpiarTxt}>Limpiar filtros</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
    sheet: {
        backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: spacing.xl, gap: spacing.md,
    },
    titulo: { fontSize: 20, fontWeight: "700", color: colors.text },
    label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginTop: spacing.sm },
    fila: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
    nota: { fontSize: 12, color: colors.textMuted },
    opcion: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: colors.background },
    opcionActiva: { backgroundColor: colors.primary },
    opcionTxt: { color: colors.text, fontWeight: "600", fontSize: 13 },
    opcionTxtActiva: { color: "#fff" },
    aplicar: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: spacing.md },
    aplicarTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
    limpiar: { paddingVertical: 10, alignItems: "center" },
    limpiarTxt: { color: colors.primary, fontWeight: "700" },
});
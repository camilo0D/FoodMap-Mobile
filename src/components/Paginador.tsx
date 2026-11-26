import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing, themed, useColors } from "../theme";

type Props = { pagina: number; total: number; porPagina: number; onChange: (p: number) => void };

export default function Paginador({ pagina, total, porPagina, onChange }: Props) {
  const styles = useStyles();
  const colors = useColors();
    const paginas = Math.max(1, Math.ceil(total / porPagina));
    if (total <= porPagina) return null;
    return (
        <View style={styles.fila}>
            <Pressable disabled={pagina <= 1} onPress={() => onChange(pagina - 1)} style={[styles.btn, pagina <= 1 && { opacity: 0.4 }]}>
                <Text style={styles.btnTxt}>Anterior</Text>
            </Pressable>
            <Text style={styles.info}>Página {pagina} de {paginas}</Text>
            <Pressable disabled={pagina >= paginas} onPress={() => onChange(pagina + 1)} style={[styles.btn, pagina >= paginas && { opacity: 0.4 }]}>
                <Text style={styles.btnTxt}>Siguiente</Text>
            </Pressable>
        </View>
    );
}

const useStyles = themed((colors) => ({
    fila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.lg },
    btn: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
    btnTxt: { fontWeight: "700", color: colors.text, fontSize: 13 },
    info: { fontSize: 12, color: colors.textMuted },
}));
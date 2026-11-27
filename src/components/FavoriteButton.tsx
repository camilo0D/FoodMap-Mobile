import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../context/FavoritesContext";
import { useColors } from "../theme";
import { useRequireAuth } from "../hooks/useRequireAuth";
import type { Restaurante } from "../types";

type Props = { restaurante: Restaurante; size?: number; flotante?: boolean };

export default function FavoriteButton({ restaurante, size = 20, flotante }: Props) {
    const colors = useColors();
    const { esFavorito, toggle } = useFavorites();
    const requerirSesion = useRequireAuth();
    const activo = esFavorito(restaurante.id);
    const caja = size + 16;

    return (
        <Pressable
            onPress={() =>
                requerirSesion(
                    () => toggle(restaurante),
                    "Inicia sesión para guardar tus favoritos.",
                    { name: "Detalle", params: { restaurante, accion: "favorito" } }
                )
            }
            hitSlop={8}
            style={
                flotante
                    ? { width: caja, height: caja, borderRadius: caja / 2, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", elevation: 3 }
                    : undefined
            }
        >
            <Ionicons name={activo ? "heart" : "heart-outline"} size={size} color={activo ? "#E5383B" : colors.textMuted} />
        </Pressable>
    );
}
import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Destino, useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";

/**
 * Modo invitado: ejecuta `accion` si hay sesión. Si no, recuerda a dónde volver,
 * avisa por qué se pide la cuenta y lleva al inicio de sesión.
 */
export function useRequireAuth() {
    const { usuario, guardarDestino } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return useCallback(
        (accion: () => void, motivo: string, destino?: Destino) => {
            if (usuario) {
                accion();
                return true;
            }
            guardarDestino(destino ?? null);
            navigation.navigate("Login", { motivo });
            return false;
        },
        [usuario, guardarDestino, navigation]
    );
}
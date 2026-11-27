import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

// Permite navegar desde fuera de una pantalla (por ejemplo, al terminar de iniciar sesión).
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
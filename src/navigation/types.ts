import type { Restaurante } from "../types";

export type RootStackParamList = {
    Onboarding: undefined;
    Inicio: undefined;
    Login: undefined;
    Registro: { tipo?: "usuario" | "restaurante" } | undefined;
    Tabs: undefined;
    Detalle: { restaurante: Restaurante; distanciaKm?: number | null };
};
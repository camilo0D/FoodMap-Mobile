import type { Restaurante } from "../types";

export type RootStackParamList = {
    Login: undefined;
    Registro: undefined;
    Tabs: undefined;
    Detalle: { restaurante: Restaurante; distanciaKm?: number | null };
};
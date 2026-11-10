import type { Restaurante } from "../types";

export type RootStackParamList = {
    Tabs: undefined;
    Detalle: { restaurante: Restaurante; distanciaKm?: number | null };
};
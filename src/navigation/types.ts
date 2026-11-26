import type { Plato, Restaurante } from "../types";

export type RootStackParamList = {
    Onboarding: undefined;
    Inicio: undefined;
    Login: undefined;
    Registro: { tipo?: "usuario" | "restaurante" } | undefined;
    RecuperarClave: undefined;
    RestablecerClave: { email: string };
    Tabs: undefined;
    Detalle: { restaurante: Restaurante; distanciaKm?: number | null };
    Ruta: { restaurante: Restaurante };
    EditarPerfil: undefined;
    MisResenas: undefined;
    Configuracion: undefined;
    EditarLocal: { restaurante?: Restaurante } | undefined;
    EditarPlato: { restauranteId: string; plato?: Plato };
};
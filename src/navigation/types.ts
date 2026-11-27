import type { Plato, Restaurante } from "../types";

// Acción que se retoma al volver de iniciar sesión.
export type AccionPendiente = "resena" | "favorito";

export type RootStackParamList = {
    Onboarding: undefined;
    Inicio: undefined;
    Login: { motivo?: string } | undefined;
    Registro: { tipo?: "usuario" | "restaurante"; motivo?: string } | undefined;
    ExplorarInvitado: { busqueda?: string } | undefined;
    MapaInvitado: undefined;
    RecuperarClave: undefined;
    RestablecerClave: { email: string };
    Tabs: undefined;
    Detalle: { restaurante: Restaurante; distanciaKm?: number | null; accion?: AccionPendiente };
    Ruta: { restaurante: Restaurante };
    EditarPerfil: undefined;
    MisResenas: undefined;
    Configuracion: undefined;
    EditarLocal: { restaurante?: Restaurante } | undefined;
    EditarPlato: { restauranteId: string; plato?: Plato };
};
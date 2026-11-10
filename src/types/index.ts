export type Rol = "usuario" | "restaurante" | "admin";

export type Usuario = {
    id: string;
    username: string;
    email: string;
    roles: Rol[];
};

export type Restaurante = {
    id: string;
    nombre: string;
    descripcion: string;
    telefono: string;
    imagen: string | null;
    direccion: string;
    latitud: string;
    longitud: string;
    categoria: { id: string; nombre: string; icono: string };
    horario: Record<string, string> | null;
    calificacion_promedio: string;
    total_calificaciones: number;
};

export type LoginResponse = {
    access: string;
    refresh: string;
    user: Usuario;
};
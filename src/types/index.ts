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

export type Plato = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: string;
    imagen: string | null;
    disponible: boolean;
};

export type Resena = {
    id: string;
    usuario: string;
    usuario_username: string;
    usuario_avatar: string | null;
    rating: number;
    comment: string;
    created_at: string;
};
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

export type Perfil = {
    id: string;
    username: string;
    email: string;
    nombre: string;
    bio: string;
    avatar: string | null;
    roles: string[];
    created_at: string;
};

export type MiResena = {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    restaurante: { id: string; nombre: string; imagen: string | null };
};

export type Categoria = { id: string; nombre: string; icono: string };

export type AdminUsuario = {
    id: string;
    username: string;
    email: string;
    estado: string;
    roles: string[];
    created_at: string;
    is_active: boolean;
};

export type AdminRestaurante = {
    id: string;
    nombre: string;
    direccion: string;
    estado: string;
    dueno_username: string | null;
    calificacion_promedio: string;
    total_calificaciones: number;
    created_at: string;
};

export type AdminResumen = {
    usuarios: { total: number; activos: number; suspendidos: number };
    restaurantes: { total: number; activos: number; suspendidos: number };
    resenas: { total: number };
};

export type AdminCategoria = { id: string; nombre: string; icono: string; restaurantes: number };

export type AdminRol = { id: string; nombre: string; permisos: Record<string, unknown>; usuarios: number };
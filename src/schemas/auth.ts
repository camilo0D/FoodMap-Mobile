import { z } from "zod";

export const loginSchema = z.object({
    identificador: z.string().min(1, "Escribe tu usuario o correo"),
    clave: z.string().min(1, "Escribe tu contraseña"),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registroSchema = z
    .object({
        username: z
            .string()
            .min(3, "Mínimo 3 caracteres")
            .max(30, "Máximo 30 caracteres")
            .regex(/^[\w.@+-]+$/, "Solo letras, números y . @ + - _"),
        email: z.string().min(1, "Escribe tu correo").email("Correo no válido"),
        clave: z.string().min(8, "Mínimo 8 caracteres"),
        confirmar: z.string().min(1, "Confirma tu contraseña"),
    })
    .refine((d) => d.clave === d.confirmar, {
        message: "Las contraseñas no coinciden",
        path: ["confirmar"],
    });
export type RegistroForm = z.infer<typeof registroSchema>;
import { z } from "zod";

/**
 * Validación de variables de entorno en tiempo de arranque/compilación.
 * Si falta o está mal una variable, el proceso falla rápido con un mensaje claro
 * en lugar de romper silenciosamente en runtime.
 *
 * IMPORTANTE: las variables del servidor (sin NEXT_PUBLIC_) sólo deben leerse
 * desde código server. Next reemplaza `process.env.NEXT_PUBLIC_*` en build, y
 * mantiene el resto fuera del bundle del cliente.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function format(error: z.ZodError): never {
  console.error("❌ Variables de entorno inválidas:");
  for (const issue of error.issues) {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  }
  throw new Error("Revisá tu archivo .env.local (ver .env.example).");
}

// Estas dos referencias deben ser estáticas para que Next las inserte en build.
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
if (!clientParsed.success) format(clientParsed.error);

export const clientEnv = clientParsed.data;

/**
 * Sólo invocar desde código server. Lee y valida las variables sensibles.
 */
export function serverEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) format(parsed.error);
  return parsed.data;
}

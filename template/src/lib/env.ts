import { z } from "zod";

/**
 * Validate environment variables at startup/build time.
 * If a variable is missing or malformed, the process fails fast with a clear
 * message instead of breaking silently at runtime.
 *
 * IMPORTANT: server variables (without NEXT_PUBLIC_) must only be read from
 * server code. Next replaces `process.env.NEXT_PUBLIC_*` at build time and keeps
 * everything else out of the client bundle.
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
  console.error("❌ Invalid environment variables:");
  for (const issue of error.issues) {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  }
  throw new Error("Check your .env.local file (see .env.example).");
}

// These two references must be static so Next can inline them at build time.
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
if (!clientParsed.success) format(clientParsed.error);

export const clientEnv = clientParsed.data;

/**
 * Only call from server code. Reads and validates the sensitive variables.
 */
export function serverEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) format(parsed.error);
  return parsed.data;
}

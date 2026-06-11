"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentials = z.object({
  email: z.string().email("Invalid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function parse(formData: FormData) {
  return credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function login(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Invalid credentials.")}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const parsed = parse(formData);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is enabled, the user must confirm first.
  redirect(`/login?error=${encodeURIComponent("Check your email to confirm your account.")}`);
}

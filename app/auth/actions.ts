"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string | null)?.trim();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    ...(name ? { options: { data: { display_name: name } } } : {}),
  });
  if (error) return { error: error.message };

  redirect("/app");
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Admin vai direto para o painel; usuário comum segue o fluxo normal
  if (isAdmin(email)) redirect("/admin");
  redirect(redirectTo ?? "/app");
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/app` },
  });
  if (error) return { error: error.message };

  return { success: "Link de acesso enviado para o seu email." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/reset/confirm`,
  });
  if (error) return { error: error.message };

  return { success: "Email de recuperação enviado. Verifique sua caixa de entrada." };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/app");
}

export async function resendConfirmation() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Usuário não encontrado." };

  const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
  if (error) return { error: error.message };

  return { success: "Email de confirmação reenviado." };
}

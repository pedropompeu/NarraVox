"use server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePremium(userId: string, current: boolean) {
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      premium: !current,
      premium_at: !current ? new Date().toISOString() : null,
    })
    .eq("id", userId);
  revalidatePath("/admin");
}

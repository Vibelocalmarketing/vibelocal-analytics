import { createClient } from "@supabase/supabase-js";

// Single place to delete a user account. Every new table with a foreign key
// to auth.users must get its cleanup added here when that table is created.
export async function deleteAccount(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

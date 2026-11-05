// Lecture de l'historique d'une conversation (côté serveur).
// RLS : seuls les participants du mentorat reçoivent les messages.
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types/database";

const HISTORY_LIMIT = 200;

/** Les derniers messages d'un mentorat, du plus ancien au plus récent. */
export async function getMessages(mentorshipId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, mentorship_id, sender_id, content, created_at")
    .eq("mentorship_id", mentorshipId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  // On a pris les plus récents : on les remet dans l'ordre chronologique
  return ((data ?? []) as Message[]).reverse();
}

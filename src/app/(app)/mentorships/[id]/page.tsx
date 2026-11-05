import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMentorshipById } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { getMessages } from "@/features/messaging/queries";
import { Chat } from "@/features/messaging/components/Chat";
import { SessionsPanel } from "@/features/sessions/components/SessionsPanel";
import { GoalsPanel } from "@/features/goals/components/GoalsPanel";

export const metadata: Metadata = { title: "Espace de mentorat · MentorConnect" };

export default async function MentorshipPage({ params }: PageProps<"/mentorships/[id]">) {
  const { id } = await params;
  const [profile, mentorship] = await Promise.all([getCurrentProfile(), getMentorshipById(id)]);
  if (!profile) redirect("/dashboard");
  // Introuvable OU pas participant (RLS ne renvoie rien) : même réponse 404
  if (!mentorship) notFound();

  // La conversation existe pour un mentorat actif (écriture) ou terminé (lecture seule)
  const hasChat = mentorship.status === "accepted" || mentorship.status === "ended";
  const messages = hasChat ? await getMessages(mentorship.id) : [];
  const names = {
    [mentorship.mentor.id]: mentorship.mentor.full_name,
    [mentorship.mentee.id]: mentorship.mentee.full_name,
  };

  return (
    <>
      <Link href="/mentorships" className="mb-4 inline-block text-sm text-brand-700 hover:underline">
        ← Mes mentorats
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 lg:col-span-2">
          {hasChat ? (
            <Chat
              mentorshipId={mentorship.id}
              currentUserId={profile.id}
              names={names}
              initialMessages={messages}
              canWrite={mentorship.status === "accepted"}
            />
          ) : (
            <MentorshipCard mentorship={mentorship} viewerRole={profile.role} />
          )}
        </div>

        {hasChat && (
          <div className="grid content-start gap-4">
            <SessionsPanel
              mentorshipId={mentorship.id}
              isActive={mentorship.status === "accepted"}
              currentUserId={profile.id}
              names={names}
            />
            <GoalsPanel
              mentorshipId={mentorship.id}
              canEdit={mentorship.status === "accepted"}
            />
            <MentorshipCard mentorship={mentorship} viewerRole={profile.role} />
          </div>
        )}
      </div>
    </>
  );
}

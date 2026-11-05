/**
 * Double rôle (migration 0007) : une personne peut avoir un profil de mentor
 * ET un profil de mentoré. `role` est le MODE ACTIF ; is_mentor / is_mentee
 * indiquent que le profil de ce rôle est complet.
 */
import type { Profile, UserRole } from "@/types/database";

type RoleFields = Pick<Profile, "role" | "is_mentor" | "is_mentee">;

export const otherRole = (role: UserRole): UserRole => (role === "mentor" ? "mentee" : "mentor");

/** Le profil de ce rôle (par défaut le mode actif) est-il complet ? */
export function isRoleReady(profile: RoleFields, role: UserRole = profile.role) {
  return role === "mentor" ? profile.is_mentor : profile.is_mentee;
}

/** En mode mentor avec un profil de mentor complet (peut publier, animer…). */
export const isActiveMentor = (profile: RoleFields | null | undefined) =>
  Boolean(profile && profile.role === "mentor" && profile.is_mentor);

/** En mode mentoré avec un profil de mentoré complet (peut envoyer des demandes). */
export const isActiveMentee = (profile: RoleFields | null | undefined) =>
  Boolean(profile && profile.role === "mentee" && profile.is_mentee);

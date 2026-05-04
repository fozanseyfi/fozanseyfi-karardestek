import type { Profile } from "@/types/domain";
import type { UserRole } from "./constants";

export function isAdmin(profile: Profile | null | undefined): boolean {
  return profile?.role === "admin";
}

export function isUser(profile: Profile | null | undefined): boolean {
  return profile?.role === "user" || profile?.role === "admin";
}

export function isViewer(profile: Profile | null | undefined): boolean {
  return profile?.role === "viewer";
}

export function canCreateComparison(profile: Profile | null | undefined): boolean {
  return isUser(profile);
}

export function canManageUsers(profile: Profile | null | undefined): boolean {
  return isAdmin(profile);
}

export function canEditComparison(
  profile: Profile | null | undefined,
  comparisonOwnerId: string
): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return profile.id === comparisonOwnerId;
}

export function canDeleteComparison(
  profile: Profile | null | undefined,
  comparisonOwnerId: string
): boolean {
  return canEditComparison(profile, comparisonOwnerId);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Yönetici",
  user: "Kullanıcı",
  viewer: "Görüntüleyici",
};

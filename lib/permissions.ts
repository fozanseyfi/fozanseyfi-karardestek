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
  _comparisonOwnerId: string
): boolean {
  if (!profile) return false;
  // admin ve user (org içindeki tüm karşılaştırmalar dahil) düzenleyebilir; viewer düzenleyemez
  return profile.role === "admin" || profile.role === "user";
}

export function canDeleteComparison(
  profile: Profile | null | undefined,
  comparisonOwnerId: string
): boolean {
  if (!profile) return false;
  // delete: sadece sahip veya admin (yıkıcı işlem, daha sıkı)
  if (profile.role === "admin") return true;
  return profile.id === comparisonOwnerId;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Yönetici",
  user: "Kullanıcı",
  viewer: "Görüntüleyici",
};

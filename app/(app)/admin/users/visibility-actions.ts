"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ResourceType = "comparison" | "project" | "firm";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum yok");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Yetkisiz");
  return { supabase, user };
}

export async function setResourceHidden(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  hidden: boolean
) {
  const { supabase } = await requireAdmin();

  if (hidden) {
    const { error } = await supabase
      .from("user_hidden_resources")
      .upsert(
        {
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
        },
        { onConflict: "user_id,resource_type,resource_id" }
      );
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("user_hidden_resources")
      .delete()
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/users");
}

export async function getHiddenResourcesForUser(userId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("user_hidden_resources")
    .select("resource_type, resource_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []) as { resource_type: ResourceType; resource_id: string }[];
}

export async function setResourceLocked(
  userId: string,
  resourceType: ResourceType,
  resourceId: string,
  locked: boolean
) {
  const { supabase, user } = await requireAdmin();

  if (locked) {
    const { error } = await supabase
      .from("user_locked_resources")
      .upsert(
        {
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          locked_by: user.id,
        },
        { onConflict: "user_id,resource_type,resource_id" }
      );
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("user_locked_resources")
      .delete()
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/users");
}

export async function getLockedResourcesForUser(userId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("user_locked_resources")
    .select("resource_type, resource_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []) as { resource_type: ResourceType; resource_id: string }[];
}

export type AvailableResources = {
  comparisons: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  firms: { id: string; name: string }[];
};

export async function getOrgResources(): Promise<AvailableResources> {
  const { supabase } = await requireAdmin();
  const [{ data: comparisons }, { data: projects }, { data: firms }] = await Promise.all([
    supabase.from("comparisons").select("id, name").order("name"),
    supabase.from("projects").select("id, name").order("name"),
    supabase.from("firms").select("id, name").eq("is_sample", false).order("name"),
  ]);
  return {
    comparisons: comparisons ?? [],
    projects: projects ?? [],
    firms: firms ?? [],
  };
}

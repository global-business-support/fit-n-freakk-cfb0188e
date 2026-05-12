import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ensureMemberRegistration = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: rpcMemberId, error: rpcError } = await supabaseAdmin.rpc("complete_user_registration" as never, {
      _user_id: data.userId,
    } as never);

    if (!rpcError && rpcMemberId) {
      return { memberId: rpcMemberId as string };
    }

    const { data: userRes, error: userError } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (userError || !userRes.user) {
      throw new Error("Registration user not found");
    }

    const meta = userRes.user.user_metadata || {};
    const onlyLetters = String(meta.first_name || meta.name || "USER").replace(/[^a-zA-Z]/g, "");
    const nameSlug = (onlyLetters.slice(0, 4) || "USER").toUpperCase().padEnd(4, "X");
    const phoneSlug = String(meta.phone || "").replace(/\D/g, "").slice(-4).padStart(4, "0");
    const baseMemberId = String(meta.member_id || `${nameSlug}${phoneSlug}`).toUpperCase().replace(/[^A-Z0-9]/g, "") || "USER0000";
    const positiveNumber = (value: unknown) => {
      const number = Number(value);
      return Number.isFinite(number) && number >= 1 ? number : null;
    };
    const inches = Number(meta.height_inches);

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, member_id")
      .not("member_id", "is", null);

    const used = new Set(
      (profiles || [])
        .filter((profile: any) => profile.user_id !== data.userId)
        .map((profile: any) => String(profile.member_id || "").toUpperCase())
    );

    let memberId = baseMemberId;
    let attempt = 0;
    while (used.has(memberId)) {
      attempt += 1;
      memberId = `${baseMemberId}${String(attempt).padStart(2, "0")}`;
    }

    const profilePayload = {
      user_id: data.userId,
      name: String(meta.name || "New Member"),
      phone: meta.phone ? String(meta.phone) : null,
      age: positiveNumber(meta.age),
      height: meta.height ? String(meta.height) : null,
      height_feet: positiveNumber(meta.height_feet),
      height_inches: Number.isFinite(inches) ? Math.min(Math.max(Math.trunc(inches), 0), 11) : null,
      weight: positiveNumber(meta.weight),
      gender: meta.gender ? String(meta.gender) : null,
      fitness_level: meta.fitness_level ? String(meta.fitness_level) : "beginner",
      member_id: memberId,
      dob: meta.dob ? String(meta.dob) : null,
    };

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "user_id" });
    if (profileError) throw new Error(profileError.message);

    const role = meta.user_type === "sub_user" ? "sub_user" : "member";
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role }, { onConflict: "user_id,role" });

    return { memberId };
  });

export const resolveMemberLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ identifier: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    if (identifier.includes("@")) return { email: identifier.toLowerCase() };

    const normalized = identifier.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const { data: rpcEmail } = await supabaseAdmin.rpc("get_email_by_member_id" as never, {
      _member_id: normalized,
    } as never);
    if (rpcEmail) return { email: String(rpcEmail).toLowerCase() };

    const { data: direct } = await supabaseAdmin
      .from("profiles")
      .select("user_id, member_id")
      .ilike("member_id", normalized)
      .maybeSingle();

    let profile = direct as any;
    if (!profile) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, member_id");
      profile = (profiles || []).find((row: any) => String(row.member_id || "").toUpperCase().replace(/[^A-Z0-9]/g, "") === normalized);
    }

    if (!profile?.user_id) return { email: null };

    const { data: userRes, error } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
    if (error || !userRes.user?.email) return { email: null };

    return { email: userRes.user.email };
  });
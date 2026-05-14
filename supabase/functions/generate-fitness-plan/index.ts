// AI Fitness Plan generator — uses Lovable AI Gateway to build a personalized
// 6-day workout split + diet guidance based on the member's goals & stats.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter (per user, per isolate)
const rateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 5; // 5 generations per user per hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Allow public gallery use; save is still handled client-side only for signed-in members.
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnon, {
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    });
    const { data: userData } = token ? await supabaseClient.auth.getUser(token) : { data: { user: null } };

    // Rate limit signed-in users by account and public gallery visitors by IP.
    const uid = userData?.user?.id || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "public";
    const now = Date.now();
    const hits = (rateMap.get(uid) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (hits.length >= RATE_MAX) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    hits.push(now);
    rateMap.set(uid, hits);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const {
      goal, // weight_loss | weight_gain | muscle_gain | maintain
      current_weight,
      target_weight,
      height_cm,
      age,
      gender,
      activity_level = "moderate",
      duration_days = 60,
      diet_preference = "non_veg",
    } = body;

    // Fetch the gym's exercise library so the AI can ONLY pick from existing exercises
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? supabaseAnon);
    const { data: libraryRows } = await adminClient
      .from("exercises")
      .select("name, body_part, gender_target")
      .or(`gender_target.eq.both,gender_target.eq.${gender}`)
      .order("body_part");
    const library = (libraryRows ?? []) as Array<{ name: string; body_part: string; gender_target: string }>;
    const grouped: Record<string, string[]> = {};
    for (const row of library) {
      const bp = row.body_part || "Other";
      (grouped[bp] ||= []).push(row.name);
    }
    const libraryText = Object.entries(grouped)
      .map(([bp, names]) => `${bp}: ${[...new Set(names)].slice(0, 30).join(" | ")}`)
      .join("\n");

    const systemPrompt = `You are an expert certified fitness coach and nutritionist. You build personalized 6-day workout splits with Sunday as a complete rest day. Respond ONLY by calling the build_plan function — no prose. Be specific, realistic, safe, and motivating.

CRITICAL: You MUST pick every exercise EXACTLY by name from the gym's library below. Do NOT invent new exercise names — copy them character-for-character. If a body part is missing in the library, skip it.

GYM EXERCISE LIBRARY (use these names verbatim):
${libraryText}`;

    const userPrompt = `Build a personalized fitness plan for this member:
- Goal: ${goal}
- Current weight: ${current_weight} kg
- Target weight: ${target_weight} kg
- Height: ${height_cm} cm
- Age: ${age}
- Gender: ${gender}
- Activity level: ${activity_level}
- Plan duration: ${duration_days} days
- Diet preference: ${diet_preference === "veg" ? "VEGETARIAN ONLY (no meat, no fish, no eggs — use paneer, tofu, dal, soya, milk, nuts)" : diet_preference === "egg" ? "EGGETARIAN (veg + eggs allowed, no meat/fish)" : "NON-VEGETARIAN (chicken, fish, eggs, meat allowed alongside veg)"}

IMPORTANT: All diet tips and food suggestions MUST strictly follow the diet preference above.

Rules:
- 6 training days (Monday to Saturday) + Sunday FULL REST
- Each training day focuses on a muscle group: Mon=Chest, Tue=Back, Wed=Legs, Thu=Shoulders, Fri=Arms, Sat=Abs/Cardio
- Each day must have 5-7 exercises picked ONLY from the library above (exact names)
- For every exercise add a "benefit" string (one short line: which muscle it grows + why)
- Include daily calorie target appropriate for the goal
- Add 5-7 actionable diet tips
- Include a brief motivational summary mentioning the timeframe & expected progress`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "build_plan",
              description: "Return the structured fitness & diet plan",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Motivational 2-3 sentence overview" },
                  daily_calories: { type: "number" },
                  protein_grams: { type: "number" },
                  weekly_schedule: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
                        focus: { type: "string", description: "e.g. Chest & Triceps, Rest" },
                        rest: { type: "boolean" },
                        exercises: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string", description: "EXACT exercise name from the library" },
                              sets: { type: "number" },
                              reps: { type: "string" },
                              body_part: { type: "string", description: "Body part this exercise targets" },
                              benefit: { type: "string", description: "One-line benefit: which muscle grows + why" },
                              notes: { type: "string" },
                            },
                            required: ["name", "sets", "reps", "body_part", "benefit"],
                          },
                        },
                      },
                      required: ["day", "focus", "rest"],
                    },
                  },
                  diet_tips: { type: "array", items: { type: "string" } },
                  expected_outcome: { type: "string" },
                },
                required: ["summary", "daily_calories", "weekly_schedule", "diet_tips", "expected_outcome"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_plan" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No plan returned");
    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-fitness-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

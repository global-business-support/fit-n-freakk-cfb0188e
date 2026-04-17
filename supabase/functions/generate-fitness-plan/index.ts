// AI Fitness Plan generator — uses Lovable AI Gateway to build a personalized
// 6-day workout split + diet guidance based on the member's goals & stats.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    } = body;

    const systemPrompt = `You are an expert certified fitness coach and nutritionist. You build personalized 6-day workout splits with Sunday as a complete rest day. Respond ONLY by calling the build_plan function — no prose. Be specific, realistic, safe, and motivating.`;

    const userPrompt = `Build a personalized fitness plan for this member:
- Goal: ${goal}
- Current weight: ${current_weight} kg
- Target weight: ${target_weight} kg
- Height: ${height_cm} cm
- Age: ${age}
- Gender: ${gender}
- Activity level: ${activity_level}
- Plan duration: ${duration_days} days

Rules:
- 6 training days (Monday to Saturday) + Sunday FULL REST
- Each training day must focus on a specific muscle group: Mon=Chest, Tue=Back, Wed=Legs, Thu=Shoulders, Fri=Arms, Sat=Core/Cardio
- Each day must have 5-7 exercises with realistic sets & reps
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
                              name: { type: "string" },
                              sets: { type: "number" },
                              reps: { type: "string" },
                              notes: { type: "string" },
                            },
                            required: ["name", "sets", "reps"],
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

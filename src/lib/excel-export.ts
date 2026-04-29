import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

/** Fetches all admin data and triggers an .xlsx file download in the browser. */
export async function downloadAdminExcel(filename = "feet-and-freakk-export.xlsx") {
  const [
    profilesRes,
    feesRes,
    attendanceRes,
    salariesRes,
    productsRes,
    plansRes,
    rolesRes,
    exercisesRes,
    machinesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("fees").select("*"),
    supabase.from("attendance").select("*"),
    supabase.from("salaries").select("*"),
    supabase.from("products").select("*"),
    supabase.from("ai_fitness_plans").select("id,user_id,goal,is_active,duration_days,created_at,updated_at"),
    supabase.from("user_roles").select("*"),
    supabase.from("exercises").select("id,name,body_part,gender_target,sets,reps,video_url"),
    supabase.from("machines").select("id,name,description,video_url"),
  ]);

  const profiles = profilesRes.data || [];
  const nameByUser = Object.fromEntries(profiles.map((p: any) => [p.user_id, p.name]));

  const enrich = (rows: any[]) =>
    rows.map((r) => ({ member_name: nameByUser[r.user_id] || "—", ...r }));

  const wb = XLSX.utils.book_new();

  const sheets: [string, any[]][] = [
    ["Members", profiles],
    ["Fees", enrich(feesRes.data || [])],
    ["Attendance", enrich(attendanceRes.data || [])],
    ["Salary", enrich(salariesRes.data || [])],
    ["Diet Plans", enrich(plansRes.data || [])],
    ["Products", productsRes.data || []],
    ["Roles", enrich(rolesRes.data || [])],
    ["Exercises", exercisesRes.data || []],
    ["Machines", machinesRes.data || []],
  ];

  for (const [name, rows] of sheets) {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ info: "no data" }]);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  XLSX.writeFile(wb, filename);
}

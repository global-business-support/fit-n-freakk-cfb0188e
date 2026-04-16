import { Link, useLocation } from "@tanstack/react-router";
import { Home, Users, Calendar, Dumbbell, BarChart3, Shield, User, Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const adminNav = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/attendance", icon: Calendar, label: "Attend" },
  { to: "/admin", icon: Shield, label: "Admin" },
  { to: "/analytics", icon: BarChart3, label: "Stats" },
] as const;

const memberNav = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/machines", icon: Cog, label: "Machines" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

const subUserNav = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/workouts", icon: Dumbbell, label: "Videos" },
  { to: "/machines", icon: Cog, label: "Machines" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const location = useLocation();
  const { role } = useAuth();

  const navItems = role === "admin" || role === "manager" ? adminNav : role === "sub_user" ? subUserNav : memberNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_var(--color-primary)]")}
              />
              <span className="font-body">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

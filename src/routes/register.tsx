import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Camera, User, Phone, Ruler, Weight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Feet & Freakk" },
      { name: "description", content: "Create your gym account" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-sm space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading tracking-wider">CREATE ACCOUNT</h1>
            <p className="text-xs text-muted-foreground font-body">Join Feet & Freakk today</p>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="flex justify-center">
          <label className="group relative cursor-pointer">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary transition-colors group-hover:border-primary">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Camera className="h-3.5 w-3.5" />
            </div>
            <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Enter your name" className="pl-9 bg-secondary border-border h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="+91 XXXXX XXXXX" className="pl-9 bg-secondary border-border h-11" />
            </div>
          </div>

          {/* Gender Toggle */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Gender</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-semibold uppercase tracking-wider font-body transition-all",
                    gender === g
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Age</Label>
              <Input placeholder="25" type="number" className="bg-secondary border-border h-11 text-center" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Height</Label>
              <div className="relative">
                <Input placeholder={'5\'10"'} className="bg-secondary border-border h-11 text-center" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-body">Weight</Label>
              <div className="relative">
                <Input placeholder="75kg" className="bg-secondary border-border h-11 text-center" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Email</Label>
            <Input type="email" placeholder="your@email.com" className="bg-secondary border-border h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-body">Password</Label>
            <Input type="password" placeholder="Create a password" className="bg-secondary border-border h-11" />
          </div>

          <Button type="submit" variant="ember" size="lg" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { ProfileForm } from "@/components/profile-form"

export const metadata = {
  title: "Profile - Burrow",
  description: "Manage your Burrow profile and personal details.",
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch or create profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // If no profile exists yet (edge case), create one
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: user.email?.split("@")[0] || null,
      })
      .select()
      .single()
    profile = newProfile
  }

  // Fallback profile
  const safeProfile = profile || {
    id: user.id,
    display_name: user.email?.split("@")[0] || null,
    full_name: null,
    bio: null,
    phone_number: null,
    avatar_url: null,
    location: null,
    university: null,
  }

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and how others see you on Burrow.
          </p>
        </div>
        <ProfileForm profile={safeProfile} email={user.email || ""} />
      </main>
    </div>
  )
}

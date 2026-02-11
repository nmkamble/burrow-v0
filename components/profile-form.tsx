"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Save, User } from "lucide-react"

interface Profile {
  id: string
  display_name: string | null
  full_name: string | null
  bio: string | null
  phone_number: string | null
  avatar_url: string | null
  location: string | null
  university: string | null
}

interface ProfileFormProps {
  profile: Profile
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [displayName, setDisplayName] = useState(profile.display_name || "")
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const [location, setLocation] = useState(profile.location || "")
  const [university, setUniversity] = useState(profile.university || "")

  const initials = (displayName || fullName || email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: profile.id,
        display_name: displayName || null,
        full_name: fullName || null,
        bio: bio || null,
        phone_number: phoneNumber || null,
        avatar_url: avatarUrl || null,
        location: location || null,
        university: university || null,
        updated_at: new Date().toISOString(),
      })

    setIsLoading(false)

    if (error) {
      toast.error("Failed to update profile. Please try again.")
    } else {
      toast.success("Profile updated successfully!")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar & Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Profile</CardTitle>
          <CardDescription>
            Your public profile information visible to other Burrow users.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={displayName || "Avatar"} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-display font-bold">
                {initials || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a link to your profile picture.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="How others see you"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is the name shown on your listings and requests.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="Your legal name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Only shared with confirmed borrowers/lenders.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell your neighbors a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              A short description visible on your public profile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Contact & Location
          </CardTitle>
          <CardDescription>
            Help neighbors find and coordinate with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Managed through your account settings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Shared only with confirmed borrowers/lenders.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Neighborhood / Area</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown, West Side"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Helps neighbors find items nearby.
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="university">University / School</Label>
            <Input
              id="university"
              placeholder="e.g., State University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If you are a student, this builds trust with fellow students.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  )
}

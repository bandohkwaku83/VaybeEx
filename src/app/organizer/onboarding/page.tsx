"use client";

import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUploadZone } from "@/components/organizer/file-upload-zone";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

function OnboardingFlow() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    businessName: "",
    bio: "",
    specialties: "",
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [nationalId, setNationalId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.organizerStatus === "pending") {
        router.replace("/organizer/pending");
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user, router]);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const canSubmit =
    form.name.trim() &&
    form.location.trim() &&
    form.phone.trim() &&
    form.businessName.trim() &&
    form.bio.trim() &&
    profilePicture &&
    nationalId;

  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (user) {
      login({
        name: form.name.trim(),
        email: form.email || user.email,
        organizerStatus: "pending",
      });
    }
    toast.success("Application submitted! We'll notify you once approved.");
    router.push("/organizer/pending");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-stone-50">
      <div className="border-b border-teal-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-stone-900">Set up your organizer profile</p>
            <p className="text-sm text-stone-500">Complete your details in one go to start listing trips</p>
          </div>
        </div>
      </div>

      <form onSubmit={finish} className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              A clear photo helps travelers recognize and trust you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              label="Profile picture"
              description="JPG or PNG, max 5 MB"
              accept="image/*"
              variant="image"
              aspectRatio="square"
              value={profilePicture}
              onChange={setProfilePicture}
              className="max-w-[160px] mx-auto"
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Your name and where you&apos;re based.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  className="mt-1.5"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  className="mt-1.5"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>How travelers and VaybeEx can reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5 bg-stone-50"
                value={form.email}
                readOnly
              />
              <p className="text-xs text-stone-400 mt-1">Verified during sign-up</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1.5"
                  placeholder="+233 XX XXX XXXX"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  className="mt-1.5"
                  placeholder="Same as phone or different"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About your trips</CardTitle>
            <CardDescription>Share your brand and the experiences you create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business or brand name</Label>
              <Input
                id="businessName"
                className="mt-1.5"
                placeholder="How travelers will know you"
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">About you</Label>
              <Textarea
                id="bio"
                className="mt-1.5 min-h-[100px]"
                placeholder="Tell travelers about your experience organizing trips..."
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="specialties">Trip specialties (optional)</Label>
              <Input
                id="specialties"
                className="mt-1.5"
                placeholder="e.g. Adventure, cultural tours, beach getaways"
                value={form.specialties}
                onChange={(e) => update("specialties", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Identity verification</CardTitle>
            <CardDescription>
              Upload a clear photo of the front of your national ID card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              label="National ID card"
              description="Photo of the front of your Ghana Card or national ID. JPG or PNG."
              accept="image/*"
              variant="image"
              aspectRatio="video"
              value={nationalId}
              onChange={setNationalId}
            />
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
          <Check className="h-4 w-4" />
          Complete setup
        </Button>
      </form>
    </div>
  );
}

export default function OrganizerOnboardingPage() {
  return (
    <RequireOrganizerAuth>
      <OnboardingFlow />
    </RequireOrganizerAuth>
  );
}

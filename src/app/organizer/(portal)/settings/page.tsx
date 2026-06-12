"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Lock, Save, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import { FileUploadZone } from "@/components/organizer/file-upload-zone";
import { PayoutAccountsSection } from "@/components/organizer/payout-accounts-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  defaultProfile,
  getOrganizerProfile,
  saveOrganizerProfile,
  type OrganizerProfile,
} from "@/lib/organizer-profile";

export default function OrganizerSettingsPage() {
  const { user, login } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl === "payouts" ||
    tabFromUrl === "profile" ||
    tabFromUrl === "account" ||
    tabFromUrl === "notifications"
      ? tabFromUrl
      : "profile"
  );
  const [profile, setProfile] = useState<OrganizerProfile>(defaultProfile);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setProfile(getOrganizerProfile());
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const updateProfile = <K extends keyof OrganizerProfile>(key: K, value: OrganizerProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: keyof OrganizerProfile["notifications"], checked: boolean) => {
    setProfile((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: checked },
    }));
  };

  const handleSaveProfile = () => {
    saveOrganizerProfile(profile);
    if (user) {
      login({ ...user, name: name.trim() || user.name });
    }
    toast.success("Profile updated");
  };

  const handleSaveNotifications = () => {
    saveOrganizerProfile(profile);
    toast.success("Notification preferences saved");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 mt-1">Manage your profile, payout accounts, and notifications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <Wallet className="h-4 w-4" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Lock className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Public profile</CardTitle>
              <CardDescription>
                This information appears on your organizer profile and trip listings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone
                label="Profile picture"
                description="JPG or PNG, max 5 MB"
                accept="image/*"
                variant="image"
                aspectRatio="square"
                value={profile.profilePicture}
                onChange={(url) => updateProfile("profilePicture", url)}
                className="max-w-[140px]"
              />

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    className="mt-1.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business or brand name</Label>
                  <Input
                    id="businessName"
                    className="mt-1.5"
                    value={profile.businessName}
                    onChange={(e) => updateProfile("businessName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  className="mt-1.5"
                  placeholder="City, Country"
                  value={profile.location}
                  onChange={(e) => updateProfile("location", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">About you</Label>
                <Textarea
                  id="bio"
                  className="mt-1.5 min-h-[100px]"
                  value={profile.bio}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="specialties">Trip specialties</Label>
                <Input
                  id="specialties"
                  className="mt-1.5"
                  placeholder="e.g. Adventure, cultural tours"
                  value={profile.specialties}
                  onChange={(e) => updateProfile("specialties", e.target.value)}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="mt-1.5"
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    className="mt-1.5"
                    value={profile.whatsapp}
                    onChange={(e) => updateProfile("whatsapp", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-1.5 bg-stone-50" value={email} readOnly />
                <p className="text-xs text-stone-400 mt-1">Contact support to change your login email</p>
              </div>

              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutAccountsSection />
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update the password you use to sign in with email.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="mt-1.5"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="mt-1.5"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="mt-1.5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit">Update password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email notifications</CardTitle>
              <CardDescription>Choose what we send to {email || "your email"}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={profile.notifications.bookingAlerts}
                  onCheckedChange={(checked) => updateNotification("bookingAlerts", checked === true)}
                />
                <div>
                  <p className="font-medium text-stone-900">Booking alerts</p>
                  <p className="text-sm text-stone-500">New bookings, cancellations, and payment updates</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={profile.notifications.payoutAlerts}
                  onCheckedChange={(checked) => updateNotification("payoutAlerts", checked === true)}
                />
                <div>
                  <p className="font-medium text-stone-900">Payout alerts</p>
                  <p className="text-sm text-stone-500">Withdrawal confirmations and payout summaries</p>
                </div>
              </label>

              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4" />
                Save preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

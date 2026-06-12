"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Mail, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getOrganizerTrips, getTripAttendees } from "@/lib/mock-data";
import type { TripAttendee } from "@/lib/types";

const ORGANIZER_ID = "org-1";

type AudienceGroup = "paid" | "partial" | "pending";

const audienceLabels: Record<AudienceGroup, string> = {
  paid: "Paid in full",
  partial: "Partial payment",
  pending: "Pending payment",
};

const audienceVariants: Record<AudienceGroup, "success" | "warning" | "secondary"> = {
  paid: "success",
  partial: "warning",
  pending: "secondary",
};

const myTrips = getOrganizerTrips(ORGANIZER_ID).filter((t) => t.booked > 0);

export default function CommunicationPage() {
  const searchParams = useSearchParams();
  const tripFromUrl = searchParams.get("trip");
  const defaultTrip =
    tripFromUrl && myTrips.some((t) => t.id === tripFromUrl)
      ? tripFromUrl
      : myTrips[0]?.id ?? "";

  const [message, setMessage] = useState("");
  const [tripId, setTripId] = useState(defaultTrip);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [audience, setAudience] = useState<AudienceGroup[]>(["paid", "partial", "pending"]);

  useEffect(() => {
    if (tripFromUrl && myTrips.some((t) => t.id === tripFromUrl)) {
      setTripId(tripFromUrl);
    }
  }, [tripFromUrl]);

  const attendees = tripId ? getTripAttendees(tripId) : [];

  const counts = useMemo(() => {
    return {
      paid: attendees.filter((a) => a.paymentStatus === "paid").length,
      partial: attendees.filter((a) => a.paymentStatus === "partial").length,
      pending: attendees.filter((a) => a.paymentStatus === "pending").length,
    };
  }, [attendees]);

  const recipients = useMemo(() => {
    return attendees.filter((a) => audience.includes(a.paymentStatus));
  }, [attendees, audience]);

  const allSelected = audience.length === 3;

  const toggleAudience = (group: AudienceGroup, checked: boolean) => {
    setAudience((prev) => {
      if (checked) return [...new Set([...prev, group])];
      return prev.filter((g) => g !== group);
    });
  };

  const toggleAll = (checked: boolean) => {
    setAudience(checked ? ["paid", "partial", "pending"] : []);
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    if (recipients.length === 0) {
      toast.error("Select at least one recipient group");
      return;
    }
    if (!email && !sms) {
      toast.error("Select at least one delivery channel");
      return;
    }

    const channels = [email && "email", sms && "SMS"].filter(Boolean).join(" & ");
    toast.success(`Message sent to ${recipients.length} member${recipients.length === 1 ? "" : "s"} via ${channels}`);
    setMessage("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Communication</h1>
        <p className="text-stone-500 mt-1">
          Send trip updates to paid, partial, or pending members — individually or in combination.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compose message</CardTitle>
          <CardDescription>
            Choose who receives your update based on their payment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Select trip</Label>
            <Select value={tripId} onValueChange={setTripId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a trip" />
              </SelectTrigger>
              <SelectContent>
                {myTrips.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title} ({t.booked} booked)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Send to</Label>
            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100">
              <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => toggleAll(!!c)}
                />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-stone-900">All members</span>
                  <span className="text-xs text-stone-500 tabular-nums">{attendees.length}</span>
                </div>
              </label>
              {(["paid", "partial", "pending"] as AudienceGroup[]).map((group) => (
                <label
                  key={group}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50"
                >
                  <Checkbox
                    checked={audience.includes(group)}
                    onCheckedChange={(c) => toggleAudience(group, !!c)}
                  />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-700">{audienceLabels[group]}</span>
                      <Badge variant={audienceVariants[group]} className="text-xs">
                        {group}
                      </Badge>
                    </div>
                    <span className="text-xs text-stone-500 tabular-nums">{counts[group]}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="rounded-xl bg-stone-50 p-3">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
              </p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {recipients.map((a: TripAttendee) => (
                  <li key={a.id} className="text-sm text-stone-600 flex items-center justify-between gap-2">
                    <span>{a.name}</span>
                    <Badge variant={audienceVariants[a.paymentStatus]} className="text-xs shrink-0">
                      {a.paymentStatus}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              className="mt-1.5 min-h-[140px]"
              placeholder="e.g. Partial payers — please complete your balance by Friday. Pending members — your spot is held for 48 hours..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Delivery channels</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="email" checked={email} onCheckedChange={(c) => setEmail(!!c)} />
              <Label htmlFor="email" className="font-normal flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sms" checked={sms} onCheckedChange={(c) => setSms(!!c)} />
              <Label htmlFor="sms" className="font-normal flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> SMS
              </Label>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSend}
            disabled={recipients.length === 0}
          >
            <Send className="h-4 w-4" />
            Send to {recipients.length} member{recipients.length === 1 ? "" : "s"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

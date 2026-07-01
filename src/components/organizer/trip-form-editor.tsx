"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  Shield,
  ImageIcon,
  Info,
  Plus,
  Trash2,
  Check,
  FileImage,
  Tag,
  Compass,
  Coins,
  ShieldCheck,
  Globe,
} from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUploadZone, GalleryUpload } from "@/components/organizer/file-upload-zone";
import {
  TRIP_CATEGORIES,
  TRIP_STATUS_OPTIONS,
  type Difficulty,
  type RefundPolicy,
  type TripForm,
} from "@/lib/trip-form-utils";
import { formatCurrency } from "@/lib/utils";
import type { TripCategory, TripStatus } from "@/lib/types";

interface TripFormEditorProps {
  mode: "create" | "edit";
  heading: string;
  subheading: string;
  initialForm: TripForm;
  initialAddOns: { name: string; price: string }[];
  onBack: () => void;
  onSave: (form: TripForm, addOns: { name: string; price: string }[], status: TripStatus) => void;
}


const STEP_DEFS = [
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "basics", label: "Basics", icon: Compass },
  { key: "details", label: "Details", icon: Tag },
  { key: "logistics", label: "Logistics", icon: MapPin },
  { key: "pricing", label: "Pricing", icon: Coins },
  { key: "policies", label: "Policies", icon: ShieldCheck },
  { key: "visibility", label: "Publish", icon: Globe },
] as const;

type StepKey = typeof STEP_DEFS[number]["key"];

export function TripFormEditor({
  mode,
  heading,
  subheading,
  initialForm,
  initialAddOns,
  onBack,
  onSave,
}: TripFormEditorProps) {
  const [form, setForm] = useState<TripForm>(initialForm);
  const [addOns, setAddOns] = useState(initialAddOns);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEP_DEFS[stepIndex].key as StepKey;

  const update = <K extends keyof TripForm>(field: K, value: TripForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addAddOn = () => setAddOns([...addOns, { name: "", price: "" }]);
  const removeAddOn = (i: number) => setAddOns(addOns.filter((_, idx) => idx !== i));
  const updateAddOn = (i: number, field: "name" | "price", value: string) =>
    setAddOns(addOns.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const completionChecks = [
    !!form.title,
    !!form.destination,
    !!form.category,
    !!form.startDate && !!form.endDate,
    !!form.coverImage,
    !!form.price,
    !!form.departurePoint,
  ];
  const completionPct = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const handleSave = (status: TripStatus) => {
    onSave({ ...form, status }, addOns, status);
  };

  /* ── Per-step completeness, used to mark rail dots done ── */
  const stepComplete: Record<StepKey, boolean> = {
    media: !!form.coverImage,
    basics: !!form.title && !!form.destination && !!form.category,
    details: !!form.description,
    logistics: !!form.departurePoint,
    pricing: !!form.price,
    policies: !!form.refundPolicy,
    visibility: !!form.status,
  };

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEP_DEFS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEP_DEFS.length - 1;

  /* ════════════════════════════════════════════════════════════
     GSAP — step content slides/fades in on every step change,
     scoped to a ref so old tweens never leak across steps.
  ════════════════════════════════════════════════════════════ */
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stepContentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
      gsap.fromTo(
        ".step-field-group",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06, delay: 0.05 }
      );
    });
    // Scroll the step panel into a comfortable position on change,
    // so navigating steps on a long form doesn't leave the user
    // looking at a half-scrolled middle of the previous step.
    stepContentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    return () => ctx.revert();
  }, [stepIndex]);

  return (
    <div className="max-w-6xl p-6 lg:p-8" style={{ background: "var(--bg)" }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-3"
            style={{ color: "var(--text-tertiary)" }}
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </Button>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>{heading}</h1>
          <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--text-secondary)" }}>{subheading}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Form completion</p>
            <p className="font-display text-sm font-semibold" style={{ color: "var(--primary)" }}>{completionPct}%</p>
          </div>
          <div
            className="relative flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(var(--primary) ${completionPct * 3.6}deg, var(--border) 0deg)` }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "var(--surface)", color: "var(--primary)" }}
            >
              {completionPct}%
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STEPPER RAIL — replaces TabsList. Horizontally scrollable
          on mobile, full row on desktop. Click any step to jump
          directly (form data is preserved across steps either way,
          so free navigation is safe — unlike a checkout flow where
          you'd lock it).
      ══════════════════════════════════════════════════════════ */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1 sm:min-w-0 sm:gap-0">
          {STEP_DEFS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === stepIndex;
            const isDone = stepComplete[step.key as StepKey] && i !== stepIndex;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStepIndex(i)}
                  className="flex flex-col items-center gap-1.5 px-1"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all"
                    style={{
                      borderColor: isActive ? "var(--primary)" : isDone ? "var(--gold)" : "var(--border)",
                      background: isActive ? "var(--gradient-brand)" : isDone ? "var(--gold-dim)" : "var(--surface)",
                      color: isActive ? "#fbf7f1" : isDone ? "var(--gold)" : "var(--text-tertiary)",
                    }}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className="whitespace-nowrap text-[11px] font-medium"
                    style={{ color: isActive ? "var(--text)" : "var(--text-tertiary)" }}
                  >
                    {step.label}
                  </span>
                </button>
                {i < STEP_DEFS.length - 1 && (
                  <div
                    className="mx-1.5 h-0.5 w-6 shrink-0 sm:w-10"
                    style={{ background: i < stepIndex ? "var(--gold)" : "var(--border)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div ref={stepContentRef}>
            {/* ── MEDIA ───────────────────────────────────────── */}
            {currentStep === "media" && (
              <div className="space-y-6">
                <StepCard
                  icon={ImageIcon}
                  title="Cover Image"
                  desc="This is the main photo shown on trip cards and the detail page hero. Use a high-quality landscape photo."
                >
                  <FileUploadZone
                    label=""
                    description="Recommended 1600×900 px · JPG or PNG · Max 5 MB"
                    value={form.coverImage}
                    onChange={(url) => update("coverImage", url)}
                    aspectRatio="video"
                  />
                </StepCard>

                <StepCard icon={FileImage} title="Gallery Photos" desc="Add extra photos to showcase the experience, accommodation, and scenery.">
                  <GalleryUpload images={form.gallery} onChange={(imgs) => update("gallery", imgs)} />
                </StepCard>

                <StepCard icon={FileImage} title="Trip Flyer / Brochure" desc="Upload a PDF or image flyer travelers can download or share.">
                  <FileUploadZone
                    label=""
                    description="PDF, JPG, or PNG · Max 10 MB"
                    accept="image/*,.pdf,application/pdf"
                    variant="document"
                    aspectRatio="square"
                    value={form.flyer}
                    onChange={(url) => update("flyer", url)}
                  />
                </StepCard>
              </div>
            )}

            {/* ── BASICS ──────────────────────────────────────── */}
            {currentStep === "basics" && (
              <StepCard icon={Compass} title="Trip Basics">
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Trip Title</Label>
                  <ThemedInput className="mt-1.5" placeholder="e.g. Volta Region Waterfall Trek" value={form.title} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Destination</Label>
                    <ThemedInput className="mt-1.5" placeholder="e.g. Volta Region" value={form.destination} onChange={(e) => update("destination", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Category</Label>
                    <Select value={form.category} onValueChange={(v) => update("category", v as TripCategory)}>
                      <SelectTrigger className="mt-1.5 rounded-xl" style={{ borderColor: "var(--border-strong)" }}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIP_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Start Date</Label>
                    <ThemedInput type="date" className="mt-1.5" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>End Date</Label>
                    <ThemedInput type="date" className="mt-1.5" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
                  </div>
                </div>
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Tags (comma-separated)</Label>
                  <ThemedInput className="mt-1.5" placeholder="e.g. hiking, waterfalls, weekend getaway" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Organizer Contact Phone</Label>
                    <ThemedInput className="mt-1.5" placeholder="+233 XX XXX XXXX" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Organizer Contact Email</Label>
                    <ThemedInput type="email" className="mt-1.5" placeholder="you@example.com" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── DETAILS ─────────────────────────────────────── */}
            {currentStep === "details" && (
              <StepCard icon={Tag} title="Trip Details">
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Description</Label>
                  <ThemedTextarea className="mt-1.5 min-h-[120px]" placeholder="Describe the experience, what makes it special..." value={form.description} onChange={(e) => update("description", e.target.value)} />
                </div>
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Highlights (one per line)</Label>
                  <ThemedTextarea className="mt-1.5" placeholder={"Visit Wli Falls — Ghana's tallest waterfall\nTraditional Ewe village tour\nSunset at Afadjato peak"} value={form.highlights} onChange={(e) => update("highlights", e.target.value)} />
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>What&apos;s Included (one per line)</Label>
                    <ThemedTextarea className="mt-1.5" placeholder={"Professional guide\nAll meals\nTransport"} value={form.included} onChange={(e) => update("included", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>What&apos;s Excluded (one per line)</Label>
                    <ThemedTextarea className="mt-1.5" placeholder={"Personal gear\nTips\nTravel insurance"} value={form.excluded} onChange={(e) => update("excluded", e.target.value)} />
                  </div>
                </div>
                <Separator className="step-field-group" style={{ background: "var(--border)" }} />
                <div className="step-field-group grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v as Difficulty)}>
                      <SelectTrigger className="mt-1.5 rounded-xl" style={{ borderColor: "var(--border-strong)" }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy — suitable for beginners</SelectItem>
                        <SelectItem value="moderate">Moderate — some fitness required</SelectItem>
                        <SelectItem value="challenging">Challenging — experienced travelers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Min Age</Label>
                    <ThemedInput type="number" className="mt-1.5" placeholder="18" value={form.ageMin} onChange={(e) => update("ageMin", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Max Age (optional)</Label>
                    <ThemedInput type="number" className="mt-1.5" placeholder="65" value={form.ageMax} onChange={(e) => update("ageMax", e.target.value)} />
                  </div>
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Min Capacity</Label>
                    <ThemedInput type="number" className="mt-1.5" placeholder="8" value={form.minCapacity} onChange={(e) => update("minCapacity", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Max Capacity</Label>
                    <ThemedInput type="number" className="mt-1.5" placeholder="16" value={form.maxCapacity} onChange={(e) => update("maxCapacity", e.target.value)} />
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── LOGISTICS ───────────────────────────────────── */}
            {currentStep === "logistics" && (
              <StepCard icon={MapPin} title="Departure & Meeting Points" desc="Where travelers should meet and when the trip starts and ends.">
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Departure Point</Label>
                  <ThemedInput className="mt-1.5" placeholder="e.g. Accra Mall, Tema Station" value={form.departurePoint} onChange={(e) => update("departurePoint", e.target.value)} />
                </div>
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Meeting Point Details</Label>
                  <ThemedTextarea className="mt-1.5" placeholder="Exact location, landmarks, parking info..." value={form.meetingPoint} onChange={(e) => update("meetingPoint", e.target.value)} />
                </div>
                <div className="step-field-group grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label style={{ color: "var(--text)" }}>Departure Time</Label>
                    <ThemedInput type="time" className="mt-1.5" value={form.departureTime} onChange={(e) => update("departureTime", e.target.value)} />
                  </div>
                  <div>
                    <Label style={{ color: "var(--text)" }}>Expected Return Time</Label>
                    <ThemedInput type="time" className="mt-1.5" value={form.returnTime} onChange={(e) => update("returnTime", e.target.value)} />
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── PRICING ─────────────────────────────────────── */}
            {currentStep === "pricing" && (
              <div className="space-y-6">
                <StepCard icon={Coins} title="Pricing & Deposits">
                  <div className="step-field-group grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label style={{ color: "var(--text)" }}>Price per Person (GHS)</Label>
                      <ThemedInput type="number" className="mt-1.5" placeholder="1850" value={form.price} onChange={(e) => update("price", e.target.value)} />
                    </div>
                    <div>
                      <Label style={{ color: "var(--text)" }}>Deposit Amount (GHS)</Label>
                      <ThemedInput type="number" className="mt-1.5" placeholder="500" value={form.depositAmount} onChange={(e) => update("depositAmount", e.target.value)} />
                    </div>
                  </div>
                  <div className="step-field-group">
                    <Label style={{ color: "var(--text)" }}>Deposit Due</Label>
                    <Select value={form.depositRules} onValueChange={(v) => update("depositRules", v)}>
                      <SelectTrigger className="mt-1.5 rounded-xl" style={{ borderColor: "var(--border-strong)" }}>
                        <SelectValue placeholder="When is deposit due?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Due at booking</SelectItem>
                        <SelectItem value="7days">Due 7 days before departure</SelectItem>
                        <SelectItem value="14days">Due 14 days before departure</SelectItem>
                        <SelectItem value="30days">Due 30 days before departure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="step-field-group" style={{ background: "var(--border)" }} />
                  <div className="step-field-group">
                    <p className="mb-3 text-sm font-medium" style={{ color: "var(--text)" }}>Early Bird Pricing (optional)</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label style={{ color: "var(--text)" }}>Early Bird Price (GHS)</Label>
                        <ThemedInput type="number" className="mt-1.5" placeholder="1650" value={form.earlyBirdPrice} onChange={(e) => update("earlyBirdPrice", e.target.value)} />
                      </div>
                      <div>
                        <Label style={{ color: "var(--text)" }}>Early Bird Deadline</Label>
                        <ThemedInput type="date" className="mt-1.5" value={form.earlyBirdDeadline} onChange={(e) => update("earlyBirdDeadline", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </StepCard>

                <StepCard icon={Plus} title="Optional Add-ons" desc="Extra services travelers can purchase during booking.">
                  <div className="step-field-group space-y-3">
                    {addOns.map((addon, i) => (
                      <div key={i} className="flex items-end gap-3">
                        <div className="flex-1">
                          <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>Add-on name</Label>
                          <ThemedInput className="mt-1" placeholder="e.g. Travel insurance" value={addon.name} onChange={(e) => updateAddOn(i, "name", e.target.value)} />
                        </div>
                        <div className="w-28">
                          <Label className="text-xs" style={{ color: "var(--text-secondary)" }}>Price (GHS)</Label>
                          <ThemedInput type="number" className="mt-1" placeholder="150" value={addon.price} onChange={(e) => updateAddOn(i, "price", e.target.value)} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAddOn(i)}>
                          <Trash2 className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAddOn}
                      className="rounded-xl"
                      style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                    >
                      <Plus className="h-4 w-4" /> Add add-on
                    </Button>
                  </div>
                </StepCard>
              </div>
            )}

            {/* ── POLICIES ────────────────────────────────────── */}
            {currentStep === "policies" && (
              <StepCard icon={Shield} title="Refund & Cancellation Policy" desc="Set clear expectations for travelers about cancellations and refunds.">
                <div className="step-field-group">
                  <RadioGroup value={form.refundPolicy} onValueChange={(v) => update("refundPolicy", v as RefundPolicy)}>
                    <div className="space-y-3">
                      {[
                        { value: "full", label: "Fully Refundable", desc: "Full refund if cancelled before the deadline" },
                        { value: "partial", label: "Partially Refundable", desc: "Partial refund based on how far in advance they cancel" },
                        { value: "none", label: "Non-Refundable", desc: "No refunds after booking confirmation" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                          style={{
                            borderColor: form.refundPolicy === opt.value ? "var(--primary)" : "var(--border)",
                            background: form.refundPolicy === opt.value ? "var(--primary-dim)" : "transparent",
                          }}
                        >
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{opt.label}</p>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {form.refundPolicy !== "none" && (
                  <div className="step-field-group grid gap-4 pt-2 sm:grid-cols-2">
                    <div>
                      <Label style={{ color: "var(--text)" }}>Cancellation Deadline (days before departure)</Label>
                      <ThemedInput type="number" className="mt-1.5" placeholder="14" value={form.refundDeadlineDays} onChange={(e) => update("refundDeadlineDays", e.target.value)} />
                    </div>
                    {form.refundPolicy === "partial" && (
                      <div>
                        <Label style={{ color: "var(--text)" }}>Refund Percentage (%)</Label>
                        <ThemedInput type="number" className="mt-1.5" placeholder="50" min="0" max="100" value={form.refundPercentage} onChange={(e) => update("refundPercentage", e.target.value)} />
                      </div>
                    )}
                  </div>
                )}

                <div className="step-field-group flex gap-3 rounded-xl p-4" style={{ background: "var(--bg-secondary)" }}>
                  <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {form.refundPolicy === "full" && form.refundDeadlineDays
                      ? `Travelers can cancel up to ${form.refundDeadlineDays} days before departure for a full refund.`
                      : form.refundPolicy === "partial" && form.refundDeadlineDays
                      ? `Travelers can cancel up to ${form.refundDeadlineDays} days before departure and receive a ${form.refundPercentage || "0"}% refund.`
                      : form.refundPolicy === "none"
                      ? "This trip is non-refundable. Travelers will be notified during booking."
                      : "Configure your refund policy above."}
                  </p>
                </div>
              </StepCard>
            )}

            {/* ── VISIBILITY ──────────────────────────────────── */}
            {currentStep === "visibility" && (
              <StepCard icon={Globe} title="Publish Settings">
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Publish Status</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v as TripStatus)}>
                    <SelectTrigger className="mt-1.5 rounded-xl" style={{ borderColor: "var(--border-strong)" }}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIP_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="step-field-group">
                  <Label style={{ color: "var(--text)" }}>Visibility</Label>
                  <Select value={form.visibility} onValueChange={(v) => update("visibility", v)}>
                    <SelectTrigger className="mt-1.5 rounded-xl" style={{ borderColor: "var(--border-strong)" }}>
                      <SelectValue placeholder="Who can see this trip?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public — everyone</SelectItem>
                      <SelectItem value="unlisted">Unlisted — link only</SelectItem>
                      <SelectItem value="private">Private — invite only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="step-field-group flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
                  <Checkbox id={`trip-confirm-${mode}`} />
                  <label htmlFor={`trip-confirm-${mode}`} className="cursor-pointer text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>
                    I confirm all trip details, pricing, and policies are accurate and I have the right to use all uploaded media.
                  </label>
                </div>
              </StepCard>
            )}
          </div>

          {/* ── Step navigation + final save actions ──────────── */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isFirst}
              className="rounded-xl"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {!isLast ? (
              <Button
                type="button"
                onClick={goNext}
                className="rounded-xl"
                style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
              >
                Next: {STEP_DEFS[stepIndex + 1].label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-wrap gap-3">
                {mode === "edit" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleSave("draft")}
                      className="rounded-xl"
                      style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleSave(form.status)}
                      className="rounded-xl"
                      style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleSave("draft")}
                      className="rounded-xl"
                      style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleSave("scheduled")}
                      className="rounded-xl"
                      style={{ background: "var(--bg-secondary)", color: "var(--text)" }}
                    >
                      Schedule
                    </Button>
                    <Button
                      onClick={() => handleSave("live")}
                      className="rounded-xl"
                      style={{ background: "var(--gradient-brand)", color: "#fbf7f1", boxShadow: "var(--glow-gold)" }}
                    >
                      Publish Live
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Live Preview Sidebar ──────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Live Preview
            </p>
            <Card className="overflow-hidden border shadow-none" style={{ borderColor: "var(--border)" }}>
              <div className="relative aspect-[16/10]" style={{ background: "var(--bg-secondary)" }}>
                {form.coverImage ? (
                  <Image src={form.coverImage} alt="Cover preview" fill unoptimized className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
                    <ImageIcon className="mb-2 h-8 w-8" />
                    <span className="text-xs">Cover image preview</span>
                  </div>
                )}
                {form.category && (
                  <Badge className="absolute left-3 top-3 capitalize" style={{ background: "var(--gradient-brand)", color: "#fbf7f1", border: "none" }}>
                    {form.category}
                  </Badge>
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <h3 className="line-clamp-2 font-display font-bold" style={{ color: "var(--text)" }}>
                  {form.title || "Your Trip Title"}
                </h3>
                {form.destination && (
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="h-3.5 w-3.5" /> {form.destination}
                  </p>
                )}
                {(form.startDate || form.endDate) && (
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Calendar className="h-3.5 w-3.5" />
                    {form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : form.startDate || form.endDate}
                  </p>
                )}
                {form.departurePoint && (
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Clock className="h-3.5 w-3.5" />
                    Departs {form.departurePoint}
                    {form.departureTime && ` at ${form.departureTime}`}
                  </p>
                )}
                {(form.minCapacity || form.maxCapacity) && (
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Users className="h-3.5 w-3.5" />
                    {form.minCapacity && form.maxCapacity
                      ? `${form.minCapacity}–${form.maxCapacity} travelers`
                      : form.maxCapacity
                      ? `Up to ${form.maxCapacity} travelers`
                      : `Min ${form.minCapacity} travelers`}
                  </p>
                )}
                <Separator style={{ background: "var(--border)" }} />
                <div className="flex items-end justify-between">
                  <div>
                    {form.earlyBirdPrice && (
                      <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        Early bird {formatCurrency(Number(form.earlyBirdPrice))}
                      </p>
                    )}
                    <p className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
                      {form.price ? formatCurrency(Number(form.price)) : "—"}
                      <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}> / person</span>
                    </p>
                  </div>
                  {form.refundPolicy && (
                    <Badge
                      className="text-xs"
                      style={
                        form.refundPolicy === "none"
                          ? { background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "none" }
                          : { background: "var(--gold-dim)", color: "var(--gold)", border: "none" }
                      }
                    >
                      {form.refundPolicy === "full" ? "Refundable" : form.refundPolicy === "partial" ? "Partial refund" : "Non-refundable"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {form.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {form.gallery.slice(0, 3).map((img) => (
                  <div key={img} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={img} alt="" fill unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small themed wrappers so every Input/Textarea in the steps above
   doesn't need to repeat the same borderColor inline style ── */
function ThemedInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={`rounded-xl ${props.className ?? ""}`} style={{ borderColor: "var(--border-strong)", ...props.style }} />;
}
function ThemedTextarea(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} className={`rounded-xl ${props.className ?? ""}`} style={{ borderColor: "var(--border-strong)", ...props.style }} />;
}

/* ── Step card wrapper — replaces the old bare <Card><CardHeader>
   repetition with one themed shell taking an icon + title + optional
   description, used identically across every step. ── */
function StepCard({
  icon: Icon, title, desc, children,
}: { icon: typeof ImageIcon; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card className="border shadow-none" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base" style={{ color: "var(--text)" }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--primary-dim)" }}>
            <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
          {title}
        </CardTitle>
        {desc && <CardDescription style={{ color: "var(--text-secondary)" }}>{desc}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Info,
  Plus,
  Trash2,
  Check,
  User,
  Users,
  Heart,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GalleryUpload } from "@/components/organizer/file-upload-zone";
import {
  TRIP_CATEGORIES,
  type TripForm,
  type TripFormItineraryDay,
} from "@/lib/trip-form-utils";
import { tripTypeLabel } from "@/lib/format";
import {
  getOrganizerBrandSlug,
  getRootDomain,
  sanitizeSlugInput,
  tripPathSlug,
} from "@/lib/tenant";
import type { TripStatus } from "@/lib/types";
import type { CreateTripFiles } from "@/lib/api/organizer-trips";
import {
  getOrganizerMe,
  getOrganizerProfileOptions,
  syncOrganizerProfileCache,
  type TripSpecialtyOption,
} from "@/lib/api/organizer-profile";
import { getOrganizerProfile } from "@/lib/organizer-profile";

const FALLBACK_CATEGORIES: TripSpecialtyOption[] = TRIP_CATEGORIES.map((value) => ({
  value,
  label: tripTypeLabel[value] ?? value.charAt(0).toUpperCase() + value.slice(1),
}));

interface TripFormEditorProps {
  mode: "create" | "edit";
  heading: string;
  subheading: string;
  initialForm: TripForm;
  initialAddOns: { name: string; price: string }[];
  onBack: () => void;
  isSaving?: boolean;
  onSave: (
    form: TripForm,
    addOns: { name: string; price: string }[],
    status: TripStatus,
    files: CreateTripFiles
  ) => void | Promise<void>;
}

const STEP_DEFS = [
  {
    key: "basics",
    label: "Basics",
    desc: "Title, place, dates, photo",
  },
  {
    key: "experience",
    label: "Experience",
    desc: "Highlights, inclusions, itinerary",
  },
  {
    key: "booking",
    label: "Pricing",
    desc: "Seats, price, refund policy",
  },
  {
    key: "logistics",
    label: "Meetup",
    desc: "Pickup, times, gallery",
  },
] as const;

type StepKey = (typeof STEP_DEFS)[number]["key"];

export function TripFormEditor({
  mode,
  heading,
  subheading,
  initialForm,
  initialAddOns,
  onBack,
  onSave,
  isSaving = false,
}: TripFormEditorProps) {
  const [form, setForm] = useState<TripForm>(initialForm);
  const [addOns, setAddOns] = useState(initialAddOns);
  const [stepIndex, setStepIndex] = useState(0);
  const [categories, setCategories] = useState<TripSpecialtyOption[]>(FALLBACK_CATEGORIES);
  const [slugTouched, setSlugTouched] = useState(
    () => Boolean(initialForm.slug.trim()) && mode === "edit"
  );
  const [brandLabel, setBrandLabel] = useState("organizer");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const currentStep = STEP_DEFS[stepIndex].key;

  useEffect(() => {
    let cancelled = false;

    const applyBrand = (input: {
      brandSlug?: string;
      businessName?: string;
      organizerName?: string;
    }) => {
      if (cancelled) return;
      setBrandLabel(getOrganizerBrandSlug(input));
    };

    // Prefer cached profile immediately, then refresh from /me.
    const profile = getOrganizerProfile();
    applyBrand({
      brandSlug: profile.brandSlug,
      businessName: profile.businessName,
    });

    getOrganizerMe()
      .then((response) => {
        if (cancelled || !response.data) return;
        syncOrganizerProfileCache(response.data);
        applyBrand({
          brandSlug: response.data.brandSlug,
          businessName: response.data.businessName,
          organizerName: response.data.fullName,
        });
      })
      .catch(() => {
        /* keep cache / fallback */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getOrganizerProfileOptions()
      .then((response) => {
        const options = response.data?.tripSpecialties;
        if (!cancelled && options?.length) setCategories(options);
      })
      .catch(() => {
        /* keep hardcoded fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rootDomain = getRootDomain();
  const urlProtocol = rootDomain.includes("localhost") ? "http" : "https";
  const urlPrefix = `${urlProtocol}://${brandLabel}.${rootDomain}/`;

  const update = <K extends keyof TripForm>(field: K, value: TripForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addAddOn = () => setAddOns([...addOns, { name: "", price: "" }]);
  const removeAddOn = (i: number) => setAddOns(addOns.filter((_, idx) => idx !== i));
  const updateAddOn = (i: number, field: "name" | "price", value: string) =>
    setAddOns(addOns.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const updateItineraryDay = (
    index: number,
    field: keyof TripFormItineraryDay,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

  const addItineraryDay = () => {
    setForm((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: "", activities: "" },
      ],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((day, i) => ({ ...day, day: i + 1 })),
    }));
  };

  const onCoverSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover photo must be under 5 MB.");
      return;
    }
    setCoverFile(file);
    update("coverImage", URL.createObjectURL(file));
  };

  const stepComplete: Record<StepKey, boolean> = {
    basics:
      !!form.title.trim() &&
      !!form.destination.trim() &&
      !!form.category &&
      !!form.startDate &&
      !!form.endDate &&
      !!form.description.trim() &&
      (!!form.coverImage || mode === "edit"),
    experience:
      !!form.included.trim() &&
      form.itinerary.some((d) => d.title.trim() || d.activities.trim()),
    booking: !!form.price,
    logistics: !!form.meetingPoint.trim() || !!form.departurePoint.trim(),
  };

  const requiredComplete =
    stepComplete.basics && stepComplete.experience && stepComplete.booking;

  const handleSave = async (status: TripStatus) => {
    if (!requiredComplete) {
      toast.error("Fill basics, experience, and pricing before publishing.");
      const firstIncomplete = STEP_DEFS.findIndex((s) => !stepComplete[s.key]);
      if (firstIncomplete >= 0) setStepIndex(firstIncomplete);
      return;
    }
    if (mode === "create" && !coverFile && !form.coverImage) {
      toast.error("Add a cover photo before saving.");
      setStepIndex(0);
      return;
    }
    await onSave({ ...form, status }, addOns, status, {
      coverImage: coverFile,
      gallery: galleryFiles,
    });
  };

  const goNext = () => {
    const key = STEP_DEFS[stepIndex].key;
    if (!stepComplete[key] && key !== "logistics") {
      toast.error("Complete the required fields on this step to continue.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEP_DEFS.length - 1));
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEP_DEFS.length - 1;

  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stepContentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [stepIndex]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      <div className="mb-6">
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
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>
          {heading}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {subheading}
        </p>
      </div>

      {/* Step cards — reference: numbered boxes with title + subtitle */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEP_DEFS.map((step, i) => {
          const isActive = i === stepIndex;
          const isDone = stepComplete[step.key] && !isActive;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setStepIndex(i)}
              className="flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all"
              style={{
                borderColor: isActive
                  ? "var(--primary)"
                  : isDone
                    ? "rgba(196,134,76,0.45)"
                    : "var(--border)",
                background: isActive
                  ? "var(--primary-dim)"
                  : isDone
                    ? "var(--gold-dim)"
                    : "var(--surface)",
                boxShadow: isActive ? "0 0 0 1px var(--primary)" : "none",
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: isActive
                    ? "var(--primary)"
                    : isDone
                      ? "var(--gold)"
                      : "var(--bg-secondary)",
                  color: isActive || isDone ? "#fbf7f1" : "var(--text-tertiary)",
                }}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 pt-0.5">
                <span
                  className="block text-sm font-semibold leading-tight"
                  style={{ color: isActive ? "var(--primary)" : "var(--text)" }}
                >
                  {step.label}
                </span>
                <span
                  className="mt-0.5 block text-[11px] leading-snug"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {step.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div ref={stepContentRef} className="space-y-4">
        {currentStep === "basics" && (
          <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-start">
            <FormCard title="Cover photo">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
                style={{
                  borderColor: form.coverImage
                    ? "var(--primary)"
                    : "var(--border-strong)",
                  background: form.coverImage
                    ? "var(--surface)"
                    : "var(--bg-secondary)",
                }}
                aria-label={form.coverImage ? "Change cover photo" : "Choose cover photo"}
              >
                {form.coverImage ? (
                  <Image
                    src={form.coverImage}
                    alt="Cover preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ background: "var(--primary-dim)" }}
                    >
                      <Camera className="h-6 w-6" style={{ color: "var(--primary)" }} />
                    </div>
                    <span
                      className="mt-3 text-xs font-medium"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      No cover uploaded
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="mt-3 w-full rounded-lg px-3.5 py-2.5 text-sm font-semibold"
                style={{
                  background: "var(--gradient-brand)",
                  color: "#fbf7f1",
                }}
              >
                {form.coverImage ? "Change photo" : "Upload cover"}
              </button>
              {form.coverImage && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    update("coverImage", null);
                  }}
                  className="mt-2 w-full text-center text-xs font-medium"
                  style={{ color: "var(--coral)" }}
                >
                  Remove
                </button>
              )}
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                Portrait JPG or PNG · max 5 MB
              </p>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  onCoverSelected(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </FormCard>

            <FormCard title="Trip details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Trip title" required className="sm:col-span-2">
                  <FieldInput
                    placeholder="e.g. Cape Coast heritage weekend"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug: slugTouched ? prev.slug : tripPathSlug(title),
                      }));
                    }}
                  />
                </Field>
                <Field label="Public link" className="sm:col-span-2">
                  <div
                    className="flex overflow-hidden rounded-lg border"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <span
                      className="hidden max-w-[55%] shrink-0 truncate border-r px-3 py-2.5 text-xs sm:inline-flex sm:items-center"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-tertiary)",
                        background: "var(--bg-secondary)",
                      }}
                      title={urlPrefix}
                    >
                      {urlPrefix}
                    </span>
                    <span
                      className="inline-flex shrink-0 items-center border-r px-2.5 py-2.5 text-xs sm:hidden"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-tertiary)",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      /
                    </span>
                    <input
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        update("slug", sanitizeSlugInput(e.target.value));
                      }}
                      onBlur={() => {
                        const next = tripPathSlug(form.slug || form.title);
                        update("slug", next);
                      }}
                      placeholder="your-trip-name"
                      spellCheck={false}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm outline-none"
                      style={{ color: "var(--text)" }}
                      aria-label="Trip URL slug"
                    />
                  </div>
                  <p className="mt-1.5 text-xs sm:hidden" style={{ color: "var(--text-tertiary)" }}>
                    {urlPrefix}
                    <span style={{ color: "var(--text)" }}>{form.slug || "…"}</span>
                  </p>
                  <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Travelers open this link. Edit the last part anytime — brand stays locked to your name.
                  </p>
                </Field>
                <Field label="Destination" required>
                  <FieldInput
                    placeholder="e.g. Cape Coast"
                    value={form.destination}
                    onChange={(e) => update("destination", e.target.value)}
                  />
                </Field>
                <Field label="Category" required>
                  <Select
                    value={form.category}
                    onValueChange={(v) => update("category", v)}
                  >
                    <SelectTrigger className="h-10 rounded-lg" style={fieldStyle}>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Start date" required>
                  <FieldInput
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </Field>
                <Field label="End date" required>
                  <FieldInput
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                  />
                </Field>
                <Field label="Short description" required className="sm:col-span-2">
                  <FieldTextarea
                    placeholder="What makes this trip worth joining?"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                  />
                </Field>
              </div>
            </FormCard>
          </div>
        )}

        {currentStep === "experience" && (
          <>
            <FormCard title="What travelers get">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Highlights (one per line)" className="sm:col-span-2">
                  <FieldTextarea
                    placeholder={"Castle tour\nVillage lunch\nBeach sunset"}
                    value={form.highlights}
                    onChange={(e) => update("highlights", e.target.value)}
                    rows={3}
                  />
                </Field>
                <Field label="What's included" required>
                  <FieldTextarea
                    placeholder={"Transport\nGuide\nMeals"}
                    value={form.included}
                    onChange={(e) => update("included", e.target.value)}
                    rows={4}
                  />
                </Field>
                <Field label="What's not included">
                  <FieldTextarea
                    placeholder={"Insurance\nTips"}
                    value={form.excluded}
                    onChange={(e) => update("excluded", e.target.value)}
                    rows={4}
                  />
                </Field>
              </div>
            </FormCard>

            <FormCard
              title="Day-by-day itinerary"
              action={
                <button
                  type="button"
                  onClick={addItineraryDay}
                  className="inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: "var(--border-strong)",
                    background: "var(--bg)",
                    color: "var(--primary)",
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add day
                </button>
              }
            >
              <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                Map each day of the trip so travelers know exactly what to expect.
              </p>
              <div className="relative space-y-0">
                {form.itinerary.map((day, index) => {
                  const isLast = index === form.itinerary.length - 1;
                  return (
                    <div key={day.day} className="relative flex gap-4">
                      {/* Timeline rail */}
                      <div className="flex w-9 shrink-0 flex-col items-center">
                        <div
                          className="z-[1] flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: "var(--primary)",
                            color: "#fbf7f1",
                            boxShadow: "0 0 0 4px var(--surface)",
                          }}
                        >
                          {index + 1}
                        </div>
                        {!isLast && (
                          <div
                            className="my-1 w-px flex-1 min-h-[20px]"
                            style={{ background: "var(--border-strong)" }}
                          />
                        )}
                      </div>

                      {/* Day content */}
                      <div
                        className={`min-w-0 flex-1 rounded-xl border p-4 ${isLast ? "" : "mb-4"}`}
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--bg)",
                        }}
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.14em]"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            Day {index + 1}
                          </p>
                          {form.itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItineraryDay(index)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                              style={{ color: "var(--coral)" }}
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Field label="Day title">
                            <FieldInput
                              placeholder="e.g. Arrival & castle tour"
                              value={day.title}
                              onChange={(e) =>
                                updateItineraryDay(index, "title", e.target.value)
                              }
                            />
                          </Field>
                          <Field label="Activities (one per line)">
                            <FieldTextarea
                              placeholder={"Morning activity\nAfternoon activity"}
                              value={day.activities}
                              onChange={(e) =>
                                updateItineraryDay(index, "activities", e.target.value)
                              }
                              rows={3}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormCard>
          </>
        )}

        {currentStep === "booking" && (
          <>
            <FormCard title="Group size & price">
              <p className="mb-5 text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                Max travelers is optional — leave it empty for unlimited seats. Then choose which rates you offer.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Max travelers">
                  <FieldInput
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={form.maxCapacity}
                    onChange={(e) => update("maxCapacity", e.target.value)}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Optional. Leave blank for unlimited seats.
                  </p>
                </Field>
                <Field label="Initial Deposit (GHS)">
                  <FieldInput
                    type="number"
                    placeholder="Optional"
                    value={form.depositAmount}
                    onChange={(e) => update("depositAmount", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                {/* Person — always on */}
                <div
                  className="flex flex-col rounded-xl border p-4"
                  style={{
                    borderColor: "var(--primary)",
                    background: "var(--primary-dim)",
                  }}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: "var(--primary)" }}
                      >
                        <User className="h-4 w-4" style={{ color: "#fbf7f1" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          Per person
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Required
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: "var(--primary)", color: "#fbf7f1" }}
                    >
                      On
                    </span>
                  </div>
                  <Field label="Price (GHS)">
                    <FieldInput
                      type="number"
                      placeholder="850"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Couple */}
                <div
                  className="flex flex-col rounded-xl border p-4 transition-colors"
                  style={{
                    borderColor: form.offerCouplePrice
                      ? "var(--primary)"
                      : "var(--border)",
                    background: form.offerCouplePrice
                      ? "var(--primary-dim)"
                      : "var(--bg)",
                  }}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{
                          background: form.offerCouplePrice
                            ? "var(--primary)"
                            : "var(--bg-secondary)",
                        }}
                      >
                        <Heart
                          className="h-4 w-4"
                          style={{
                            color: form.offerCouplePrice
                              ? "#fbf7f1"
                              : "var(--text-tertiary)",
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          Couple
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Rate for 2
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.offerCouplePrice}
                      onClick={() => {
                        const next = !form.offerCouplePrice;
                        update("offerCouplePrice", next);
                        if (!next) update("couplePrice", "");
                      }}
                      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                      style={{
                        background: form.offerCouplePrice
                          ? "var(--primary)"
                          : "var(--border-strong)",
                      }}
                    >
                      <span
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                        style={{
                          left: form.offerCouplePrice ? "22px" : "2px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>
                  {form.offerCouplePrice ? (
                    <Field label="Couple price (GHS)">
                      <FieldInput
                        type="number"
                        placeholder="1500"
                        value={form.couplePrice}
                        onChange={(e) => update("couplePrice", e.target.value)}
                      />
                    </Field>
                  ) : (
                    <p className="mt-auto text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      Turn on to offer a special rate for pairs.
                    </p>
                  )}
                </div>

                {/* Group */}
                <div
                  className="flex flex-col rounded-xl border p-4 transition-colors"
                  style={{
                    borderColor: form.offerGroupPrice
                      ? "var(--primary)"
                      : "var(--border)",
                    background: form.offerGroupPrice
                      ? "var(--primary-dim)"
                      : "var(--bg)",
                  }}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{
                          background: form.offerGroupPrice
                            ? "var(--primary)"
                            : "var(--bg-secondary)",
                        }}
                      >
                        <Users
                          className="h-4 w-4"
                          style={{
                            color: form.offerGroupPrice
                              ? "#fbf7f1"
                              : "var(--text-tertiary)",
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          Group
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          Flat package rate
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.offerGroupPrice}
                      onClick={() => {
                        const next = !form.offerGroupPrice;
                        update("offerGroupPrice", next);
                        if (!next) {
                          update("groupPrice", "");
                          update("groupSize", "5");
                        }
                      }}
                      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                      style={{
                        background: form.offerGroupPrice
                          ? "var(--primary)"
                          : "var(--border-strong)",
                      }}
                    >
                      <span
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                        style={{
                          left: form.offerGroupPrice ? "22px" : "2px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>
                  {form.offerGroupPrice ? (
                    <div className="space-y-3">
                      <Field label="Group size">
                        <Select
                          value={form.groupSize}
                          onValueChange={(v) => update("groupSize", v)}
                        >
                          <SelectTrigger className="h-10 rounded-lg" style={fieldStyle}>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 6, 8, 10, 12, 15, 20].map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                Group of {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Group price (GHS)">
                        <FieldInput
                          type="number"
                          placeholder="8000"
                          value={form.groupPrice}
                          onChange={(e) => update("groupPrice", e.target.value)}
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="mt-auto text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      Turn on to set a flat rate for a group of 5, 10, and more.
                    </p>
                  )}
                </div>
              </div>
            </FormCard>

            <FormCard title="Refund policy">
              <div className="space-y-2">
                {[
                  {
                    value: "full" as const,
                    label: "Free cancellation",
                    hint: "Full refund if canceled in time",
                  },
                  {
                    value: "partial" as const,
                    label: "Partial refund",
                    hint: "Traveler gets a percentage back",
                  },
                  {
                    value: "none" as const,
                    label: "Non-refundable",
                    hint: "No refund after booking is confirmed",
                  },
                ].map((opt) => {
                  const active = form.refundPolicy === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className="rounded-lg border transition-colors"
                      style={{
                        borderColor: active ? "var(--primary)" : "var(--border)",
                        background: active ? "var(--primary-dim)" : "var(--bg)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => update("refundPolicy", opt.value)}
                        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                      >
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            borderColor: active
                              ? "var(--primary)"
                              : "var(--border-strong)",
                            background: active ? "var(--primary)" : "transparent",
                          }}
                        >
                          {active && (
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: "#fbf7f1" }}
                            />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-sm font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {opt.label}
                          </span>
                          {!active && (
                            <span
                              className="mt-0.5 block text-[11px]"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {opt.hint}
                            </span>
                          )}
                        </span>
                      </button>

                      {active && opt.value === "full" && (
                        <div className="border-t px-3.5 pb-3.5 pt-3" style={{ borderColor: "var(--border)" }}>
                          <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <span>Full refund if canceled</span>
                            <FieldInput
                              type="number"
                              min="1"
                              className="!h-8 !w-16 !px-2 text-center"
                              value={form.refundDeadlineDays}
                              onChange={(e) => update("refundDeadlineDays", e.target.value)}
                            />
                            <span>days before departure</span>
                          </div>
                        </div>
                      )}

                      {active && opt.value === "partial" && (
                        <div className="border-t px-3.5 pb-3.5 pt-3" style={{ borderColor: "var(--border)" }}>
                          <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <FieldInput
                              type="number"
                              min="0"
                              max="100"
                              className="!h-8 !w-16 !px-2 text-center"
                              value={form.refundPercentage}
                              onChange={(e) => update("refundPercentage", e.target.value)}
                            />
                            <span>% back if canceled</span>
                            <FieldInput
                              type="number"
                              min="1"
                              className="!h-8 !w-16 !px-2 text-center"
                              value={form.refundDeadlineDays}
                              onChange={(e) => update("refundDeadlineDays", e.target.value)}
                            />
                            <span>days before departure</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FormCard>

            <FormCard
              title="Optional add-ons"
              action={
                <button
                  type="button"
                  onClick={addAddOn}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              }
            >
              {addOns.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  No add-ons yet. Optional extras travelers can buy with booking.
                </p>
              ) : (
                <div className="space-y-3">
                  {addOns.map((addon, i) => (
                    <div key={i} className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
                      <Field label="Name">
                        <FieldInput
                          placeholder="e.g. Travel insurance"
                          value={addon.name}
                          onChange={(e) => updateAddOn(i, "name", e.target.value)}
                        />
                      </Field>
                      <Field label="GHS">
                        <FieldInput
                          type="number"
                          value={addon.price}
                          onChange={(e) => updateAddOn(i, "price", e.target.value)}
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-0.5"
                        onClick={() => removeAddOn(i)}
                      >
                        <Trash2 className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormCard>
          </>
        )}

        {currentStep === "logistics" && (
          <>
            <FormCard title="Meetup details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Departure / pickup point" className="sm:col-span-2">
                  <FieldInput
                    placeholder="e.g. Accra Mall — main entrance"
                    value={form.departurePoint}
                    onChange={(e) => update("departurePoint", e.target.value)}
                  />
                </Field>
                <Field label="Meeting notes" className="sm:col-span-2">
                  <FieldTextarea
                    placeholder="Landmarks, parking, what to look for…"
                    value={form.meetingPoint}
                    onChange={(e) => update("meetingPoint", e.target.value)}
                    rows={3}
                  />
                </Field>
                <Field label="Departure time">
                  <FieldInput
                    type="time"
                    value={form.departureTime}
                    onChange={(e) => update("departureTime", e.target.value)}
                  />
                </Field>
                <Field label="Expected return">
                  <FieldInput
                    type="time"
                    value={form.returnTime}
                    onChange={(e) => update("returnTime", e.target.value)}
                  />
                </Field>
              </div>
            </FormCard>

            <FormCard title="Gallery photos">
              <GalleryUpload
                images={form.gallery}
                max={6}
                onChange={(imgs: string[], files?: File[]) => {
                  update("gallery", imgs.slice(0, 6));
                  if (files) setGalleryFiles(files.slice(0, 6));
                }}
              />
            </FormCard>

            <div
              className="flex gap-3 rounded-xl border px-4 py-3 text-xs"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
              }}
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} />
              Publish when the trip is ready. You can save a draft and finish later.
            </div>
          </>
        )}
      </div>

      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderColor: "var(--border)" }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={isFirst}
          
          style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {!isLast ? (
          <Button
            type="button"
            onClick={goNext}
            
            style={{
              background: "var(--gradient-brand)",
              color: "#fbf7f1",
            }}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="rounded-lg"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            >
              {isSaving ? "Saving…" : "Save draft"}
            </Button>
            <Button
              onClick={() =>
                handleSave(
                  mode === "edit" && form.status !== "draft" ? form.status : "live"
                )
              }
              disabled={isSaving}
              className="rounded-lg"
              style={{
                background: "var(--gradient-brand)",
                color: "#fbf7f1",
              }}
            >
              {isSaving
                ? "Saving…"
                : mode === "edit" && form.status !== "draft"
                  ? "Save changes"
                  : "Publish trip"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  borderColor: "var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
} as const;

function FormCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl border px-5 py-5 sm:px-6"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label
        className="mb-1.5 block text-[12px] font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
        {required && <span style={{ color: "var(--coral)" }}> *</span>}
      </Label>
      {children}
    </div>
  );
}

function FieldInput(props: React.ComponentProps<"input">) {
  return (
    <Input
      {...props}
      className={`h-10 rounded-lg ${props.className ?? ""}`}
      style={{ ...fieldStyle, ...(props.style ?? {}) }}
    />
  );
}

function FieldTextarea(props: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      {...props}
      className={`rounded-lg ${props.className ?? ""}`}
      style={{ ...fieldStyle, ...(props.style ?? {}) }}
    />
  );
}

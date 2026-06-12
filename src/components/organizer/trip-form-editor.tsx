"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Shield,
  ImageIcon,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 text-stone-500 hover:text-stone-900"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </Button>
          <h1 className="text-2xl font-bold text-stone-900">{heading}</h1>
          <p className="text-stone-500 mt-1 max-w-xl">{subheading}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-stone-500">Form completion</p>
            <p className="text-sm font-semibold text-teal-700">{completionPct}%</p>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-teal-100 flex items-center justify-center">
            <span className="text-xs font-bold text-teal-700">{completionPct}%</span>
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <Tabs defaultValue="media">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="visibility">Publish</TabsTrigger>
            </TabsList>

            {/* ── Media ── */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-teal-600" />
                    Cover Image
                  </CardTitle>
                  <CardDescription>
                    This is the main photo shown on trip cards and the detail page hero. Use a high-quality landscape photo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    label=""
                    description="Recommended 1600×900 px · JPG or PNG · Max 5 MB"
                    value={form.coverImage}
                    onChange={(url) => update("coverImage", url)}
                    aspectRatio="video"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gallery Photos</CardTitle>
                  <CardDescription>Add extra photos to showcase the experience, accommodation, and scenery.</CardDescription>
                </CardHeader>
                <CardContent>
                  <GalleryUpload images={form.gallery} onChange={(imgs) => update("gallery", imgs)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trip Flyer / Brochure</CardTitle>
                  <CardDescription>Upload a PDF or image flyer travelers can download or share.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    label=""
                    description="PDF, JPG, or PNG · Max 10 MB"
                    accept="image/*,.pdf,application/pdf"
                    variant="document"
                    aspectRatio="square"
                    value={form.flyer}
                    onChange={(url) => update("flyer", url)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Basics ── */}
            <TabsContent value="basics">
              <Card>
                <CardHeader><CardTitle className="text-base">Trip Basics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Trip Title</Label>
                    <Input className="mt-1.5" placeholder="e.g. Volta Region Waterfall Trek" value={form.title} onChange={(e) => update("title", e.target.value)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Destination</Label>
                      <Input className="mt-1.5" placeholder="e.g. Volta Region" value={form.destination} onChange={(e) => update("destination", e.target.value)} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => update("category", v as TripCategory)}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {TRIP_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" className="mt-1.5" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" className="mt-1.5" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input className="mt-1.5" placeholder="e.g. hiking, waterfalls, weekend getaway" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Organizer Contact Phone</Label>
                      <Input className="mt-1.5" placeholder="+233 XX XXX XXXX" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
                    </div>
                    <div>
                      <Label>Organizer Contact Email</Label>
                      <Input type="email" className="mt-1.5" placeholder="you@example.com" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Details ── */}
            <TabsContent value="details">
              <Card>
                <CardHeader><CardTitle className="text-base">Trip Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea className="mt-1.5 min-h-[120px]" placeholder="Describe the experience, what makes it special..." value={form.description} onChange={(e) => update("description", e.target.value)} />
                  </div>
                  <div>
                    <Label>Highlights (one per line)</Label>
                    <Textarea className="mt-1.5" placeholder="Visit Wli Falls — Ghana's tallest waterfall&#10;Traditional Ewe village tour&#10;Sunset at Afadjato peak" value={form.highlights} onChange={(e) => update("highlights", e.target.value)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>What&apos;s Included (one per line)</Label>
                      <Textarea className="mt-1.5" placeholder="Professional guide&#10;All meals&#10;Transport" value={form.included} onChange={(e) => update("included", e.target.value)} />
                    </div>
                    <div>
                      <Label>What&apos;s Excluded (one per line)</Label>
                      <Textarea className="mt-1.5" placeholder="Personal gear&#10;Tips&#10;Travel insurance" value={form.excluded} onChange={(e) => update("excluded", e.target.value)} />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={form.difficulty} onValueChange={(v) => update("difficulty", v as Difficulty)}>
                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy — suitable for beginners</SelectItem>
                          <SelectItem value="moderate">Moderate — some fitness required</SelectItem>
                          <SelectItem value="challenging">Challenging — experienced travelers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Min Age</Label>
                      <Input type="number" className="mt-1.5" placeholder="18" value={form.ageMin} onChange={(e) => update("ageMin", e.target.value)} />
                    </div>
                    <div>
                      <Label>Max Age (optional)</Label>
                      <Input type="number" className="mt-1.5" placeholder="65" value={form.ageMax} onChange={(e) => update("ageMax", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Min Capacity</Label>
                      <Input type="number" className="mt-1.5" placeholder="8" value={form.minCapacity} onChange={(e) => update("minCapacity", e.target.value)} />
                    </div>
                    <div>
                      <Label>Max Capacity</Label>
                      <Input type="number" className="mt-1.5" placeholder="16" value={form.maxCapacity} onChange={(e) => update("maxCapacity", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Logistics ── */}
            <TabsContent value="logistics">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    Departure & Meeting Points
                  </CardTitle>
                  <CardDescription>Where travelers should meet and when the trip starts and ends.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Departure Point</Label>
                    <Input className="mt-1.5" placeholder="e.g. Accra Mall, Tema Station" value={form.departurePoint} onChange={(e) => update("departurePoint", e.target.value)} />
                  </div>
                  <div>
                    <Label>Meeting Point Details</Label>
                    <Textarea className="mt-1.5" placeholder="Exact location, landmarks, parking info..." value={form.meetingPoint} onChange={(e) => update("meetingPoint", e.target.value)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Departure Time</Label>
                      <Input type="time" className="mt-1.5" value={form.departureTime} onChange={(e) => update("departureTime", e.target.value)} />
                    </div>
                    <div>
                      <Label>Expected Return Time</Label>
                      <Input type="time" className="mt-1.5" value={form.returnTime} onChange={(e) => update("returnTime", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Pricing ── */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Pricing & Deposits</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Price per Person (GHS)</Label>
                      <Input type="number" className="mt-1.5" placeholder="1850" value={form.price} onChange={(e) => update("price", e.target.value)} />
                    </div>
                    <div>
                      <Label>Deposit Amount (GHS)</Label>
                      <Input type="number" className="mt-1.5" placeholder="500" value={form.depositAmount} onChange={(e) => update("depositAmount", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Deposit Due</Label>
                    <Select value={form.depositRules} onValueChange={(v) => update("depositRules", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="When is deposit due?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Due at booking</SelectItem>
                        <SelectItem value="7days">Due 7 days before departure</SelectItem>
                        <SelectItem value="14days">Due 14 days before departure</SelectItem>
                        <SelectItem value="30days">Due 30 days before departure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-3">Early Bird Pricing (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Early Bird Price (GHS)</Label>
                        <Input type="number" className="mt-1.5" placeholder="1650" value={form.earlyBirdPrice} onChange={(e) => update("earlyBirdPrice", e.target.value)} />
                      </div>
                      <div>
                        <Label>Early Bird Deadline</Label>
                        <Input type="date" className="mt-1.5" value={form.earlyBirdDeadline} onChange={(e) => update("earlyBirdDeadline", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Optional Add-ons</CardTitle>
                  <CardDescription>Extra services travelers can purchase during booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addOns.map((addon, i) => (
                    <div key={i} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Add-on name</Label>
                        <Input className="mt-1" placeholder="e.g. Travel insurance" value={addon.name} onChange={(e) => updateAddOn(i, "name", e.target.value)} />
                      </div>
                      <div className="w-28">
                        <Label className="text-xs">Price (GHS)</Label>
                        <Input type="number" className="mt-1" placeholder="150" value={addon.price} onChange={(e) => updateAddOn(i, "price", e.target.value)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAddOn(i)}>
                        <Trash2 className="h-4 w-4 text-stone-400" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addAddOn}>
                    <Plus className="h-4 w-4" /> Add add-on
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Policies ── */}
            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-600" />
                    Refund & Cancellation Policy
                  </CardTitle>
                  <CardDescription>Set clear expectations for travelers about cancellations and refunds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <RadioGroup value={form.refundPolicy} onValueChange={(v) => update("refundPolicy", v as RefundPolicy)}>
                    <div className="space-y-3">
                      {[
                        { value: "full", label: "Fully Refundable", desc: "Full refund if cancelled before the deadline" },
                        { value: "partial", label: "Partially Refundable", desc: "Partial refund based on how far in advance they cancel" },
                        { value: "none", label: "Non-Refundable", desc: "No refunds after booking confirmation" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${form.refundPolicy === opt.value ? "border-teal-500 bg-teal-50/50" : "border-stone-200 hover:border-stone-300"}`}
                        >
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-stone-900">{opt.label}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  {form.refundPolicy !== "none" && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <Label>Cancellation Deadline (days before departure)</Label>
                        <Input type="number" className="mt-1.5" placeholder="14" value={form.refundDeadlineDays} onChange={(e) => update("refundDeadlineDays", e.target.value)} />
                      </div>
                      {form.refundPolicy === "partial" && (
                        <div>
                          <Label>Refund Percentage (%)</Label>
                          <Input type="number" className="mt-1.5" placeholder="50" min="0" max="100" value={form.refundPercentage} onChange={(e) => update("refundPercentage", e.target.value)} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-xl bg-stone-50 p-4 flex gap-3">
                    <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-500">
                      {form.refundPolicy === "full" && form.refundDeadlineDays
                        ? `Travelers can cancel up to ${form.refundDeadlineDays} days before departure for a full refund.`
                        : form.refundPolicy === "partial" && form.refundDeadlineDays
                        ? `Travelers can cancel up to ${form.refundDeadlineDays} days before departure and receive a ${form.refundPercentage || "0"}% refund.`
                        : form.refundPolicy === "none"
                        ? "This trip is non-refundable. Travelers will be notified during booking."
                        : "Configure your refund policy above."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Visibility ── */}
            <TabsContent value="visibility">
              <Card>
                <CardHeader><CardTitle className="text-base">Publish Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Publish Status</Label>
                    <Select value={form.status} onValueChange={(v) => update("status", v as TripStatus)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRIP_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <Select value={form.visibility} onValueChange={(v) => update("visibility", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Who can see this trip?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public — everyone</SelectItem>
                        <SelectItem value="unlisted">Unlisted — link only</SelectItem>
                        <SelectItem value="private">Private — invite only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-stone-200 p-4">
                    <Checkbox id={`trip-confirm-${mode}`} />
                    <label htmlFor={`trip-confirm-${mode}`} className="text-sm text-stone-600 leading-snug cursor-pointer">
                      I confirm all trip details, pricing, and policies are accurate and I have the right to use all uploaded media.
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-stone-100">
            {mode === "edit" ? (
              <>
                <Button onClick={() => handleSave(form.status)}>Save Changes</Button>
                <Button variant="outline" onClick={() => handleSave("draft")}>Save as Draft</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSave("draft")}>Save Draft</Button>
                <Button variant="secondary" onClick={() => handleSave("scheduled")}>Schedule</Button>
                <Button onClick={() => handleSave("live")}>Publish Live</Button>
              </>
            )}
          </div>
        </div>

        {/* ── Live Preview Sidebar ── */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Live Preview</p>
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-stone-100">
                {form.coverImage ? (
                  <Image src={form.coverImage} alt="Cover preview" fill unoptimized className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <span className="text-xs">Cover image preview</span>
                  </div>
                )}
                {form.category && (
                  <Badge className="absolute top-3 left-3 capitalize">{form.category}</Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-stone-900 line-clamp-2">
                  {form.title || "Your Trip Title"}
                </h3>
                {form.destination && (
                  <p className="text-sm text-stone-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {form.destination}
                  </p>
                )}
                {(form.startDate || form.endDate) && (
                  <p className="text-sm text-stone-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {form.startDate && form.endDate
                      ? `${form.startDate} → ${form.endDate}`
                      : form.startDate || form.endDate}
                  </p>
                )}
                {form.departurePoint && (
                  <p className="text-sm text-stone-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Departs {form.departurePoint}
                    {form.departureTime && ` at ${form.departureTime}`}
                  </p>
                )}
                {(form.minCapacity || form.maxCapacity) && (
                  <p className="text-sm text-stone-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {form.minCapacity && form.maxCapacity
                      ? `${form.minCapacity}–${form.maxCapacity} travelers`
                      : form.maxCapacity
                      ? `Up to ${form.maxCapacity} travelers`
                      : `Min ${form.minCapacity} travelers`}
                  </p>
                )}
                <Separator />
                <div className="flex items-end justify-between">
                  <div>
                    {form.earlyBirdPrice && (
                      <p className="text-xs text-teal-600 font-medium">Early bird {formatCurrency(Number(form.earlyBirdPrice))}</p>
                    )}
                    <p className="text-xl font-bold text-stone-900">
                      {form.price ? formatCurrency(Number(form.price)) : "—"}
                      <span className="text-sm font-normal text-stone-400"> / person</span>
                    </p>
                  </div>
                  {form.refundPolicy && (
                    <Badge variant={form.refundPolicy === "none" ? "secondary" : "success"} className="text-xs">
                      {form.refundPolicy === "full" ? "Refundable" : form.refundPolicy === "partial" ? "Partial refund" : "Non-refundable"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {form.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {form.gallery.slice(0, 3).map((img) => (
                  <div key={img} className="relative aspect-square rounded-lg overflow-hidden">
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

"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Smartphone,
  Building2, CalendarCheck, Users, Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import type { PaymentMethod, Trip } from "@/lib/types";

const STEPS = ["Details", "Add-ons", "Payment", "Confirm"];
const STEP_COUNT = STEPS.length;

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="h-5 w-5" />, desc: "Visa, Mastercard" },
  { id: "mtn", label: "MTN Mobile Money", icon: <Smartphone className="h-5 w-5" />, desc: "Pay with MTN MoMo" },
  { id: "vodafone", label: "Vodafone Cash", icon: <Smartphone className="h-5 w-5" />, desc: "Pay with Vodafone Cash" },
  { id: "airteltigo", label: "AirtelTigo Money", icon: <Smartphone className="h-5 w-5" />, desc: "Pay with AT Money" },
  { id: "bank", label: "Bank Transfer", icon: <Building2 className="h-5 w-5" />, desc: "Direct bank deposit" },
  { id: "installment", label: "Instalment Plan", icon: <CalendarCheck className="h-5 w-5" />, desc: "Pay in 3 monthly instalments" },
];

interface BookingFlowClientProps {
  trip: Trip;
  isWaitlist: boolean;
}

function BookingFlow({ trip, isWaitlist }: BookingFlowClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [travelers, setTravelers] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", emergency: "" });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [smsNotify, setSmsNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);

  const addOnTotal = trip.addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const subtotal = trip.price * travelers + addOnTotal;
  const deposit = isWaitlist ? 0 : trip.depositAmount * travelers;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (isWaitlist) {
      toast.success("You've been added to the waitlist! We'll notify you when a spot opens.");
      router.push(`/trips/${trip.id}/book/confirm?waitlist=true`);
      return;
    }
    toast.success("Booking confirmed! Check your email for receipt.");
    router.push(`/trips/${trip.id}/book/confirm`);
  };

  if (isWaitlist && step === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Bell className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle>Join the Waitlist</CardTitle>
            <p className="text-sm text-stone-500 mt-2">
              {trip.title} is fully booked. Enter your details and we&apos;ll notify you automatically when a spot opens.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Phone (for SMS alerts)</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 XX XXX XXXX" className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sms" checked={smsNotify} onCheckedChange={(c) => setSmsNotify(!!c)} />
              <Label htmlFor="sms" className="font-normal">Notify me via SMS when a spot opens</Label>
            </div>
            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!form.name || !form.email}>
              Join Waitlist
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href={`/trips/${trip.id}`}><ArrowLeft className="h-4 w-4" /> Back to trip</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={`/trips/${trip.id}`} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-teal-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to trip
      </Link>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i < step ? "bg-teal-600 text-white" : i === step ? "bg-teal-100 text-teal-700 ring-2 ring-teal-600" : "bg-stone-100 text-stone-400"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-sm ${i === step ? "font-medium text-stone-900" : "text-stone-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="hidden sm:block w-8 h-px bg-stone-200 mx-1" />}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEP_COUNT) * 100} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <Card>
                  <CardHeader><CardTitle>Traveler Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Number of travelers</Label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Button variant="outline" size="icon" onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</Button>
                        <span className="text-lg font-semibold w-8 text-center">{travelers}</span>
                        <Button variant="outline" size="icon" onClick={() => setTravelers(Math.min(5, travelers + 1))}>+</Button>
                        <Users className="h-4 w-4 text-stone-400 ml-2" />
                      </div>
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Emergency Contact</Label>
                      <Input value={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.value })} className="mt-1.5" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 1 && (
                <Card>
                  <CardHeader><CardTitle>Optional Add-ons</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {trip.addOns.length === 0 ? (
                      <p className="text-stone-500 text-sm">No add-ons available for this trip.</p>
                    ) : (
                      trip.addOns.map((addon) => (
                        <label
                          key={addon.id}
                          className="flex items-center justify-between rounded-xl border border-stone-200 p-4 cursor-pointer hover:border-teal-300 transition-colors has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedAddOns.includes(addon.id)}
                              onCheckedChange={() => toggleAddOn(addon.id)}
                            />
                            <span className="font-medium text-stone-900">{addon.name}</span>
                          </div>
                          <span className="text-sm font-medium text-stone-600">+{formatCurrency(addon.price)}</span>
                        </label>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} className="space-y-3">
                      {paymentMethods.map((pm) => (
                        <label
                          key={pm.id}
                          className="flex items-center gap-4 rounded-xl border border-stone-200 p-4 cursor-pointer hover:border-teal-300 transition-colors has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/50"
                        >
                          <RadioGroupItem value={pm.id} />
                          <div className="text-teal-600">{pm.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">{pm.label}</p>
                            <p className="text-xs text-stone-500">{pm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>

                    {payment === "card" && (
                      <div className="mt-4 space-y-3 p-4 rounded-xl bg-stone-50">
                        <Input placeholder="Card number" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="MM/YY" />
                          <Input placeholder="CVC" />
                        </div>
                      </div>
                    )}

                    {(payment === "mtn" || payment === "vodafone" || payment === "airteltigo") && (
                      <div className="mt-4 p-4 rounded-xl bg-stone-50">
                        <Label>Mobile Money Number</Label>
                        <Input placeholder="+233 XX XXX XXXX" className="mt-1.5" />
                      </div>
                    )}

                    {payment === "installment" && (
                      <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-800">
                          Pay {formatCurrency(Math.ceil(subtotal / 3))} today, then 2 equal monthly payments. No interest.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader><CardTitle>Review & Confirm</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl bg-stone-50 p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-stone-500">Traveler</span><span className="font-medium">{form.name}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Email</span><span>{form.email}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Travelers</span><span>{travelers}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Payment</span><span className="capitalize">{payment}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="email-n" checked={emailNotify} onCheckedChange={(c) => setEmailNotify(!!c)} />
                      <Label htmlFor="email-n" className="font-normal">Send email confirmation & PDF receipt</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="sms-n" checked={smsNotify} onCheckedChange={(c) => setSmsNotify(!!c)} />
                      <Label htmlFor="sms-n" className="font-normal">Send SMS booking reminder</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="cal" defaultChecked />
                      <Label htmlFor="cal" className="font-normal">Add calendar invite (.ics)</Label>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEP_COUNT - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 0 && (!form.name || !form.email)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" size="lg" onClick={handleSubmit}>
                Confirm Booking
              </Button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="relative h-32 overflow-hidden rounded-t-2xl">
              <Image src={trip.image} alt={trip.title} fill className="object-cover" />
            </div>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-stone-900">{trip.title}</h3>
              <p className="text-sm text-stone-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">{formatCurrency(trip.price)} × {travelers}</span><span>{formatCurrency(trip.price * travelers)}</span></div>
                {addOnTotal > 0 && <div className="flex justify-between"><span className="text-stone-500">Add-ons</span><span>{formatCurrency(addOnTotal)}</span></div>}
                <Separator />
                <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-teal-600"><span>Due today (deposit)</span><span>{formatCurrency(deposit)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function BookingFlowClient(props: BookingFlowClientProps) {
  return (
    <RequireAuth>
      <BookingFlow {...props} />
    </RequireAuth>
  );
}

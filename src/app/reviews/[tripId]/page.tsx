"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/trips/star-rating";
import { getTripById } from "@/lib/mock-data";

export default function ReviewPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const trip = getTripById(tripId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!trip) return <p className="p-8 text-center text-stone-500">Trip not found.</p>;

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you for your review!");
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
        </motion.div>
        <h1 className="text-xl font-bold text-stone-900">Review Submitted!</h1>
        <p className="text-stone-500 mt-2">Your feedback helps other travelers and organizers improve.</p>
        <Button className="mt-6" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rate your experience</CardTitle>
          <p className="text-sm text-stone-500">{trip.title}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-stone-500 mb-3">How was your trip?</p>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Your review</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share highlights, tips, and what made this trip special..."
              className="mt-1.5 min-h-[120px]"
            />
          </div>
          <Button className="w-full" size="lg" onClick={handleSubmit}>
            <Send className="h-4 w-4" /> Submit Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

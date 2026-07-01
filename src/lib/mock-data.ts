import type { Booking, Organizer, Payout, Trip, TripAttendee } from "./types";

export const organizers: Organizer[] = [
  {
    id: "org-1",
    name: "Kofi Adventures",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    bio: "Curating unforgettable Ghanaian adventures since 2018. From Volta hikes to coastal escapes.",
    verified: true,
    verificationStatus: "verified",
    rating: 4.9,
    reviewCount: 128,
    tripCount: 24,
    joinedAt: "2018-03-15",
    location: "Accra, Ghana",
  },
  {
    id: "org-2",
    name: "Savanna Trails",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    bio: "Wildlife and cultural immersion across West Africa's most breathtaking landscapes.",
    verified: true,
    verificationStatus: "verified",
    rating: 4.8,
    reviewCount: 94,
    tripCount: 18,
    joinedAt: "2019-07-22",
    location: "Kumasi, Ghana",
  },
  {
    id: "org-3",
    name: "Coastal Vibes GH",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    bio: "Beach retreats, surf camps, and island hopping along Ghana's golden coast.",
    verified: false,
    verificationStatus: "in_review",
    rating: 4.6,
    reviewCount: 42,
    tripCount: 9,
    joinedAt: "2023-01-10",
    location: "Cape Coast, Ghana",
  },
];

export const trips: Trip[] = [
  {
    id: "trip-1",
    title: "Volta Region Waterfall Trek",
    destination: "Volta Region",
    category: "adventure",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
    ],
    startDate: "2026-07-12",
    endDate: "2026-07-15",
    price: 1850,
    depositAmount: 500,
    capacity: 16,
    booked: 13,
    minCapacity: 8,
    organizerId: "org-1",
    description:
      "A 4-day guided trek through the lush Volta highlands, visiting Wli Falls, hidden swimming holes, and traditional Ewe villages. Perfect for adventure seekers who want authentic cultural encounters.",
    included: [
      "Professional guide",
      "All meals",
      "Camping equipment",
      "Transport from Accra",
      "Park entry fees",
      "Travel insurance",
    ],
    excluded: ["Personal gear", "Tips", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Accra to Hohoe", activities: ["Depart Accra 6am", "Lunch in Hohoe", "Village welcome ceremony"] },
      { day: 2, title: "Wli Falls Trek", activities: ["Early morning hike", "Swim at falls base", "Campfire dinner"] },
      { day: 3, title: "Mountain Ridge Trail", activities: ["Summit viewpoint", "Photography session", "Traditional drumming"] },
      { day: 4, title: "Return Journey", activities: ["Morning yoga", "Souvenir market", "Arrive Accra by 6pm"] },
    ],
    status: "live",
    rating: 4.9,
    reviewCount: 47,
    reviews: [
      { id: "r1", author: "Ama O.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", rating: 5, comment: "Absolutely life-changing! Kofi knows every trail and the food was incredible.", date: "2026-02-10" },
      { id: "r2", author: "David K.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", rating: 5, comment: "Well organized from start to finish. The waterfall swim was the highlight.", date: "2026-01-28" },
    ],
    addOns: [
      { id: "a1", name: "Private tent upgrade", price: 150 },
      { id: "a2", name: "Photography package", price: 200 },
      { id: "a3", name: "Extra night extension", price: 350 },
    ],
    views: 2840,
    conversions: 13,
    refundPolicy: "partial",
    refundDeadlineDays: 14,
    refundPercentage: 50,
  },
  {
    id: "trip-2",
    title: "Cape Coast Heritage & Beach",
    destination: "Cape Coast",
    category: "cultural",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
    ],
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    price: 1200,
    depositAmount: 300,
    capacity: 20,
    booked: 20,
    minCapacity: 10,
    organizerId: "org-3",
    description:
      "Explore Ghana's rich history at Cape Coast Castle, then unwind on pristine beaches. A perfect blend of culture and relaxation.",
    included: ["Castle tour", "Beach resort stay", "Breakfast & dinner", "AC bus transport"],
    excluded: ["Lunch", "Personal expenses", "Optional water sports"],
    itinerary: [
      { day: 1, title: "Castle & Museum", activities: ["Castle guided tour", "Door of No Return", "Museum visit"] },
      { day: 2, title: "Beach Day", activities: ["Kokrobite beach", "Surf lesson", "Sunset BBQ"] },
      { day: 3, title: "Fishing Village", activities: ["Elmina harbor", "Fresh seafood lunch", "Craft workshop"] },
      { day: 4, title: "Departure", activities: ["Morning swim", "Gift shopping", "Return to Accra"] },
    ],
    status: "live",
    rating: 4.7,
    reviewCount: 31,
    reviews: [],
    addOns: [
      { id: "a4", name: "Surf board rental", price: 80 },
      { id: "a5", name: "Spa treatment", price: 250 },
    ],
    views: 1920,
    conversions: 20,
    refundPolicy: "none",
    refundDeadlineDays: 14,
  },
  {
    id: "trip-3",
    title: "Mole Safari Experience",
    destination: "Mole National Park",
    category: "wildlife",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1549366021-9f761d040562?w=800&h=500&fit=crop",
    ],
    startDate: "2026-09-05",
    endDate: "2026-09-08",
    price: 2400,
    depositAmount: 600,
    capacity: 12,
    booked: 5,
    minCapacity: 6,
    organizerId: "org-2",
    description:
      "Witness elephants, antelopes, and over 300 bird species in Ghana's largest wildlife refuge. Expert rangers guide every safari drive.",
    included: ["Safari drives", "Lodge accommodation", "All meals", "Ranger fees", "Binoculars"],
    excluded: ["Flights to Tamale", "Tips", "Night photography gear"],
    itinerary: [
      { day: 1, title: "Arrival & Evening Drive", activities: ["Check in lodge", "Sunset safari", "Welcome dinner"] },
      { day: 2, title: "Full Day Safari", activities: ["Dawn drive", "Bush breakfast", "Afternoon tracking"] },
      { day: 3, title: "Walking Safari", activities: ["Guided bush walk", "Bird watching", "Village visit"] },
      { day: 4, title: "Morning Drive & Depart", activities: ["Final elephant spotting", "Brunch", "Transfer out"] },
    ],
    status: "live",
    rating: 4.8,
    reviewCount: 22,
    reviews: [],
    addOns: [{ id: "a6", name: "Night safari", price: 400 }],
    views: 1560,
    conversions: 5,
    refundPolicy: "full",
    refundDeadlineDays: 21,
  },
  {
    id: "trip-4",
    title: "Accra City Food Tour",
    destination: "Accra",
    category: "city",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
    images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop"],
    startDate: "2026-06-20",
    endDate: "2026-06-20",
    price: 350,
    depositAmount: 100,
    capacity: 15,
    booked: 8,
    minCapacity: 5,
    organizerId: "org-1",
    description: "A culinary journey through Accra's best street food spots, from waakye to kelewele.",
    included: ["All food tastings", "Local guide", "Drinks"],
    excluded: ["Transport to meeting point"],
    itinerary: [
      { day: 1, title: "Food Crawl", activities: ["Osu market", "Jamestown waakye", "Labadi kelewele", "Dessert at Osu"] },
    ],
    status: "live",
    rating: 4.9,
    reviewCount: 56,
    reviews: [],
    addOns: [],
    views: 980,
    conversions: 8,
    refundPolicy: "full",
    refundDeadlineDays: 7,
  },
  {
    id: "trip-5",
    title: "Ada Foah River Retreat",
    destination: "Ada Foah",
    category: "beach",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop"],
    startDate: "2026-10-10",
    endDate: "2026-10-13",
    price: 1650,
    depositAmount: 400,
    capacity: 18,
    booked: 3,
    minCapacity: 8,
    organizerId: "org-3",
    description: "Where the Volta River meets the Atlantic — kayaking, bonfires, and stargazing on the estuary.",
    included: ["Eco-lodge", "Kayak rental", "All meals", "Bonfire night"],
    excluded: ["Transport", "Jet ski rental"],
    itinerary: [
      { day: 1, title: "Arrival", activities: ["Check in", "Estuary swim", "Welcome cocktail"] },
      { day: 2, title: "Kayak & Explore", activities: ["Morning kayak", "Island picnic", "Fishing demo"] },
      { day: 3, title: "Relaxation", activities: ["Yoga on beach", "Massage option", "Bonfire & music"] },
      { day: 4, title: "Departure", activities: ["Sunrise walk", "Brunch", "Checkout"] },
    ],
    status: "live",
    rating: 4.5,
    reviewCount: 12,
    reviews: [],
    addOns: [{ id: "a7", name: "Jet ski (30 min)", price: 180 }],
    views: 720,
    conversions: 3,
    refundPolicy: "partial",
    refundDeadlineDays: 14,
    refundPercentage: 75,
  },
  {
    id: "trip-6",
    title: "Kakum Canopy Walk & Wellness",
    destination: "Cape Coast",
    category: "wellness",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop"],
    startDate: "2026-11-01",
    endDate: "2026-11-03",
    price: 980,
    depositAmount: 250,
    capacity: 14,
    booked: 0,
    minCapacity: 6,
    organizerId: "org-2",
    description: "Walk among the treetops at Kakum, then unwind with yoga and meditation in a rainforest retreat.",
    included: ["Canopy walk entry", "Yoga sessions", "Organic meals", "Meditation guide"],
    excluded: ["Transport", "Spa treatments"],
    itinerary: [
      { day: 1, title: "Canopy & Arrival", activities: ["Kakum canopy walk", "Forest meditation", "Organic dinner"] },
      { day: 2, title: "Wellness Day", activities: ["Sunrise yoga", "Nature bath", "Sound healing"] },
      { day: 3, title: "Integration", activities: ["Journaling workshop", "Closing circle", "Departure"] },
    ],
    status: "scheduled",
    rating: 0,
    reviewCount: 0,
    reviews: [],
    addOns: [{ id: "a8", name: "Private yoga session", price: 120 }],
    views: 340,
    conversions: 0,
    refundPolicy: "full",
    refundDeadlineDays: 14,
  },
];

export const platformHighlights = [
  { label: "Trips posted", value: 500, suffix: "+" },
  { label: "Travellers on board", value: 12000, suffix: "+" },
  { label: "Average rating", value: 4.8, suffix: "★" },
  { label: "Destinations", value: 50, suffix: "+" },
  { label: "Verified organisers", value: 80, suffix: "+" },
];

export const userBookings: Booking[] = [
  {
    id: "bk-1",
    tripId: "trip-1",
    tripTitle: "Volta Region Waterfall Trek",
    destination: "Volta Region",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop",
    startDate: "2026-07-12",
    endDate: "2026-07-15",
    status: "confirmed",
    amount: 1850,
    amountPaid: 1850,
    paymentStatus: "paid",
    paymentMethod: "mtn",
    travelers: 2,
  },
  {
    id: "bk-2",
    tripId: "trip-4",
    tripTitle: "Accra City Food Tour",
    destination: "Accra",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
    startDate: "2026-06-20",
    endDate: "2026-06-20",
    status: "pending",
    amount: 700,
    amountPaid: 200,
    paymentStatus: "partial",
    paymentMethod: "card",
    travelers: 2,
  },
  {
    id: "bk-3",
    tripId: "trip-2",
    tripTitle: "Cape Coast Heritage & Beach",
    destination: "Cape Coast",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop",
    startDate: "2026-08-01",
    endDate: "2026-08-04",
    status: "waitlisted",
    amount: 0,
    amountPaid: 0,
    paymentStatus: "pending",
    travelers: 1,
  },
];

export const tripAttendees: TripAttendee[] = [
  { id: "att-1", tripId: "trip-1", name: "Ama Osei", email: "ama.osei@email.com", phone: "+233 24 123 4567", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 1850, amountDue: 1850, paymentMethod: "mtn", paidAt: "2026-04-12", travelers: 1 },
  { id: "att-2", tripId: "trip-1", name: "Kwame Mensah", email: "kwame.m@email.com", phone: "+233 55 234 5678", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 1850, amountDue: 1850, paymentMethod: "card", paidAt: "2026-04-15", travelers: 1 },
  { id: "att-3", tripId: "trip-1", name: "Efua Addo", email: "efua.addo@email.com", phone: "+233 20 345 6789", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", paymentStatus: "partial", amountPaid: 500, amountDue: 1850, paymentMethod: "vodafone", paidAt: "2026-05-02", travelers: 1 },
  { id: "att-4", tripId: "trip-1", name: "Yaw Boateng", email: "yaw.b@email.com", phone: "+233 27 456 7890", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 2000, amountDue: 2000, paymentMethod: "card", paidAt: "2026-04-20", travelers: 1 },
  { id: "att-5", tripId: "trip-1", name: "Abena Kwarteng", email: "abena.k@email.com", phone: "+233 54 567 8901", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 1850, amountDue: 1850, paymentMethod: "mtn", paidAt: "2026-04-18", travelers: 1 },
  { id: "att-6", tripId: "trip-1", name: "Kojo Asante", email: "kojo.a@email.com", phone: "+233 26 678 9012", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 1850, amountDue: 1850, paymentMethod: "bank", paidAt: "2026-04-22", travelers: 1 },
  { id: "att-7", tripId: "trip-1", name: "Adwoa Serwaa", email: "adwoa.s@email.com", phone: "+233 50 789 0123", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", paymentStatus: "pending", amountPaid: 0, amountDue: 1850, travelers: 1 },
  { id: "att-8", tripId: "trip-4", name: "David K.", email: "david.k@email.com", phone: "+233 24 890 1234", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 350, amountDue: 350, paymentMethod: "mtn", paidAt: "2026-05-10", travelers: 1 },
  { id: "att-9", tripId: "trip-4", name: "Nana Ama", email: "nana.ama@email.com", phone: "+233 55 901 2345", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 350, amountDue: 350, paymentMethod: "card", paidAt: "2026-05-08", travelers: 1 },
  { id: "att-10", tripId: "trip-4", name: "Fiifi Annan", email: "fiifi.a@email.com", phone: "+233 20 012 3456", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 700, amountDue: 700, paymentMethod: "vodafone", paidAt: "2026-05-12", travelers: 2 },
  { id: "att-11", tripId: "trip-4", name: "Maame Esi", email: "maame.esi@email.com", phone: "+233 27 123 4560", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", paymentStatus: "partial", amountPaid: 100, amountDue: 350, paymentMethod: "mtn", paidAt: "2026-05-14", travelers: 1 },
  { id: "att-12", tripId: "trip-4", name: "Samuel Ofori", email: "samuel.o@email.com", phone: "+233 54 234 5671", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 350, amountDue: 350, paymentMethod: "card", paidAt: "2026-05-11", travelers: 1 },
  { id: "att-13", tripId: "trip-4", name: "Gifty Mensah", email: "gifty.m@email.com", phone: "+233 26 345 6782", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", paymentStatus: "paid", amountPaid: 350, amountDue: 350, paymentMethod: "airteltigo", paidAt: "2026-05-09", travelers: 1 },
  { id: "att-14", tripId: "trip-4", name: "Prince Darko", email: "prince.d@email.com", phone: "+233 50 456 7893", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", paymentStatus: "pending", amountPaid: 0, amountDue: 350, travelers: 1 },
  { id: "att-15", tripId: "trip-4", name: "Linda Owusu", email: "linda.o@email.com", phone: "+233 24 567 8904", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop", paymentStatus: "pending", amountPaid: 0, amountDue: 700, travelers: 2 },
];

export const organizerPayouts: Payout[] = [
  { id: "p1", tripId: "trip-1", tripTitle: "Volta Region Waterfall Trek", amount: 18500, status: "completed", date: "2026-03-01", payoutDestination: "MTN MoMo · ****4567" },
  { id: "p2", tripId: "trip-4", tripTitle: "Accra City Food Tour", amount: 2800, status: "completed", date: "2026-02-15", payoutDestination: "MTN MoMo · ****4567" },
  { id: "p3", tripId: "trip-3", tripTitle: "Mole Safari Experience", amount: 12000, status: "processing", date: "2026-06-01", payoutDestination: "AirtelTigo Money · ****8901" },
  { id: "p4", tripId: "trip-5", tripTitle: "Ada Foah River Retreat", amount: 4950, status: "pending", date: "2026-10-15", payoutDestination: "Vodafone Cash · ****2345" },
];

export const destinations = [...new Set(trips.map((t) => t.destination))];

export function getTripById(id: string) {
  return trips.find((t) => t.id === id);
}

export function getOrganizerById(id: string) {
  return organizers.find((o) => o.id === id);
}

export function getOrganizerTrips(organizerId: string) {
  return trips.filter((t) => t.organizerId === organizerId);
}

export function getSpotsLeft(trip: Trip) {
  return trip.capacity - trip.booked;
}

export function getAvailabilityStatus(trip: Trip) {
  const left = getSpotsLeft(trip);
  if (left === 0) return "full" as const;
  if (left <= 3) return "limited" as const;
  return "available" as const;
}

export function getTripAttendees(tripId: string) {
  return tripAttendees.filter((a) => a.tripId === tripId);
}

export function getPayoutByTripId(tripId: string) {
  return organizerPayouts.find((p) => p.tripId === tripId);
}

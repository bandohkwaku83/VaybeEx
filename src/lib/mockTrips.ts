// VaybeEx mock data — Ghana / West Africa trip marketplace

export type TripType =
  | "beach"
  | "adventure"
  | "cultural"
  | "hiking"
  | "road_trip"
  | "camping"
  | "weekend_getaway"
  | "international";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed";

export type PaymentStatus = "unpaid" | "deposit_paid" | "fully_paid" | "refunded";

export type TripStatus = "draft" | "live" | "full" | "completed" | "cancelled";
export type BookingMode = "instant" | "manual";

export interface Trip {
  id: string;
  organiserId: string;
  title: string;
  description: string;
  destination: string;
  country: string;
  type: TripType;
  coverImage: string;
  images: string[];
  startDate: string;
  endDate: string;
  durationDays: number;
  priceGhs: number;
  depositGhs?: number;
  capacity: number;
  spotsLeft: number;
  bookingMode: BookingMode;
  status: TripStatus;
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  refundPolicy: { daysBeforeTrip: number; percentRefund: number }[];
  organiserName: string;
  organiserAvatar: string;
  organiserVerified: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured: boolean;
  lat?: number;
  lng?: number;
}

export interface Organiser {
  id: string;
  name: string;
  businessName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  phone: string;
  email: string;
  city: string;
  isVerified: boolean;
  joinedAt: string;
  totalTrips: number;
  completedTrips: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
  languages: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
}

export interface Booking {
  id: string;
  tripId: string;
  travellerId: string;
  organiserId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountPaidGhs: number;
  spots: number;
  applicationAnswers: Record<string, string>;
  appliedAt: string;
  confirmedAt?: string;
  tripStartDate: string;
  travellerName: string;
  travellerAvatar: string;
  tripTitle: string;
  tripDestination: string;
  tripCoverImage: string;
  organiserName: string;
}

export interface Review {
  id: string;
  tripId: string;
  bookingId: string;
  travellerId: string;
  travellerName: string;
  travellerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Traveller {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  joinedAt: string;
  totalTrips: number;
  completedTrips: number;
  wishlist: string[];
}

export type NotificationType =
  | "booking_received"
  | "booking_approved"
  | "booking_rejected"
  | "payment_received"
  | "trip_reminder"
  | "new_review"
  | "trip_approved"
  | "trip_live"
  | "payout_sent"
  | "welcome";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  tripId?: string;
  bookingId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantName: string;
  participantAvatar: string;
  participantRole: "organiser" | "traveller";
  tripId?: string;
  tripTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

// Helper: Unsplash photo
const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Avatar helper using DiceBear
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=00E5C4,F5C842,1A1F17`;

// ───────────────────────────── Organisers ─────────────────────────────
export const organisers: Organiser[] = [
  {
    id: "org-1",
    name: "Kwame Mensah",
    businessName: "Sankofa Expeditions",
    avatar: avatar("Kwame Mensah"),
    coverImage: img("1547471080-7cc2caa01a7e"),
    bio: "Born-and-raised in Accra, Kwame has been guiding group trips across Ghana for 8 years. Lover of jollof, sunsets, and good vibes.",
    phone: "+233 24 555 1201",
    email: "kwame@sankofa.gh",
    city: "Accra",
    isVerified: true,
    joinedAt: "2022-03-14",
    totalTrips: 47,
    completedTrips: 41,
    rating: 4.9,
    reviewCount: 312,
    responseTime: "Usually responds in 1 hour",
    languages: ["English", "Twi", "Ga"],
    socialLinks: { instagram: "@sankofa.expeditions", website: "sankofa.gh" },
  },
  {
    id: "org-2",
    name: "Abena Owusu",
    businessName: "Coast & Canopy Co.",
    avatar: avatar("Abena Owusu"),
    coverImage: img("1469474968028-56623f02e42e"),
    bio: "Eco-tourism specialist focused on the Cape Coast and Volta Region. Trained naturalist and certified hiking guide.",
    phone: "+233 20 412 8866",
    email: "abena@coastcanopy.gh",
    city: "Cape Coast",
    isVerified: true,
    joinedAt: "2023-01-08",
    totalTrips: 28,
    completedTrips: 25,
    rating: 4.8,
    reviewCount: 187,
    responseTime: "Usually responds in 3 hours",
    languages: ["English", "Fante", "Twi"],
    socialLinks: { instagram: "@coastcanopy", tiktok: "@coastcanopy" },
  },
  {
    id: "org-3",
    name: "Kofi Asante",
    businessName: "Northbound Safaris",
    avatar: avatar("Kofi Asante"),
    coverImage: img("1516426122078-c23e76319801"),
    bio: "Northern Ghana expert. Mole, Paga, Bolga — if it's up north, Kofi knows the spot.",
    phone: "+233 24 711 0099",
    email: "kofi@northbound.gh",
    city: "Tamale",
    isVerified: true,
    joinedAt: "2021-11-02",
    totalTrips: 64,
    completedTrips: 60,
    rating: 4.9,
    reviewCount: 421,
    responseTime: "Usually responds in 30 minutes",
    languages: ["English", "Dagbani", "Hausa", "Twi"],
    socialLinks: {
      instagram: "@northbound.gh",
      facebook: "Northbound Safaris",
    },
  },
  {
    id: "org-4",
    name: "Ama Boateng",
    businessName: "Lagos Linkup",
    avatar: avatar("Ama Boateng"),
    coverImage: img("1564507592333-c60657eea523"),
    bio: "Cross-border weekend specialist — Accra to Lagos, Cotonou, and beyond. Fashion, food, and music focused.",
    phone: "+233 27 989 4412",
    email: "ama@lagoslinkup.com",
    city: "Accra",
    isVerified: true,
    joinedAt: "2023-06-19",
    totalTrips: 19,
    completedTrips: 17,
    rating: 4.7,
    reviewCount: 98,
    responseTime: "Usually responds in 2 hours",
    languages: ["English", "Twi", "Yoruba"],
    socialLinks: { instagram: "@lagoslinkup", tiktok: "@lagoslinkup" },
  },
  {
    id: "org-5",
    name: "Yaw Darko",
    businessName: "Surf Busua",
    avatar: avatar("Yaw Darko"),
    coverImage: img("1502680390469-be75c86b636f"),
    bio: "Busua-based surf school turned weekend retreat host. Boards, beach, and bonfires.",
    phone: "+233 24 200 5566",
    email: "yaw@surfbusua.gh",
    city: "Takoradi",
    isVerified: true,
    joinedAt: "2022-09-22",
    totalTrips: 33,
    completedTrips: 31,
    rating: 4.8,
    reviewCount: 215,
    responseTime: "Usually responds in 4 hours",
    languages: ["English", "Fante"],
    socialLinks: { instagram: "@surfbusua" },
  },
  {
    id: "org-6",
    name: "Akosua Ofori",
    businessName: "Volta Vibes",
    avatar: avatar("Akosua Ofori"),
    coverImage: img("1501785888041-af3ef285b470"),
    bio: "Hiking and waterfall trips deep in the Volta Region. Wli, Tafi Atome, Mount Afadja.",
    phone: "+233 50 332 1109",
    email: "akosua@voltavibes.gh",
    city: "Ho",
    isVerified: true,
    joinedAt: "2022-05-30",
    totalTrips: 41,
    completedTrips: 38,
    rating: 4.9,
    reviewCount: 276,
    responseTime: "Usually responds in 1 hour",
    languages: ["English", "Ewe", "Twi"],
    socialLinks: { instagram: "@voltavibes", facebook: "Volta Vibes Ghana" },
  },
  {
    id: "org-7",
    name: "Kojo Aidoo",
    businessName: "Kumasi Cultural Co.",
    avatar: avatar("Kojo Aidoo"),
    coverImage: img("1523805009345-7448845a9e53"),
    bio: "Ashanti cultural deep-dives. Manhyia Palace, Kente villages, traditional drumming.",
    phone: "+233 24 661 9087",
    email: "kojo@kumasicultural.gh",
    city: "Kumasi",
    isVerified: true,
    joinedAt: "2023-02-11",
    totalTrips: 22,
    completedTrips: 20,
    rating: 4.8,
    reviewCount: 134,
    responseTime: "Usually responds in 2 hours",
    languages: ["English", "Twi"],
    socialLinks: { instagram: "@kumasicultural" },
  },
  {
    id: "org-8",
    name: "Efua Quarcoo",
    businessName: "Ada Drift",
    avatar: avatar("Efua Quarcoo"),
    coverImage: img("1507525428034-b723cf961d3e"),
    bio: "Ada Foah river and beach weekenders. Boat parties, bonfires, soft sand.",
    phone: "+233 20 778 4423",
    email: "efua@adadrift.gh",
    city: "Ada Foah",
    isVerified: true,
    joinedAt: "2023-08-04",
    totalTrips: 15,
    completedTrips: 13,
    rating: 4.7,
    reviewCount: 78,
    responseTime: "Usually responds in 5 hours",
    languages: ["English", "Dangme", "Twi"],
    socialLinks: { instagram: "@adadrift", tiktok: "@adadrift" },
  },
  {
    id: "org-9",
    name: "Nana Adjei",
    businessName: "Continental Crew",
    avatar: avatar("Nana Adjei"),
    coverImage: img("1488646953014-85cb44e25828"),
    bio: "Pan-African long-haul: Zanzibar, Dakar, Victoria Falls. Curated for the diaspora.",
    phone: "+233 24 901 2378",
    email: "nana@continentalcrew.com",
    city: "Accra",
    isVerified: true,
    joinedAt: "2021-08-17",
    totalTrips: 38,
    completedTrips: 36,
    rating: 4.9,
    reviewCount: 289,
    responseTime: "Usually responds in 2 hours",
    languages: ["English", "French", "Twi"],
    socialLinks: {
      instagram: "@continentalcrew",
      website: "continentalcrew.com",
    },
  },
  {
    id: "org-10",
    name: "Adwoa Frimpong",
    businessName: "Aburi Air",
    avatar: avatar("Adwoa Frimpong"),
    coverImage: img("1500382017468-9049fed747ef"),
    bio: "Day trips and short escapes from Accra. Gardens, hikes, hot pots, hammocks.",
    phone: "+233 27 116 5500",
    email: "adwoa@aburiair.gh",
    city: "Accra",
    isVerified: false,
    joinedAt: "2024-01-21",
    totalTrips: 11,
    completedTrips: 9,
    rating: 4.6,
    reviewCount: 47,
    responseTime: "Usually responds in 6 hours",
    languages: ["English", "Twi"],
    socialLinks: { instagram: "@aburiair" },
  },
];

// ───────────────────────────── Trips ─────────────────────────────
const today = new Date();
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const trips: Trip[] = [
  {
    id: "trip-1",
    organiserId: "org-1",
    title: "Labadi Beach Weekend Escape",
    description:
      "Two nights of beach bonfires, live highlife bands, and ocean-front yoga at Ghana's most iconic beach. Limited to 18 travellers for an intimate vibe.",
    destination: "Labadi, Accra",
    country: "Ghana",
    type: "beach",
    coverImage: img("1507525428034-b723cf961d3e"),
    images: [
      img("1507525428034-b723cf961d3e"),
      img("1519046904884-53103b34b206"),
      img("1507525428034-b723cf961d3e"),
      img("1473496169904-658ba7c44d8a"),
    ],
    startDate: addDays(14),
    endDate: addDays(16),
    durationDays: 3,
    priceGhs: 850,
    depositGhs: 300,
    capacity: 18,
    spotsLeft: 6,
    bookingMode: "instant",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Arrival & Sunset Welcome",
        description:
          "Check-in at the beachfront resort. Welcome cocktails at 5pm. Bonfire and highlife band from 8pm.",
      },
      {
        day: 2,
        title: "Beach Day & Boat Cruise",
        description:
          "Morning yoga. Afternoon boat cruise along the coast. Group dinner at La Tante DC10.",
      },
      {
        day: 3,
        title: "Brunch & Departure",
        description: "Lazy brunch with the crew. Group photo. Departure by 2pm.",
      },
    ],
    inclusions: [
      "2 nights beachfront accommodation",
      "All meals",
      "Boat cruise",
      "Live music nights",
      "Yoga session",
      "Transport from Accra meet-up point",
    ],
    exclusions: ["Alcoholic drinks", "Personal expenses", "Travel insurance"],
    meetingPoint: "Accra Mall main entrance, 9am Friday",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
      { daysBeforeTrip: 0, percentRefund: 0 },
    ],
    organiserName: "Sankofa Expeditions",
    organiserAvatar: avatar("Kwame Mensah"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 87,
    tags: ["Beach", "Music", "Yoga", "Foodie"],
    isFeatured: true,
    lat: 5.5571,
    lng: -0.1532,
  },
  {
    id: "trip-2",
    organiserId: "org-6",
    title: "Wli Waterfalls Hiking Adventure",
    description:
      "Trek to West Africa's tallest waterfall. Cool off in the lower falls, scale the upper trail with a certified guide, sleep in a forest eco-lodge.",
    destination: "Wli, Volta Region",
    country: "Ghana",
    type: "hiking",
    coverImage: img("1469474968028-56623f02e42e"),
    images: [
      img("1469474968028-56623f02e42e"),
      img("1501785888041-af3ef285b470"),
      img("1441974231531-c6227db76b6e"),
    ],
    startDate: addDays(21),
    endDate: addDays(23),
    durationDays: 3,
    priceGhs: 1100,
    depositGhs: 400,
    capacity: 14,
    spotsLeft: 9,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Ho → Wli",
        description:
          "Morning departure, lunch in Ho, arrive Wli by evening. Welcome dinner of fufu and bushmeat.",
      },
      {
        day: 2,
        title: "Lower & Upper Falls",
        description:
          "Sunrise hike to lower falls. Afternoon: 3-hour upper falls trek. Swimming in natural pools.",
      },
      {
        day: 3,
        title: "Village Tour & Return",
        description: "Morning village walk and craft demo. Lunch then return to Accra.",
      },
    ],
    inclusions: [
      "Eco-lodge stay",
      "All meals",
      "Certified hiking guide",
      "Park entry fees",
      "Round-trip transport from Accra",
    ],
    exclusions: ["Drinks", "Souvenirs", "Tips"],
    meetingPoint: "37 Tro-tro Station, 6am Friday",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 60 },
      { daysBeforeTrip: 3, percentRefund: 25 },
    ],
    organiserName: "Volta Vibes",
    organiserAvatar: avatar("Akosua Ofori"),
    organiserVerified: true,
    rating: 4.8,
    reviewCount: 64,
    tags: ["Hiking", "Nature", "Waterfall", "Eco"],
    isFeatured: true,
    lat: 7.1239,
    lng: 0.5891,
  },
  {
    id: "trip-3",
    organiserId: "org-2",
    title: "Cape Coast Castle & Canopy Walk",
    description:
      "A reflective weekend through the slave castles of Cape Coast and Elmina, plus the iconic Kakum canopy walk. Heavy history, deep restoration.",
    destination: "Cape Coast, Central Region",
    country: "Ghana",
    type: "cultural",
    coverImage: img("1523805009345-7448845a9e53"),
    images: [
      img("1523805009345-7448845a9e53"),
      img("1591604466107-ec97de577aff"),
      img("1564507592333-c60657eea523"),
    ],
    startDate: addDays(10),
    endDate: addDays(12),
    durationDays: 3,
    priceGhs: 950,
    depositGhs: 350,
    capacity: 20,
    spotsLeft: 3,
    bookingMode: "instant",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Cape Coast",
        description: "Drive down. Sunset at Oasis Beach Resort. Welcome dinner.",
      },
      {
        day: 2,
        title: "Castles & Kakum",
        description:
          "Cape Coast Castle morning tour. Lunch on the beach. Kakum National Park canopy walkway in the afternoon.",
      },
      {
        day: 3,
        title: "Elmina & Departure",
        description: "Elmina Castle and fishing harbour tour. Return to Accra by evening.",
      },
    ],
    inclusions: [
      "2 nights beachfront stay",
      "Breakfast & dinner",
      "All entry fees",
      "Certified guide",
      "Transport",
    ],
    exclusions: ["Lunch on day 1 & 3", "Drinks", "Personal expenses"],
    meetingPoint: "Kotoka Airport pickup point, 7am Saturday",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
    ],
    organiserName: "Coast & Canopy Co.",
    organiserAvatar: avatar("Abena Owusu"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 124,
    tags: ["History", "Culture", "Nature"],
    isFeatured: true,
    lat: 5.105,
    lng: -1.2466,
  },
  {
    id: "trip-4",
    organiserId: "org-3",
    title: "Mole National Park Safari",
    description:
      "Four days in Ghana's largest game reserve. Walking and jeep safaris, elephants at the watering hole, traditional Larabanga mosque visit.",
    destination: "Mole, Northern Ghana",
    country: "Ghana",
    type: "adventure",
    coverImage: img("1516426122078-c23e76319801"),
    images: [
      img("1516426122078-c23e76319801"),
      img("1547471080-7cc2caa01a7e"),
      img("1564507592333-c60657eea523"),
    ],
    startDate: addDays(35),
    endDate: addDays(39),
    durationDays: 5,
    priceGhs: 2400,
    depositGhs: 800,
    capacity: 12,
    spotsLeft: 5,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Tamale (flight)",
        description: "Morning flight to Tamale. Drive to Mole Motel. Sunset at the escarpment.",
      },
      {
        day: 2,
        title: "Morning Walking Safari",
        description: "Dawn safari on foot with armed ranger. Afternoon pool & elephant watching.",
      },
      {
        day: 3,
        title: "Jeep Safari & Larabanga",
        description: "Full-day jeep safari. Visit the ancient Larabanga mosque on return.",
      },
      {
        day: 4,
        title: "Mognori Eco-Village",
        description: "Canoe safari and village homestay experience.",
      },
      {
        day: 5,
        title: "Return to Accra",
        description: "Drive to Tamale, evening flight back to Accra.",
      },
    ],
    inclusions: [
      "Domestic flights",
      "All accommodation",
      "All meals",
      "All safaris & guides",
      "Park fees",
    ],
    exclusions: ["Travel insurance", "Tips", "Souvenirs"],
    meetingPoint: "Kotoka Domestic Terminal, 6am",
    refundPolicy: [
      { daysBeforeTrip: 30, percentRefund: 100 },
      { daysBeforeTrip: 14, percentRefund: 50 },
      { daysBeforeTrip: 7, percentRefund: 25 },
    ],
    organiserName: "Northbound Safaris",
    organiserAvatar: avatar("Kofi Asante"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 198,
    tags: ["Safari", "Wildlife", "Adventure", "Flying"],
    isFeatured: true,
    lat: 9.2603,
    lng: -1.8499,
  },
  {
    id: "trip-5",
    organiserId: "org-8",
    title: "Ada Foah Boat & Beach Weekend",
    description:
      "Set sail along the Volta estuary, sleep in beachfront cabanas, sunrise paddle, evening DJ sets.",
    destination: "Ada Foah",
    country: "Ghana",
    type: "weekend_getaway",
    coverImage: img("1502680390469-be75c86b636f"),
    images: [
      img("1502680390469-be75c86b636f"),
      img("1473496169904-658ba7c44d8a"),
      img("1519046904884-53103b34b206"),
    ],
    startDate: addDays(7),
    endDate: addDays(9),
    durationDays: 3,
    priceGhs: 1250,
    depositGhs: 400,
    capacity: 22,
    spotsLeft: 11,
    bookingMode: "instant",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Arrival & Sunset Sail",
        description: "Check-in at Maranatha Beach Camp. Sunset boat cruise on the Volta.",
      },
      {
        day: 2,
        title: "Beach Day + DJ Night",
        description: "Full beach day. Sundowner DJ set on the sand from 6pm.",
      },
      {
        day: 3,
        title: "Brunch & Return",
        description: "Slow brunch, kayaking, return to Accra by 5pm.",
      },
    ],
    inclusions: ["Beachfront cabana", "All meals", "Boat cruise", "Kayaks", "Transport"],
    exclusions: ["Drinks at bar", "Spa treatments"],
    meetingPoint: "East Legon Shell Station, 8am Friday",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
    ],
    organiserName: "Ada Drift",
    organiserAvatar: avatar("Efua Quarcoo"),
    organiserVerified: true,
    rating: 4.7,
    reviewCount: 52,
    tags: ["Beach", "Boat", "DJ", "Chill"],
    isFeatured: false,
    lat: 5.7833,
    lng: 0.6333,
  },
  {
    id: "trip-6",
    organiserId: "org-7",
    title: "Kumasi Cultural Immersion Weekend",
    description:
      "Inside the Ashanti kingdom. Manhyia Palace, Bonwire kente weavers, Ntonso adinkra printing, traditional drumming workshop.",
    destination: "Kumasi",
    country: "Ghana",
    type: "cultural",
    coverImage: img("1591604466107-ec97de577aff"),
    images: [img("1591604466107-ec97de577aff"), img("1523805009345-7448845a9e53")],
    startDate: addDays(28),
    endDate: addDays(30),
    durationDays: 3,
    priceGhs: 1150,
    depositGhs: 400,
    capacity: 16,
    spotsLeft: 8,
    bookingMode: "instant",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Kumasi",
        description: "Coach to Kumasi. Evening tour of Kejetia market.",
      },
      {
        day: 2,
        title: "Palaces & Craft Villages",
        description: "Manhyia Palace morning. Bonwire kente weaving and Ntonso adinkra workshop.",
      },
      {
        day: 3,
        title: "Drumming + Return",
        description: "Morning drumming and dance workshop. Afternoon coach back.",
      },
    ],
    inclusions: [
      "Round-trip coach",
      "Hotel accommodation",
      "Breakfast & dinner",
      "All workshops",
      "Local guide",
    ],
    exclusions: ["Lunch", "Drinks", "Tips"],
    meetingPoint: "VIP Coach Terminal Circle, 7am Friday",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
    ],
    organiserName: "Kumasi Cultural Co.",
    organiserAvatar: avatar("Kojo Aidoo"),
    organiserVerified: true,
    rating: 4.8,
    reviewCount: 73,
    tags: ["Culture", "Craft", "Music"],
    isFeatured: true,
    lat: 6.6885,
    lng: -1.6244,
  },
  {
    id: "trip-7",
    organiserId: "org-10",
    title: "Aburi Botanical Gardens Day Trip",
    description:
      "A breezy day above Accra. Garden walk, mountain pottery village, sunset at Tetteh Quarshie cocoa farm.",
    destination: "Aburi",
    country: "Ghana",
    type: "weekend_getaway",
    coverImage: img("1500382017468-9049fed747ef"),
    images: [img("1500382017468-9049fed747ef"), img("1469474968028-56623f02e42e")],
    startDate: addDays(5),
    endDate: addDays(5),
    durationDays: 1,
    priceGhs: 280,
    capacity: 25,
    spotsLeft: 17,
    bookingMode: "instant",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "The Whole Day",
        description: "8am pickup, gardens & pottery, lunch on the mountain, return by 7pm.",
      },
    ],
    inclusions: ["Transport", "Lunch", "Entry fees", "Guide"],
    exclusions: ["Drinks", "Souvenirs"],
    meetingPoint: "Accra Mall, 8am",
    refundPolicy: [
      { daysBeforeTrip: 3, percentRefund: 100 },
      { daysBeforeTrip: 1, percentRefund: 50 },
    ],
    organiserName: "Aburi Air",
    organiserAvatar: avatar("Adwoa Frimpong"),
    organiserVerified: false,
    rating: 4.6,
    reviewCount: 29,
    tags: ["Day Trip", "Nature", "Easy"],
    isFeatured: false,
    lat: 5.8497,
    lng: -0.1747,
  },
  {
    id: "trip-8",
    organiserId: "org-5",
    title: "Busua Beach Surf & Chill",
    description:
      "Three days of beginner surf lessons, beachfront cabanas, fresh-from-the-boat seafood. Western Region's gem.",
    destination: "Busua, Western Region",
    country: "Ghana",
    type: "beach",
    coverImage: img("1502680390469-be75c86b636f"),
    images: [img("1502680390469-be75c86b636f"), img("1473496169904-658ba7c44d8a")],
    startDate: addDays(18),
    endDate: addDays(20),
    durationDays: 3,
    priceGhs: 1450,
    depositGhs: 500,
    capacity: 12,
    spotsLeft: 4,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Arrive & First Lesson",
        description: "Afternoon arrival, first surf lesson before sunset.",
      },
      {
        day: 2,
        title: "Surf Day",
        description: "Morning and afternoon surf. Seafood lunch on the beach.",
      },
      {
        day: 3,
        title: "Free Surf + Return",
        description: "Optional sunrise surf, brunch, return to Accra.",
      },
    ],
    inclusions: [
      "3 surf lessons",
      "Board rental",
      "Beachfront stay",
      "All meals",
      "Transport from Takoradi",
    ],
    exclusions: ["Transport from Accra (add GHS 300)", "Drinks"],
    meetingPoint: "Takoradi Mall or Accra add-on bus",
    refundPolicy: [
      { daysBeforeTrip: 14, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
    ],
    organiserName: "Surf Busua",
    organiserAvatar: avatar("Yaw Darko"),
    organiserVerified: true,
    rating: 4.8,
    reviewCount: 91,
    tags: ["Surf", "Beach", "Chill"],
    isFeatured: true,
    lat: 4.7833,
    lng: -1.95,
  },
  {
    id: "trip-9",
    organiserId: "org-3",
    title: "Paga Crocodile Pond & Upper East Explorer",
    description:
      "Northernmost Ghana. Sacred crocodile ponds, Sirigu painted village, Tongo Hills shrine. Off the beaten path.",
    destination: "Paga, Upper East",
    country: "Ghana",
    type: "road_trip",
    coverImage: img("1547471080-7cc2caa01a7e"),
    images: [img("1547471080-7cc2caa01a7e"), img("1516426122078-c23e76319801")],
    startDate: addDays(42),
    endDate: addDays(46),
    durationDays: 5,
    priceGhs: 2100,
    depositGhs: 700,
    capacity: 10,
    spotsLeft: 7,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Tamale",
        description: "Flight to Tamale, overnight rest.",
      },
      {
        day: 2,
        title: "Tamale → Bolga → Paga",
        description: "Drive north. Paga crocodile pond at sunset.",
      },
      {
        day: 3,
        title: "Sirigu Painted Village",
        description: "Workshop with the women artists of Sirigu.",
      },
      {
        day: 4,
        title: "Tongo Hills",
        description: "Sacred shrine hike. Sunset over Bolga.",
      },
      {
        day: 5,
        title: "Return",
        description: "Drive to Tamale, flight back to Accra.",
      },
    ],
    inclusions: ["Flights", "All transport", "Hotels", "All meals", "Guide & entries"],
    exclusions: ["Drinks", "Optional spa", "Tips"],
    meetingPoint: "Kotoka Domestic Terminal, 6am",
    refundPolicy: [
      { daysBeforeTrip: 30, percentRefund: 100 },
      { daysBeforeTrip: 14, percentRefund: 50 },
    ],
    organiserName: "Northbound Safaris",
    organiserAvatar: avatar("Kofi Asante"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 47,
    tags: ["Road Trip", "Culture", "Off Beat"],
    isFeatured: false,
    lat: 10.9833,
    lng: -1.1167,
  },
  {
    id: "trip-10",
    organiserId: "org-2",
    title: "Nzulezo Stilt Village & Ankasa Forest",
    description:
      "Canoe to Nzulezo, the village built on stilts. Then dive into Ankasa's primary rainforest. UNESCO bucket-list.",
    destination: "Nzulezo & Ankasa",
    country: "Ghana",
    type: "adventure",
    coverImage: img("1441974231531-c6227db76b6e"),
    images: [img("1441974231531-c6227db76b6e"), img("1469474968028-56623f02e42e")],
    startDate: addDays(50),
    endDate: addDays(53),
    durationDays: 4,
    priceGhs: 1850,
    depositGhs: 600,
    capacity: 10,
    spotsLeft: 6,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Accra → Beyin",
        description: "Long drive west, overnight in beach lodge.",
      },
      {
        day: 2,
        title: "Canoe to Nzulezo",
        description: "1-hour canoe through wetlands to the stilt village. Lunch with the chief.",
      },
      {
        day: 3,
        title: "Ankasa Forest",
        description: "Dawn forest walk, monkey spotting, river bathing.",
      },
      {
        day: 4,
        title: "Return",
        description: "Drive back to Accra via Takoradi.",
      },
    ],
    inclusions: ["Transport", "Lodge stay", "All meals", "Canoe & guide", "Park fees"],
    exclusions: ["Drinks", "Tips"],
    meetingPoint: "Accra Mall, 6am",
    refundPolicy: [
      { daysBeforeTrip: 21, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 50 },
    ],
    organiserName: "Coast & Canopy Co.",
    organiserAvatar: avatar("Abena Owusu"),
    organiserVerified: true,
    rating: 4.8,
    reviewCount: 38,
    tags: ["Adventure", "UNESCO", "Forest"],
    isFeatured: false,
    lat: 5.0167,
    lng: -2.6833,
  },
  {
    id: "trip-11",
    organiserId: "org-4",
    title: "Lagos City & Lekki Weekend",
    description:
      "Cross-border to Lagos. Eko Atlantic skyline, Lekki art galleries, Afrobeats nightlife. Visa-free for Ghanaians.",
    destination: "Lagos",
    country: "Nigeria",
    type: "international",
    coverImage: img("1564507592333-c60657eea523"),
    images: [img("1564507592333-c60657eea523"), img("1488646953014-85cb44e25828")],
    startDate: addDays(25),
    endDate: addDays(28),
    durationDays: 4,
    priceGhs: 3200,
    depositGhs: 1200,
    capacity: 16,
    spotsLeft: 9,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Fly Accra → Lagos",
        description: "Evening flight. Check in to Victoria Island hotel.",
      },
      {
        day: 2,
        title: "Art & Food Day",
        description: "Nike Art Gallery, Lekki conservation, dinner at Talindo.",
      },
      {
        day: 3,
        title: "Nightlife",
        description: "Beach day, evening shows at The Shrine and Quilox.",
      },
      { day: 4, title: "Return", description: "Brunch & flight home." },
    ],
    inclusions: ["Flights", "3 nights hotel", "Breakfast", "All transfers", "Guide"],
    exclusions: ["Visa (not needed for GH)", "Dinners", "Club entries"],
    meetingPoint: "Kotoka International Terminal, 5pm",
    refundPolicy: [
      { daysBeforeTrip: 21, percentRefund: 100 },
      { daysBeforeTrip: 14, percentRefund: 50 },
    ],
    organiserName: "Lagos Linkup",
    organiserAvatar: avatar("Ama Boateng"),
    organiserVerified: true,
    rating: 4.7,
    reviewCount: 56,
    tags: ["International", "Nightlife", "Art"],
    isFeatured: true,
    lat: 6.5244,
    lng: 3.3792,
  },
  {
    id: "trip-12",
    organiserId: "org-9",
    title: "Dakar Senegal Cultural Exchange",
    description:
      "Five days in Senegal's capital. Gorée Island, sabar drumming workshops, Sandaga market, beachfront art.",
    destination: "Dakar",
    country: "Senegal",
    type: "international",
    coverImage: img("1488646953014-85cb44e25828"),
    images: [img("1488646953014-85cb44e25828"), img("1591604466107-ec97de577aff")],
    startDate: addDays(60),
    endDate: addDays(65),
    durationDays: 6,
    priceGhs: 5400,
    depositGhs: 2000,
    capacity: 12,
    spotsLeft: 8,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Fly to Dakar",
        description: "Arrive evening, dinner of thieboudienne.",
      },
      {
        day: 2,
        title: "Gorée Island",
        description: "Ferry to Gorée, Maison des Esclaves.",
      },
      {
        day: 3,
        title: "Sabar Workshop",
        description: "Drumming and dance lesson with local masters.",
      },
      {
        day: 4,
        title: "Markets & Beaches",
        description: "Sandaga then Yoff beach.",
      },
      { day: 5, title: "Lac Rose", description: "Day trip to the pink lake." },
      {
        day: 6,
        title: "Return",
        description: "Brunch then evening flight back.",
      },
    ],
    inclusions: [
      "Flights",
      "Hotel",
      "Breakfast & 3 dinners",
      "All entries",
      "French-speaking guide",
    ],
    exclusions: ["Visa (not needed for GH)", "Lunches", "Tips"],
    meetingPoint: "Kotoka International, 3pm",
    refundPolicy: [
      { daysBeforeTrip: 30, percentRefund: 100 },
      { daysBeforeTrip: 14, percentRefund: 40 },
    ],
    organiserName: "Continental Crew",
    organiserAvatar: avatar("Nana Adjei"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 41,
    tags: ["International", "Culture", "Music"],
    isFeatured: false,
    lat: 14.7167,
    lng: -17.4677,
  },
  {
    id: "trip-13",
    organiserId: "org-4",
    title: "Abidjan Fashion & Food Weekend",
    description:
      "A weekend in Côte d'Ivoire's chicest city. Cocody boutiques, plage de Bassam, attiéké tasting tour.",
    destination: "Abidjan",
    country: "Côte d'Ivoire",
    type: "international",
    coverImage: img("1488646953014-85cb44e25828"),
    images: [img("1488646953014-85cb44e25828")],
    startDate: addDays(33),
    endDate: addDays(36),
    durationDays: 4,
    priceGhs: 3600,
    depositGhs: 1200,
    capacity: 14,
    spotsLeft: 10,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Arrive Abidjan",
        description: "Evening flight. Dinner in Marcory.",
      },
      {
        day: 2,
        title: "Cocody Day",
        description: "Boutique tour, gallery visits, lunch at Saakan.",
      },
      {
        day: 3,
        title: "Grand Bassam",
        description: "Day at the UNESCO heritage town & beach.",
      },
      { day: 4, title: "Return", description: "Brunch & return." },
    ],
    inclusions: ["Flights", "Hotel", "Breakfast", "Local guide", "Transfers"],
    exclusions: ["Dinners", "Boutique purchases"],
    meetingPoint: "Kotoka International, 6am",
    refundPolicy: [
      { daysBeforeTrip: 21, percentRefund: 100 },
      { daysBeforeTrip: 7, percentRefund: 40 },
    ],
    organiserName: "Lagos Linkup",
    organiserAvatar: avatar("Ama Boateng"),
    organiserVerified: true,
    rating: 4.7,
    reviewCount: 22,
    tags: ["International", "Fashion", "Foodie"],
    isFeatured: false,
    lat: 5.359951,
    lng: -4.008256,
  },
  {
    id: "trip-14",
    organiserId: "org-9",
    title: "Victoria Falls Adventure",
    description:
      "The smoke that thunders. Helicopter tours, devil's pool swim, sunset cruises on the Zambezi.",
    destination: "Victoria Falls",
    country: "Zimbabwe",
    type: "international",
    coverImage: img("1469474968028-56623f02e42e"),
    images: [img("1469474968028-56623f02e42e"), img("1441974231531-c6227db76b6e")],
    startDate: addDays(75),
    endDate: addDays(80),
    durationDays: 6,
    priceGhs: 8900,
    depositGhs: 3000,
    capacity: 10,
    spotsLeft: 6,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Fly to Vic Falls",
        description: "Multi-leg flight via Joburg.",
      },
      {
        day: 2,
        title: "Falls Tour",
        description: "Rainforest walk, photo points.",
      },
      {
        day: 3,
        title: "Helicopter & Sunset Cruise",
        description: "Aerial views, Zambezi sundowner.",
      },
      {
        day: 4,
        title: "Devil's Pool",
        description: "Swim at the edge (seasonal).",
      },
      {
        day: 5,
        title: "Game Drive",
        description: "Chobe day trip (Botswana).",
      },
      { day: 6, title: "Return", description: "Long return to Accra." },
    ],
    inclusions: ["Flights", "Lodge stay", "All meals", "All activities", "Guides"],
    exclusions: ["Visas", "Tips", "Spa"],
    meetingPoint: "Kotoka International",
    refundPolicy: [
      { daysBeforeTrip: 45, percentRefund: 100 },
      { daysBeforeTrip: 21, percentRefund: 30 },
    ],
    organiserName: "Continental Crew",
    organiserAvatar: avatar("Nana Adjei"),
    organiserVerified: true,
    rating: 5.0,
    reviewCount: 18,
    tags: ["Bucket List", "Adventure", "Luxury"],
    isFeatured: true,
    lat: -17.9243,
    lng: 25.8572,
  },
  {
    id: "trip-15",
    organiserId: "org-9",
    title: "Zanzibar Island Retreat",
    description:
      "Seven days in Stone Town and Nungwi. Spice tours, dhow sunset cruises, turquoise water all day.",
    destination: "Zanzibar",
    country: "Tanzania",
    type: "international",
    coverImage: img("1473496169904-658ba7c44d8a"),
    images: [img("1473496169904-658ba7c44d8a"), img("1502680390469-be75c86b636f")],
    startDate: addDays(90),
    endDate: addDays(97),
    durationDays: 8,
    priceGhs: 12500,
    depositGhs: 4500,
    capacity: 14,
    spotsLeft: 11,
    bookingMode: "manual",
    status: "live",
    itinerary: [
      {
        day: 1,
        title: "Fly to Zanzibar",
        description: "Via Nairobi or Addis.",
      },
      {
        day: 2,
        title: "Stone Town",
        description: "Old town walking tour, Freddie Mercury house.",
      },
      {
        day: 3,
        title: "Spice Tour",
        description: "Spice plantation visit, cooking class.",
      },
      { day: 4, title: "Nungwi", description: "Move to beach resort." },
      {
        day: 5,
        title: "Dhow Cruise",
        description: "Sunset sail, fresh seafood dinner.",
      },
      {
        day: 6,
        title: "Beach Day",
        description: "Snorkelling at Mnemba Atoll.",
      },
      { day: 7, title: "Free Day", description: "Spa, beach, more spa." },
      { day: 8, title: "Return", description: "Long flight home." },
    ],
    inclusions: ["Flights", "All accommodation", "Breakfast", "Tours & guides"],
    exclusions: ["Dinners (some)", "Visas", "Tips"],
    meetingPoint: "Kotoka International",
    refundPolicy: [
      { daysBeforeTrip: 60, percentRefund: 100 },
      { daysBeforeTrip: 30, percentRefund: 40 },
    ],
    organiserName: "Continental Crew",
    organiserAvatar: avatar("Nana Adjei"),
    organiserVerified: true,
    rating: 4.9,
    reviewCount: 33,
    tags: ["Beach", "Luxury", "Island"],
    isFeatured: true,
    lat: -6.1659,
    lng: 39.2026,
  },
];

// ───────────────────────────── Travellers ─────────────────────────────
export const travellers: Traveller[] = [
  {
    id: "trav-1",
    name: "Akua Sarpong",
    email: "traveller@vaybeex.com",
    phone: "+233 24 555 0001",
    avatar: avatar("Akua Sarpong"),
    city: "Accra",
    joinedAt: "2023-04-12",
    totalTrips: 6,
    completedTrips: 4,
    wishlist: ["trip-4", "trip-14", "trip-15"],
  },
  {
    id: "trav-2",
    name: "Kwabena Owusu",
    email: "kwabena@mail.com",
    phone: "+233 24 555 0002",
    avatar: avatar("Kwabena Owusu"),
    city: "Accra",
    joinedAt: "2023-05-10",
    totalTrips: 3,
    completedTrips: 3,
    wishlist: [],
  },
  {
    id: "trav-3",
    name: "Esi Mensah",
    email: "esi@mail.com",
    phone: "+233 24 555 0003",
    avatar: avatar("Esi Mensah"),
    city: "Kumasi",
    joinedAt: "2023-07-22",
    totalTrips: 2,
    completedTrips: 2,
    wishlist: [],
  },
  {
    id: "trav-4",
    name: "Kweku Adjei",
    email: "kweku@mail.com",
    phone: "+233 24 555 0004",
    avatar: avatar("Kweku Adjei"),
    city: "Takoradi",
    joinedAt: "2024-01-15",
    totalTrips: 1,
    completedTrips: 1,
    wishlist: [],
  },
  {
    id: "trav-5",
    name: "Maame Asante",
    email: "maame@mail.com",
    phone: "+233 24 555 0005",
    avatar: avatar("Maame Asante"),
    city: "Tema",
    joinedAt: "2023-09-04",
    totalTrips: 4,
    completedTrips: 3,
    wishlist: [],
  },
  {
    id: "trav-6",
    name: "Ebo Quarcoo",
    email: "ebo@mail.com",
    phone: "+233 24 555 0006",
    avatar: avatar("Ebo Quarcoo"),
    city: "Cape Coast",
    joinedAt: "2024-02-19",
    totalTrips: 2,
    completedTrips: 2,
    wishlist: [],
  },
  {
    id: "trav-7",
    name: "Adwoa Bediako",
    email: "adwoa@mail.com",
    phone: "+233 24 555 0007",
    avatar: avatar("Adwoa Bediako"),
    city: "Accra",
    joinedAt: "2024-03-01",
    totalTrips: 1,
    completedTrips: 0,
    wishlist: [],
  },
  {
    id: "trav-8",
    name: "Nana Akoto",
    email: "nana@mail.com",
    phone: "+233 24 555 0008",
    avatar: avatar("Nana Akoto"),
    city: "Tamale",
    joinedAt: "2023-11-30",
    totalTrips: 5,
    completedTrips: 5,
    wishlist: [],
  },
  {
    id: "trav-9",
    name: "Yaw Boateng",
    email: "yaw@mail.com",
    phone: "+233 24 555 0009",
    avatar: avatar("Yaw Boateng"),
    city: "Sunyani",
    joinedAt: "2024-04-08",
    totalTrips: 2,
    completedTrips: 1,
    wishlist: [],
  },
  {
    id: "trav-10",
    name: "Abena Frimpong",
    email: "abena.f@mail.com",
    phone: "+233 24 555 0010",
    avatar: avatar("Abena Frimpong"),
    city: "Accra",
    joinedAt: "2023-12-12",
    totalTrips: 3,
    completedTrips: 2,
    wishlist: [],
  },
];

export const currentTravellerId = "trav-1";

// ───────────────────────────── Bookings ─────────────────────────────
const tripById = (id: string) => trips.find((t) => t.id === id)!;
const mkBooking = (
  partial: Omit<Booking, "tripTitle" | "tripDestination" | "tripCoverImage" | "organiserName">,
): Booking => {
  const trip = tripById(partial.tripId);
  return {
    ...partial,
    tripTitle: trip.title,
    tripDestination: trip.destination,
    tripCoverImage: trip.coverImage,
    organiserName: trip.organiserName,
  };
};

export const bookings: Booking[] = [
  mkBooking({
    id: "VX-A1B2C3D4",
    tripId: "trip-1",
    travellerId: "trav-1",
    organiserId: "org-1",
    status: "approved",
    paymentStatus: "fully_paid",
    amountPaidGhs: 850,
    spots: 1,
    applicationAnswers: {
      emergencyContact: "Mama Akua · +233 24 111 2233",
      dietary: "No alcohol",
    },
    appliedAt: addDays(-3),
    confirmedAt: addDays(-2),
    tripStartDate: trips[0].startDate,
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-E5F6G7H8",
    tripId: "trip-3",
    travellerId: "trav-1",
    organiserId: "org-2",
    status: "pending",
    paymentStatus: "unpaid",
    amountPaidGhs: 0,
    spots: 2,
    applicationAnswers: {
      emergencyContact: "Papa Sarpong · +233 24 444 5566",
      dietary: "Vegetarian",
    },
    appliedAt: addDays(-1),
    tripStartDate: trips[2].startDate,
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-I9J0K1L2",
    tripId: "trip-2",
    travellerId: "trav-1",
    organiserId: "org-6",
    status: "approved",
    paymentStatus: "deposit_paid",
    amountPaidGhs: 400,
    spots: 1,
    applicationAnswers: {
      emergencyContact: "Sister Sarpong · +233 24 777 8899",
      dietary: "None",
    },
    appliedAt: addDays(-7),
    confirmedAt: addDays(-5),
    tripStartDate: trips[1].startDate,
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-M3N4O5P6",
    tripId: "trip-6",
    travellerId: "trav-1",
    organiserId: "org-7",
    status: "completed",
    paymentStatus: "fully_paid",
    amountPaidGhs: 1150,
    spots: 1,
    applicationAnswers: {},
    appliedAt: addDays(-45),
    confirmedAt: addDays(-43),
    tripStartDate: addDays(-20),
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-Q7R8S9T0",
    tripId: "trip-7",
    travellerId: "trav-1",
    organiserId: "org-10",
    status: "completed",
    paymentStatus: "fully_paid",
    amountPaidGhs: 280,
    spots: 2,
    applicationAnswers: {},
    appliedAt: addDays(-60),
    confirmedAt: addDays(-59),
    tripStartDate: addDays(-40),
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-U1V2W3X4",
    tripId: "trip-11",
    travellerId: "trav-1",
    organiserId: "org-4",
    status: "rejected",
    paymentStatus: "refunded",
    amountPaidGhs: 0,
    spots: 1,
    applicationAnswers: {},
    appliedAt: addDays(-10),
    tripStartDate: trips[10].startDate,
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
  mkBooking({
    id: "VX-Y5Z6A7B8",
    tripId: "trip-5",
    travellerId: "trav-1",
    organiserId: "org-8",
    status: "cancelled",
    paymentStatus: "refunded",
    amountPaidGhs: 0,
    spots: 1,
    applicationAnswers: {},
    appliedAt: addDays(-15),
    tripStartDate: trips[4].startDate,
    travellerName: "Akua Sarpong",
    travellerAvatar: avatar("Akua Sarpong"),
  }),
];

// ───────────────────────────── Reviews ─────────────────────────────
const reviewerSeeds = [
  "Adwoa Bediako",
  "Kwabena Owusu",
  "Esi Mensah",
  "Kweku Adjei",
  "Maame Asante",
  "Ebo Quarcoo",
  "Nana Akoto",
  "Yaw Boateng",
  "Abena Frimpong",
  "Kofi Brew",
];

const reviewSnippets = [
  "Genuinely the best weekend I've had all year. Kwame's energy is unmatched — every detail was thought through. Already booking my next one.",
  "Showed up nervous, left with 12 new friends. The bonfire night will live in my head rent-free.",
  "Organiser was super responsive on WhatsApp. Pickup was on time, food was incredible, vibes were immaculate.",
  "The hike was tougher than I expected but the guide was patient with all of us. Wli Falls is unreal in person.",
  "Worth every cedi. Cape Coast Castle tour is heavy but necessary, and Kakum at sunset is magic.",
  "Smooth operation start to finish. The Northern Ghana itinerary is gold — Mole at 6am is unforgettable.",
  "Loved the small group size. Felt curated, not packaged. Will book Continental Crew again.",
  "Dakar exchange exceeded my expectations. Sabar workshop was the highlight. Nana really knows her stuff.",
  "First international trip on my own, and it was perfect. Lagos energy is unmatched.",
  "Beach cabana was basic but clean, and the boat sunset cruise was top tier.",
];

export const reviews: Review[] = Array.from({ length: 28 }).map((_, i) => {
  const trip = trips[i % trips.length];
  const seed = reviewerSeeds[i % reviewerSeeds.length];
  return {
    id: `rev-${i + 1}`,
    tripId: trip.id,
    bookingId: `b-${i + 1}`,
    travellerId: `trav-${(i % 10) + 1}`,
    travellerName: seed,
    travellerAvatar: avatar(seed),
    rating: i % 7 === 0 ? 4 : 5,
    comment: reviewSnippets[i % reviewSnippets.length],
    createdAt: addDays(-(i * 3 + 5)),
    isVerified: true,
  };
});

// ───────────────────────────── Notifications (traveller) ─────────────────────────────
export const notifications: Notification[] = [
  {
    id: "n-1",
    userId: "trav-1",
    type: "booking_approved",
    title: "You're in! Labadi Beach Weekend",
    message: "Sankofa Expeditions confirmed your booking. Pack your swimwear ✨",
    isRead: false,
    createdAt: addDays(-2),
    tripId: "trip-1",
    bookingId: "VX-A1B2C3D4",
  },
  {
    id: "n-2",
    userId: "trav-1",
    type: "trip_reminder",
    title: "3 days to Wli Waterfalls",
    message: "Don't forget your hiking boots and 2L of water. Meeting at 37 Tro-tro at 6am.",
    isRead: false,
    createdAt: addDays(-1),
    tripId: "trip-2",
    bookingId: "VX-I9J0K1L2",
  },
  {
    id: "n-3",
    userId: "trav-1",
    type: "payment_received",
    title: "Payment received",
    message: "GHS 850 paid for Labadi Beach Weekend. Ref: VX-A1B2C3D4",
    isRead: true,
    createdAt: addDays(-2),
    bookingId: "VX-A1B2C3D4",
  },
  {
    id: "n-4",
    userId: "trav-1",
    type: "booking_rejected",
    title: "Application not accepted",
    message: "Lagos Linkup couldn't accommodate your application for Lagos City Weekend.",
    isRead: true,
    createdAt: addDays(-9),
    tripId: "trip-11",
  },
  {
    id: "n-5",
    userId: "trav-1",
    type: "new_review",
    title: "Time to review Aburi Gardens",
    message: "How was your trip? Share your experience so others can find great organisers.",
    isRead: false,
    createdAt: addDays(-38),
    bookingId: "VX-Q7R8S9T0",
  },
  {
    id: "n-6",
    userId: "trav-1",
    type: "welcome",
    title: "Welcome to VaybeEx, Akua!",
    message: "Discover curated group trips across Ghana and West Africa.",
    isRead: true,
    createdAt: "2023-04-12",
  },
];

// ───────────────────────────── Conversations ─────────────────────────────
export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participantIds: ["trav-1", "org-1"],
    participantName: "Kwame · Sankofa Expeditions",
    participantAvatar: avatar("Kwame Mensah"),
    participantRole: "organiser",
    tripId: "trip-1",
    tripTitle: "Labadi Beach Weekend Escape",
    lastMessage: "Perfect, see you Friday at 9am sharp 🌊",
    lastMessageAt: addDays(-1),
    unreadCount: 1,
    messages: [
      {
        id: "m-1",
        senderId: "trav-1",
        content: "Hi! Just confirming — can I bring a small speaker?",
        timestamp: addDays(-2),
        isRead: true,
      },
      {
        id: "m-2",
        senderId: "org-1",
        content: "Absolutely, beach side anything goes. Keep volume reasonable after 11pm 🙏",
        timestamp: addDays(-2),
        isRead: true,
      },
      {
        id: "m-3",
        senderId: "trav-1",
        content: "Got it! Also do you have vegetarian options at dinner?",
        timestamp: addDays(-1),
        isRead: true,
      },
      {
        id: "m-4",
        senderId: "org-1",
        content: "Yes — we have a great grilled veg + jollof option lined up.",
        timestamp: addDays(-1),
        isRead: true,
      },
      {
        id: "m-5",
        senderId: "org-1",
        content: "Perfect, see you Friday at 9am sharp 🌊",
        timestamp: addDays(-1),
        isRead: false,
      },
    ],
  },
  {
    id: "conv-2",
    participantIds: ["trav-1", "org-6"],
    participantName: "Akosua · Volta Vibes",
    participantAvatar: avatar("Akosua Ofori"),
    participantRole: "organiser",
    tripId: "trip-2",
    tripTitle: "Wli Waterfalls Hiking Adventure",
    lastMessage: "Bring 2L of water minimum, and good shoes 💪",
    lastMessageAt: addDays(-4),
    unreadCount: 0,
    messages: [
      {
        id: "m-6",
        senderId: "trav-1",
        content: "Hey, what's the difficulty level on the upper falls?",
        timestamp: addDays(-5),
        isRead: true,
      },
      {
        id: "m-7",
        senderId: "org-6",
        content:
          "Moderate — about 3hrs round trip, some steep parts. Anyone reasonably fit will be fine.",
        timestamp: addDays(-5),
        isRead: true,
      },
      {
        id: "m-8",
        senderId: "org-6",
        content: "Bring 2L of water minimum, and good shoes 💪",
        timestamp: addDays(-4),
        isRead: true,
      },
    ],
  },
  {
    id: "conv-3",
    participantIds: ["trav-1", "org-2"],
    participantName: "Abena · Coast & Canopy Co.",
    participantAvatar: avatar("Abena Owusu"),
    participantRole: "organiser",
    tripId: "trip-3",
    tripTitle: "Cape Coast Castle & Canopy Walk",
    lastMessage: "Reviewing your application this evening — back to you tomorrow ✨",
    lastMessageAt: addDays(-1),
    unreadCount: 1,
    messages: [
      {
        id: "m-9",
        senderId: "trav-1",
        content:
          "Hi Abena, just submitted my application for 2 spots — let me know if you need anything else!",
        timestamp: addDays(-1),
        isRead: true,
      },
      {
        id: "m-10",
        senderId: "org-2",
        content: "Reviewing your application this evening — back to you tomorrow ✨",
        timestamp: addDays(-1),
        isRead: false,
      },
    ],
  },
];

// ───────────────────────────── Stats (for landing) ─────────────────────────────
export const platformHighlights = [
  { label: "Trips posted", value: 500, suffix: "+" },
  { label: "Travellers on board", value: 12000, suffix: "+" },
  { label: "Average rating", value: 4.8, suffix: "★" },
  { label: "Destinations", value: 50, suffix: "+" },
  { label: "Verified organisers", value: 80, suffix: "+" },
];

export const destinations = [
  { name: "Accra", image: img("1564507592333-c60657eea523"), tripsCount: 6 },
  {
    name: "Volta Region",
    image: img("1469474968028-56623f02e42e"),
    tripsCount: 4,
  },
  {
    name: "Cape Coast",
    image: img("1523805009345-7448845a9e53"),
    tripsCount: 3,
  },
  {
    name: "Northern Ghana",
    image: img("1516426122078-c23e76319801"),
    tripsCount: 3,
  },
  { name: "Ada Foah", image: img("1502680390469-be75c86b636f"), tripsCount: 2 },
  {
    name: "West Africa",
    image: img("1488646953014-85cb44e25828"),
    tripsCount: 5,
  },
];

// ───────────────────────────── Async helpers ─────────────────────────────
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function fetchTrips(filter?: { type?: TripType; q?: string }) {
  await delay(600);
  let res = trips.filter((t) => t.status === "live");
  if (filter?.type) res = res.filter((t) => t.type === filter.type);
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    res = res.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q),
    );
  }
  return res;
}
export async function fetchTrip(id: string) {
  await delay(400);
  return trips.find((t) => t.id === id) ?? null;
}
export async function fetchBookingsForTraveller(id: string) {
  await delay(400);
  return bookings.filter((b) => b.travellerId === id);
}
export async function fetchBooking(id: string) {
  await delay(300);
  return bookings.find((b) => b.id === id) ?? null;
}
export async function fetchReviewsForTrip(tripId: string) {
  await delay(300);
  return reviews.filter((r) => r.tripId === tripId);
}
export async function fetchConversations() {
  await delay(300);
  return conversations;
}
export async function fetchNotifications(userId: string) {
  await delay(200);
  return notifications.filter((n) => n.userId === userId);
}

import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  Big_Shoulders,
} from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { GoogleAuthProvider } from "@/components/auth/google-auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { SplashScreen } from "@/components/splash-screen";
import { JsonLd } from "@/components/seo/json-ld";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : "https://vaybeex.com";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VaybeEx — Discover & Book Group Trips",
    template: "%s | VaybeEx",
  },
  description:
    "VaybeEx (vaybeex) — curated group travel experiences across Ghana and West Africa. Browse expeditions, book adventures, and track your trips.",
  keywords: [
    "VaybeEx",
    "vaybeex",
    "Vaybe Ex",
    "group travel",
    "Ghana travel",
    "West Africa tours",
    "book trips",
    "travel marketplace",
    "expeditions",
    "adventure travel",
    "organizer platform",
  ],
  authors: [{ name: "VaybeEx" }],
  creator: "VaybeEx",
  publisher: "VaybeEx",
  applicationName: "VaybeEx",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "VaybeEx",
    title: "VaybeEx — Discover & Book Group Trips",
    description:
      "VaybeEx — curated group travel experiences across Ghana and West Africa. Browse expeditions, book adventures, and track your trips.",
    images: [
      {
        url: "/images/web_logo.png",
        width: 512,
        height: 512,
        alt: "VaybeEx",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VaybeEx — Discover & Book Group Trips",
    description:
      "VaybeEx — curated group travel experiences across Ghana and West Africa.",
    images: ["/images/web_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/web_logo.png", type: "image/png" }],
    apple: [{ url: "/images/web_logo.png", type: "image/png" }],
    shortcut: ["/images/web_logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jakarta.variable} ${bigShoulders.variable} h-full overflow-x-clip antialiased`}
    >
      <body
        className="min-h-full flex flex-col overflow-x-clip bg-stone-50 overscroll-x-none"
        suppressHydrationWarning
      >
        <JsonLd />
        <ViewTransitions>
          <AuthProvider>
            <GoogleAuthProvider>
              <SplashScreen />
              <Navbar />
              <main className="flex-1 overflow-x-clip">{children}</main>
              <ConditionalFooter />
              <Toaster position="top-right" richColors />
            </GoogleAuthProvider>
          </AuthProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}

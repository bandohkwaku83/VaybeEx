import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — VaybeEx",
  description:
    "How VaybeEx collects, uses, and protects personal data under Ghana’s Data Protection Act, 2012 (Act 843).",
};

const LAST_UPDATED = "22 July 2026";
const SUPPORT_EMAIL = "support@vaybeex.com";

const SECTIONS = [
  { id: "intro", label: "1. Introduction" },
  { id: "controller", label: "2. Who controls your data" },
  { id: "collect", label: "3. What we collect" },
  { id: "sources", label: "4. Where data comes from" },
  { id: "use", label: "5. Why we use it" },
  { id: "legal-basis", label: "6. Legal bases (Act 843)" },
  { id: "share", label: "7. Who we share with" },
  { id: "retention", label: "8. How long we keep it" },
  { id: "security", label: "9. How we protect it" },
  { id: "rights", label: "10. Your rights" },
  { id: "cookies", label: "11. Cookies & devices" },
  { id: "children", label: "12. Children" },
  { id: "transfers", label: "13. Transfers outside Ghana" },
  { id: "organizers", label: "14. When organizers see your data" },
  { id: "changes", label: "15. Changes to this Policy" },
  { id: "contact", label: "16. Contact & complaints" },
] as const;

export default function PrivacyPage() {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196, 134, 76, 0.18), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--gold)" }}
        >
          Legal
        </p>
        <h1
          className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ color: "var(--primary-dark)" }}
        >
          Privacy Policy
        </h1>
        <p
          className="mt-4 max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          This Policy explains what personal data VaybeEx collects, why we use
          it, who can see it, how long we keep it, and how you can exercise your
          rights under Ghana&apos;s{" "}
          <em>Data Protection Act, 2012 (Act 843)</em>. It is about{" "}
          <em>information</em>, not about booking rules, refunds, or trip
          duties — those live in the{" "}
          <Link
            href="/terms"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Terms &amp; Conditions
          </Link>
          .
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Last updated: {LAST_UPDATED}
        </p>

        <nav
          className="mt-10 rounded-2xl border p-5 sm:p-6"
          style={{
            borderColor: "var(--border)",
            background: "rgba(255,255,255,0.65)",
          }}
          aria-label="Table of contents"
        >
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: "var(--primary-dark)" }}
          >
            Contents
          </p>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm transition-colors hover:underline"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article
          className="mt-12 space-y-12 text-[15px] leading-7"
          style={{ color: "var(--text-secondary)" }}
        >
          <Section id="intro" title="1. Introduction">
            <p>
              Personal data means information that identifies you (or can
              reasonably identify you) — for example your name, phone number,
              email, ID document, booking history, or device identifiers.
            </p>
            <p>
              By creating an account, verifying as an organizer, or completing a
              booking, you acknowledge that we will process personal data as
              described here. Where Act 843 requires consent for a specific use
              (such as optional marketing), we will ask for it separately.
            </p>
          </Section>

          <Section id="controller" title="2. Who controls your data">
            <p>
              VaybeEx decides why and how personal data is processed on the
              Platform (the data controller for Platform operations). Day-to-day
              privacy questions go to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <p>
              Licensed payment companies and SMS providers process some payment
              and messaging data under their own systems when you pay or receive
              alerts. Trip organizers receive limited traveler details to run a
              booked trip; for that delivery purpose they handle that data as
              described in Section 14.
            </p>
          </Section>

          <Section id="collect" title="3. What we collect">
            <p>We only collect what we need for the Platform. Categories include:</p>

            <h3
              className="mt-5 font-display text-base font-semibold"
              style={{ color: "var(--primary-dark)" }}
            >
              Identity &amp; contact
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>full name, email, phone number, city or region;</li>
              <li>profile photo and public bio or brand name (especially organizers);</li>
              <li>
                for organizer verification: national ID or similar documents and
                verification outcome.
              </li>
            </ul>

            <h3
              className="mt-5 font-display text-base font-semibold"
              style={{ color: "var(--primary-dark)" }}
            >
              Transaction &amp; trip records
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                trips viewed or wishlisted, bookings, seat counts, payment status,
                cancellation and refund records;
              </li>
              <li>
                payment metadata (amount, currency, method type such as MoMo or
                card, provider references) — not full card PAN/CVV on our servers
                when a licensed processor handles the card;
              </li>
              <li>
                payout or withdrawal details needed to send organizer funds.
              </li>
            </ul>

            <h3
              className="mt-5 font-display text-base font-semibold"
              style={{ color: "var(--primary-dark)" }}
            >
              Communications &amp; support
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                messages sent through the Platform and content of support emails;
              </li>
              <li>
                records that an SMS or email notice was sent (and related
                delivery logs from providers).
              </li>
            </ul>

            <h3
              className="mt-5 font-display text-base font-semibold"
              style={{ color: "var(--primary-dark)" }}
            >
              Device &amp; usage
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                IP address, browser or device type, approximate network location,
                pages visited, and error logs;
              </li>
              <li>cookies or similar tech for sessions and security (Section 11).</li>
            </ul>
          </Section>

          <Section id="sources" title="4. Where data comes from">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong style={{ color: "var(--text)" }}>You</strong> — forms,
                uploads, bookings, messages, and settings;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Your device</strong> —
                automatic technical data when you use the site or app;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>
                  Payment &amp; messaging partners
                </strong>{" "}
                — confirmation that a payment or SMS succeeded or failed;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Organizers or travelers</strong>{" "}
                — limited details the other party needs for a shared booking
                (for example traveler name on a roster).
              </li>
            </ul>
          </Section>

          <Section id="use" title="5. Why we use it">
            <p>We use personal data to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>register and authenticate accounts;</li>
              <li>
                operate listings, bookings, escrow-style fund holding, refunds,
                and organizer withdrawals;
              </li>
              <li>verify organizers and reduce fraud or abuse;</li>
              <li>
                send transactional notices (confirmations, reminders, payment
                updates) by email or SMS;
              </li>
              <li>
                send marketing only if you opt in (or where law otherwise allows)
                — you can stop marketing anytime;
              </li>
              <li>answer support requests and improve Platform reliability;</li>
              <li>
                meet legal duties and protect the Platform, users, and the public.
              </li>
            </ul>
            <p className="mt-3">
              We do not use your data to make automated decisions that produce
              legal effects about you without human involvement, other than
              routine fraud or security filters.
            </p>
          </Section>

          <Section id="legal-basis" title="6. Legal bases (Act 843)">
            <p>
              Under the <em>Data Protection Act, 2012 (Act 843)</em>, processing
              must be for a lawful purpose. We rely on:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong style={{ color: "var(--text)" }}>Consent</strong> —
                optional marketing; certain sensitive verification uploads where
                consent is the right ground;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Contract</strong> —
                data needed to create your account, complete a booking, or pay
                out an organizer;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Legal obligation</strong>{" "}
                — tax, accounting, law-enforcement, or regulatory requirements;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>
                  Legitimate interest
                </strong>{" "}
                — Platform security, fraud prevention, and service improvement,
                balanced against your rights.
              </li>
            </ul>
            <p className="mt-3">
              We aim to keep data adequate, relevant, not excessive, and as
              accurate as practicable for those purposes.
            </p>
          </Section>

          <Section id="share" title="7. Who we share with">
            <p>We share personal data only as needed:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong style={{ color: "var(--text)" }}>Organizers</strong> —
                name, contact, seat count, and booking status so they can run
                your trip;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>
                  Payment &amp; SMS providers
                </strong>{" "}
                — to process MoMo/card/bank payments and deliver notices;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Vendors</strong> —
                hosting, email, analytics, or support tools under our
                instructions;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Authorities</strong> —
                when Ghanaian law, a court order, or urgent safety requires it;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>
                  Successors
                </strong>{" "}
                — if VaybeEx is sold or restructured, with continued protection
                of your data.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong style={{ color: "var(--text)" }}>not sell</strong>{" "}
              personal data.
            </p>
          </Section>

          <Section id="retention" title="8. How long we keep it">
            <p>
              We keep data only as long as needed for the purposes above, then
              delete or anonymise it unless a longer period is required by law.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong style={{ color: "var(--text)" }}>Account profile</strong>{" "}
                — while the account is open, then a short wind-down period for
                disputes or reactivation;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>
                  Bookings &amp; payments
                </strong>{" "}
                — for refunds, chargebacks, accounting, and statutory records;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>ID documents</strong> —
                while verification is relevant to organizer status, then securely
                removed or reduced to a verification flag where possible;
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Support logs</strong> —
                while useful to resolve issues, then archived or deleted.
              </li>
            </ul>
          </Section>

          <Section id="security" title="9. How we protect it">
            <p>
              We use access controls, encryption in transit where supported,
              staff need-to-know limits, and vendor checks appropriate to the
              sensitivity of the data (especially ID documents and payment
              metadata).
            </p>
            <p>
              No online system is perfectly secure. If a breach creates a
              significant risk to you, we will take steps consistent with Act 843
              and notify you and/or the Data Protection Commission when required.
            </p>
          </Section>

          <Section id="rights" title="10. Your rights">
            <p>Under Act 843 (and subject to legal exceptions), you may ask to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>access personal data we hold about you;</li>
              <li>correct data that is wrong or incomplete;</li>
              <li>
                withdraw consent where processing is based on consent (this does
                not undo earlier lawful processing);
              </li>
              <li>
                request deletion when data is no longer needed or processing is
                unlawful — unless we must keep it for law or ongoing disputes;
              </li>
              <li>object to certain processing, including marketing;</li>
              <li>complain to the Data Protection Commission (Section 16).</li>
            </ul>
            <p className="mt-3">
              Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              with your request. We may verify your identity first and will
              respond within a reasonable time.
            </p>
          </Section>

          <Section id="cookies" title="11. Cookies &amp; devices">
            <p>We use cookies and similar technologies to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>keep you signed in and protect sessions;</li>
              <li>remember basic preferences;</li>
              <li>measure traffic and fix technical problems in aggregate.</li>
            </ul>
            <p className="mt-3">
              Browser settings can block cookies. Blocking essential cookies may
              break login or checkout.
            </p>
          </Section>

          <Section id="children" title="12. Children">
            <p>
              Accounts are for people 18+. We do not knowingly collect children&apos;s
              data for registration. If a minor joins a trip, an adult should
              supply any needed details as set out in the Terms.
            </p>
            <p>
              If you think we hold a child&apos;s data in error, contact{" "}
              {SUPPORT_EMAIL} and we will delete it where appropriate.
            </p>
          </Section>

          <Section id="transfers" title="13. Transfers outside Ghana">
            <p>
              Some vendors (hosting, email, analytics) may process data outside
              Ghana. When that happens, we take reasonable steps — including
              contracts where appropriate — so the data still receives protection
              consistent with Act 843.
            </p>
          </Section>

          <Section id="organizers" title="14. When organizers see your data">
            <p>
              After you book, the organizer typically receives your name, contact
              details, and booking specifics needed to run the trip. They must:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>use that data only for the trip and related support;</li>
              <li>keep it secure and not sell or spam it;</li>
              <li>
                follow Act 843 and stop using it when the trip purpose ends
                (subject to any legal retention).
              </li>
            </ul>
            <p className="mt-3">
              Misuse can lead to account suspension. Independent misuse outside
              our control is the organizer&apos;s responsibility; report concerns
              to {SUPPORT_EMAIL}.
            </p>
          </Section>

          <Section id="changes" title="15. Changes to this Policy">
            <p>
              We may update this Policy. The &ldquo;Last updated&rdquo; date will
              change when we do. Material changes may be notified on the
              Platform, by email, or SMS. Where Act 843 requires new consent for
              a new use, we will ask for it.
            </p>
          </Section>

          <Section id="contact" title="16. Contact &amp; complaints">
            <p>
              Privacy requests:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p className="mt-3">
              If we cannot resolve your concern, you may complain to Ghana&apos;s{" "}
              <strong style={{ color: "var(--text)" }}>
                Data Protection Commission
              </strong>
              , the supervisor under Act 843.
            </p>
            <p className="mt-3">
              Booking rules and user duties:{" "}
              <Link
                href="/terms"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </Section>
        </article>

        <p
          className="mt-16 border-t pt-6 text-xs leading-relaxed"
          style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
        >
          This Privacy Policy is for transparency and is not formal legal advice.
          For advice on your rights under Ghanaian data-protection law, consult
          a lawyer or the Data Protection Commission.
        </p>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2
        className="font-display mb-4 text-xl font-semibold tracking-tight sm:text-2xl"
        style={{ color: "var(--primary-dark)" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

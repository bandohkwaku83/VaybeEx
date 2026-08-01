import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — VaybeEx",
  description:
    "Terms and conditions for using VaybeEx, the group travel marketplace for Ghana and West Africa.",
};

const LAST_UPDATED = "22 July 2026";
const SUPPORT_EMAIL = "support@vaybeex.com";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of these Terms" },
  { id: "about", label: "2. About VaybeEx" },
  { id: "eligibility", label: "3. Eligibility" },
  { id: "accounts", label: "4. Accounts & verification" },
  { id: "marketplace", label: "5. Marketplace role" },
  { id: "bookings", label: "6. Bookings & payments" },
  { id: "cancellations", label: "7. Cancellations & refunds" },
  { id: "organizers", label: "8. Organizer terms" },
  { id: "travelers", label: "9. Traveler responsibilities" },
  { id: "conduct", label: "10. Acceptable use" },
  { id: "content", label: "11. Content & intellectual property" },
  { id: "privacy", label: "12. Privacy" },
  { id: "liability", label: "13. Liability & disclaimers" },
  { id: "indemnity", label: "14. Indemnity" },
  { id: "disputes", label: "15. Disputes & governing law" },
  { id: "changes", label: "16. Changes to these Terms" },
  { id: "contact", label: "17. Contact" },
] as const;

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p
          className="mt-4 max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          These Terms are the contract for using VaybeEx: who can join, how
          bookings and payouts work, what organizers and travelers must do, and
          what happens if something goes wrong. They do{" "}
          <em>not</em> explain how we handle personal data — that is in the{" "}
          <Link
            href="/privacy"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--text-tertiary)" }}>
          Last updated: {LAST_UPDATED} · Governed by the laws of the Republic of
          Ghana
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
          <Section id="acceptance" title="1. Acceptance of these Terms">
            <p>
              These Terms &amp; Conditions (&ldquo;Terms&rdquo;) form a binding
              agreement between you and VaybeEx (&ldquo;VaybeEx&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) for your
              use of the VaybeEx website, apps, and related services (the
              &ldquo;Platform&rdquo;).
            </p>
            <p>
              Electronic contracts and notices on the Platform are intended to
              have legal effect under Ghana&apos;s{" "}
              <em>Electronic Transactions Act, 2008 (Act 772)</em>. If you do
              not agree, do not use the Platform.
            </p>
          </Section>

          <Section id="about" title="2. About VaybeEx">
            <p>
              VaybeEx is a marketplace that connects travelers with independent
              trip organizers. We provide listing, booking, payment facilitation,
              messaging, and related tools. Unless we say otherwise in writing,
              we are not the tour operator, carrier, or host of any listed trip.
            </p>
            <p>
              Support:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </Section>

          <Section id="eligibility" title="3. Eligibility">
            <p>To use VaybeEx you must:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                be at least 18 (or the age of majority under Ghanaian law if
                higher) and able to contract under the{" "}
                <em>Contracts Act, 1960 (Act 25)</em>;
              </li>
              <li>give accurate registration and booking information;</li>
              <li>
                use the Platform lawfully and in line with these Terms.
              </li>
            </ul>
            <p className="mt-3">
              Minors may join a trip only if the listing allows it and a parent
              or guardian accepts these Terms for them.
            </p>
          </Section>

          <Section id="accounts" title="4. Accounts &amp; verification">
            <p>
              Keep your login details confidential. You are responsible for
              activity under your account. Tell us quickly if you suspect
              unauthorized use.
            </p>
            <p>
              Organizers may need identity and profile checks (for example
              national ID) before listing trips or withdrawing funds. We may
              approve, pause, or reject accounts where verification is
              incomplete, false, or risky.
            </p>
            <p>
              False identity, impersonation, or evasion of checks may lead to
              suspension or termination and, where appropriate, referral under
              Ghanaian criminal and cybersecurity law, including the{" "}
              <em>Cybersecurity Act, 2020 (Act 1038)</em>.
            </p>
          </Section>

          <Section id="marketplace" title="5. Marketplace role">
            <p>
              Organizers control their listings: price, itinerary, inclusions,
              meeting points, capacity, and cancellation rules (unless VaybeEx
              states otherwise).
            </p>
            <p>
              A booking creates a travel contract mainly between you and the
              organizer. VaybeEx supplies the Platform and payment facilitation.
              We do not guarantee trip quality, but we may help with disputes and
              enforce Platform rules.
            </p>
          </Section>

          <Section id="bookings" title="6. Bookings &amp; payments">
            <p>
              A booking is confirmed when the required payment (deposit or full
              amount) succeeds and the Platform issues confirmation. Prices are
              usually in Ghana Cedis (GHS).
            </p>
            <p>
              Checkout may offer MoMo, card, bank transfer, or other shown
              methods via licensed providers. By paying, you authorize the
              disclosed amounts, including stated fees or taxes.
            </p>
            <p>
              Where we hold funds until departure or payout, that is payment
              facilitation only — it does not make VaybeEx the trip provider.
            </p>
            <p>
              Failed, reversed, or fraudulent payments can cancel the booking
              and trigger account review. Raise genuine payment disputes with us
              or via the Platform before unjustified chargebacks.
            </p>
          </Section>

          <Section id="cancellations" title="7. Cancellations &amp; refunds">
            <p>
              Each listing shows its refund rules (full, partial, or
              non-refundable, often with a pre-departure deadline). That policy
              forms part of your contract with the organizer and is applied on
              the Platform where possible.
            </p>
            <p>
              Refund amounts depend on the listing policy at booking, what you
              paid, and days left before departure. Disclosed Platform or
              provider fees may be non-refundable.
            </p>
            <p>
              If an organizer cancels, travelers are generally owed a refund of
              amounts paid for that booking, subject to payment-rail timing.
              Alternatives (like rebooking) need mutual agreement.
            </p>
            <p>
              Non-waivable consumer rights under Ghanaian law still apply where
              they cannot be limited by contract.
            </p>
          </Section>

          <Section id="organizers" title="8. Organizer terms">
            <p>If you list trips, you agree to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                keep listings accurate and honour confirmed bookings;
              </li>
              <li>
                hold licences, permits, or insurance reasonably required under
                Ghanaian law for your trips;
              </li>
              <li>
                use traveler details only to deliver the trip (see also the{" "}
                <Link
                  href="/privacy"
                  className="font-medium underline-offset-2 hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Privacy Policy
                </Link>
                );
              </li>
              <li>
                not push travelers off-Platform to dodge fees or protections,
                unless we expressly allow it;
              </li>
              <li>
                accept that MoMo and other payouts may face verification, holds,
                dispute reserves, and anti-fraud checks.
              </li>
            </ul>
            <p className="mt-3">
              Service fees are as shown in the organizer tools. We may remove
              listings or hold payouts for fraud, safety risk, or serious breach.
            </p>
          </Section>

          <Section id="travelers" title="9. Traveler responsibilities">
            <p>As a traveler you agree to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                read the listing (inclusions, difficulty, cancellation rules)
                before paying;
              </li>
              <li>
                arrive on time with documents, visas, vaccines, and gear the
                organizer requires;
              </li>
              <li>
                treat organizers, co-travelers, and communities respectfully;
              </li>
              <li>
                arrange your own travel insurance unless a listing says VaybeEx
                or the organizer includes it.
              </li>
            </ul>
            <p className="mt-3">
              For cross-border trips, you are responsible for immigration and
              customs compliance.
            </p>
          </Section>

          <Section id="conduct" title="10. Acceptable use">
            <p>You must not:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                use the Platform for fraud, money laundering, or other crimes
                under Ghanaian law;
              </li>
              <li>
                scrape, attack, or disrupt Platform security or availability;
              </li>
              <li>
                post illegal, defamatory, discriminatory, or infringing content;
              </li>
              <li>harass users or abuse messaging features.</li>
            </ul>
            <p className="mt-3">
              We may remove content, suspend accounts, and cooperate with
              authorities where the law requires.
            </p>
          </Section>

          <Section id="content" title="11. Content &amp; intellectual property">
            <p>
              VaybeEx branding, software, and design belong to us or our
              licensors. Do not copy or exploit them without written permission.
            </p>
            <p>
              You keep ownership of content you upload, but grant VaybeEx a
              worldwide, non-exclusive, royalty-free licence to host and show it
              to run and promote the Platform. You confirm you have the rights to
              grant that licence.
            </p>
          </Section>

          <Section id="privacy" title="12. Privacy">
            <p>
              How we collect and use personal data is described only in the{" "}
              <Link
                href="/privacy"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>
              , under Ghana&apos;s{" "}
              <em>Data Protection Act, 2012 (Act 843)</em>. These Terms do not
              replace that Policy.
            </p>
          </Section>

          <Section id="liability" title="13. Liability &amp; disclaimers">
            <p>
              Group travel involves risk (delays, weather, illness, accidents,
              third-party failures). To the fullest extent Ghanaian law allows:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                the Platform is provided &ldquo;as available,&rdquo; without a
                promise of uninterrupted service;
              </li>
              <li>
                VaybeEx is not liable for acts or omissions of organizers,
                travelers, hotels, transport operators, or payment providers;
              </li>
              <li>
                we are not liable for indirect or consequential loss (including
                lost profits or data);
              </li>
              <li>
                where liability cannot be excluded, our total liability for a
                booking or Platform use is capped at the greater of (a) fees
                VaybeEx earned on that booking, or (b) GHS 100 — except for our
                fraud or willful misconduct.
              </li>
            </ul>
            <p className="mt-3">
              Nothing here excludes liability that Ghanaian law does not allow
              to be limited (including, where applicable, death or personal
              injury caused by our negligence).
            </p>
          </Section>

          <Section id="indemnity" title="14. Indemnity">
            <p>
              You will indemnify VaybeEx and its officers, employees, and agents
              against claims and costs arising from your breach of these Terms,
              misuse of the Platform, your content or conduct, or violation of
              law or third-party rights — except to the extent caused by our
              willful misconduct.
            </p>
          </Section>

          <Section id="disputes" title="15. Disputes &amp; governing law">
            <p>
              These Terms are governed by the laws of the Republic of Ghana.
            </p>
            <p>
              Before filing a claim, contact {SUPPORT_EMAIL} and try to resolve
              the issue in good faith within 30 days. Mediation in Accra may be
              agreed.
            </p>
            <p>
              Subject to mandatory consumer protections, Ghanaian courts
              (preferred venue: Accra) have exclusive jurisdiction over
              unresolved disputes, unless we agree otherwise in writing.
            </p>
          </Section>

          <Section id="changes" title="16. Changes to these Terms">
            <p>
              We may update these Terms. The &ldquo;Last updated&rdquo; date will
              change when we do. Material changes may be notified on the
              Platform, by email, or SMS. Continued use after the effective date
              means acceptance, except where Ghanaian law requires fresh consent.
            </p>
          </Section>

          <Section id="contact" title="17. Contact">
            <p>
              Terms, bookings, and Platform support:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
            <p className="mt-3">
              <Link
                href="/expeditions"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Browse expeditions
              </Link>
              {" · "}
              <Link
                href="/privacy"
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Privacy Policy
              </Link>
            </p>
          </Section>
        </article>

        <p
          className="mt-16 border-t pt-6 text-xs leading-relaxed"
          style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
        >
          This page is for Platform governance and is not formal legal advice.
          For advice on your rights under Ghanaian law, consult a lawyer
          licensed in Ghana.
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

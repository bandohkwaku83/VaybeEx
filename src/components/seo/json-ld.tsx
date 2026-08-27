const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : "https://vaybeex.com";

/** Organization + WebSite schema so Google associates “VaybeEx” / “vaybeex” with the site. */
export function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VaybeEx",
    alternateName: ["vaybeex", "Vaybe Ex", "Vaybeex"],
    url: SITE_URL,
    logo: `${SITE_URL}/images/web_logo.png`,
    description:
      "Curated group travel experiences across Ghana and West Africa. Browse expeditions, book adventures, and track your trips on VaybeEx.",
    sameAs: [] as string[],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VaybeEx",
    alternateName: ["vaybeex", "Vaybe Ex"],
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "VaybeEx",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/web_logo.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

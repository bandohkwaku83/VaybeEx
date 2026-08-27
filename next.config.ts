import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:8000")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

function collectImageRemotePatterns() {
  const seen = new Set<string>();
  const patterns: {
    protocol: "http" | "https";
    hostname: string;
    port?: string;
    pathname?: string;
  }[] = [{ protocol: "https", hostname: "images.unsplash.com" }];

  const add = (raw?: string) => {
    if (!raw) return;
    try {
      const url = new URL(raw);
      const key = `${url.protocol}//${url.host}`;
      if (seen.has(key)) return;
      seen.add(key);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/**",
      });
    } catch {
      /* ignore invalid URLs */
    }
  };

  add(process.env.API_BASE_URL);
  add(process.env.NEXT_PUBLIC_API_BASE_URL);
  add(apiBaseUrl);
  add("http://localhost:8000");
  add("https://localhost:8000");
  return patterns;
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    // Profile setup uploads up to 3 images (5 MB each) through /api rewrites.
    proxyClientMaxBodySize: "50mb",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: collectImageRemotePatterns(),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 * Adjust the hosts to your Supabase project and any third parties you use (analytics, etc.).
 * `connect-src` must allow your Supabase URL (REST/Realtime/Storage).
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";

const cspDirectives = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseHost}`,
  `font-src 'self'`,
  `connect-src 'self' ${supabaseHost} wss://*.supabase.co`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

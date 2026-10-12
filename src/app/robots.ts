import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/student", "/exam", "/post-login"],
      },
    ],
    sitemap: "https://tests.mbaprof.in/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

const BASE_URL = "https://tests.mbaprof.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/tests"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/tests" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}

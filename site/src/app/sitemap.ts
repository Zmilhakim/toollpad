import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { writtenTokens } from "@/lib/tokens";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/board", "/launch", "/dashboard", "/learn"];
  const tokens = writtenTokens().map((token) => `/t/${token.slug}`);

  return [...pages, ...tokens].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}

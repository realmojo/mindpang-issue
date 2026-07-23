import type { MetadataRoute } from "next"

import { getIssues } from "@/lib/issues"
import { siteConfig } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const issues = await getIssues(1000)

  const posts: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${siteConfig.url}/${encodeURIComponent(issue.slug)}`,
    lastModified: issue.created_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: siteConfig.url,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...posts,
  ]
}

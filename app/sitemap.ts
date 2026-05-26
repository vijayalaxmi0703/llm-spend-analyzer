import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://credex-audit.example.com';

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/audit`, lastModified: new Date() },
    { url: `${baseUrl}/report/sample`, lastModified: new Date() },
    { url: `${baseUrl}/audit/sample`, lastModified: new Date() }
  ];
}

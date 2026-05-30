import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/settings/', '/auth/'],
    },
    sitemap: 'https://mayday-oversweet-defense.ngrok-free.dev/sitemap.xml',
  };
}

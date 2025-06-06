import { SiteConfig } from '@/types';

const baseUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;

export const siteConfig: SiteConfig = {
  name: 'ODX',
  author: 'Ankit Negi',
  description: 'ODX Labs',
  keywords: ['ODX', 'Omnichain', 'Next.js', 'Tailwind CSS', 'shadcn/ui'],
  url: {
    base: baseUrl,
    author: 'Ankit Negi',
  },
  links: {
    github: 'https://github.com/ordinox/odx',
  },
  ogImage: `${baseUrl}/og.jpg`,
};

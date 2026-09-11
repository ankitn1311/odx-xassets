import createNextIntlPlugin from 'next-intl/plugin';

// Node 25+ exposes a server-side `localStorage` stub without `getItem` unless
// `--localstorage-file` is set. Libraries like RainbowKit only check
// `typeof localStorage !== 'undefined'` and crash during SSR, so drop it.
if (
  typeof globalThis.localStorage !== 'undefined' &&
  typeof globalThis.localStorage.getItem !== 'function'
) {
  delete globalThis.localStorage;
}

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    // Placeholder photography on the landing page.
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
  // output: 'standalone',
  // experimental: {
  //   turbo: {
  //     loader: {},
  //   },
  // },
};

export default withNextIntl(nextConfig);

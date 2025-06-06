import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  // output: 'standalone',
  // experimental: {
  //   turbo: {
  //     loader: {},
  //   },
  // },
};

export default withNextIntl(nextConfig);

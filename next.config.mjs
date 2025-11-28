/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fluxion/types', '@fluxion/local-store', '@fluxion/flows'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;

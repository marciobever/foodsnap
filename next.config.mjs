/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'lh3.googleusercontent.com', 'scontent.xx.fbcdn.net', 'ui-avatars.com', 'api.qrserver.com', 'supabase.co'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    config.resolve.symlinks = false;
    return config;
  }
}

export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Agregamos configuración para permitir imágenes desde Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Esta es la sección clave que da permiso a Next.js
  // para cargar imágenes desde tu cuenta de Cloudinary.
  images: {
    // AÑADIDO PARA DEPURACIÓN: Desactivamos la optimización de imágenes.
    // Esto hará que Next.js sirva las imágenes directamente desde Cloudinary
    // sin intentar procesarlas. Es una prueba para aislar el problema.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite cualquier imagen de tu cuenta
      },
    ],
  },
};

module.exports = nextConfig;

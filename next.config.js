    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      // Esta es la sección clave que da permiso a Next.js
      // para cargar imágenes desde tu cuenta de Cloudinary.
      images: {
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
    
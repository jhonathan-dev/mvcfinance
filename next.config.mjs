/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // domínio dos arquivos hospedados no Vercel Blob (upload de imagens
        // de Cursos, Lições, Conquistas, Questionários etc.)
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

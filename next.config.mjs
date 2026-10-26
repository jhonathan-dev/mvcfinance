/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Gera o PDF do relatório no servidor. Deixar o jspdf fora do bundle do
    // Next evita erros de módulo opcional e funciona igual na Vercel.
    serverComponentsExternalPackages: ["jspdf"],
  },
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

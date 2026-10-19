import Navbar from "@/app/_components/navbar";
import { Toaster } from "@/app/_components/ui/sonner";
import { getOrCreateUsuarioAtual } from "@/app/_data/get-usuario-atual";
import { Zap } from "lucide-react";
import AprenderSidebar from "./_components/AprenderSidebar";

// Layout compartilhado da seção "Aprender" (Painel, Cursos, Lições, Quiz e
// Conquistas). O grupo de rotas (aprender) não aparece na URL — serve só
// para dar a essas telas a mesma barra lateral e o chip de XP no topo.
const AprenderLayout = async ({ children }: { children: React.ReactNode }) => {
  const usuario = await getOrCreateUsuarioAtual();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AprenderSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex justify-end px-6 pt-4 md:px-10">
            <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" />
              {usuario.totalXp.toLocaleString("pt-BR")} XP
            </span>
          </div>
          <div className="mx-auto max-w-6xl px-6 pb-10 pt-4 md:px-10">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AprenderLayout;

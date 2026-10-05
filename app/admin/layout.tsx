import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";
import Navbar from "@/app/_components/navbar";
import { Toaster } from "@/app/_components/ui/sonner";

// TODO: hoje qualquer usuário logado acessa o /admin. Quando o time
// definir quem são os administradores, adicionar checagem de permissão
// aqui (ex: publicMetadata.role === "admin") antes do redirect abaixo.
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">{children}</div>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminLayout;

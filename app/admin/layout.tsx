import { exigirAdminNaPagina } from "@/app/_lib/admin";
import AdminSidebar from "./_components/AdminSidebar";
import Navbar from "@/app/_components/navbar";
import { Toaster } from "@/app/_components/ui/sonner";

// Só administradores (Clerk publicMetadata.role === "admin") acessam o /admin.
// Atenção: esta checagem sozinha NÃO basta — o Next renderiza páginas de forma
// parcial e o layout nem sempre roda de novo. Por isso cada page.tsx do admin
// e cada Server Action também chamam exigirAdminNaPagina/exigirAdmin.
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  await exigirAdminNaPagina();

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

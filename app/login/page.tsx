import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <div className="grid h-full grid-cols-2">
      {/* esquerda */}
      <div className="mx-auto flex h-full max-w-[65%] flex-col justify-center p-8">
        <Image
          src="/logo_mvc.png"
          alt="Logo MVC"
          width={180}
          height={100}
          className="mb-8"
        />
        <h1 className="mb-3 text-4xl font-bold text-primary">Bem vindo</h1>
        <p className="mb-8 text-secondary-foreground">
          A MVC Finance é uma plataforma de gestão financeira que utiliza IA
          para monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento
        </p>
        <SignInButton>
          <Button variant="outline">
            <LogInIcon className="mr-2" />
            Fazer Login ou criar conta
          </Button>
        </SignInButton>
      </div>

      {/* direita */}
      <div className="relative h-full w-full">
        <Image
          src="/login.png"
          alt="Faça login"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;

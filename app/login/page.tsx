import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";

const LoginPage = () => {
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
        <h1 className="mb-3 text-4xl font-bold">Bem vindo</h1>
        <p className="text-muted-foregound mb-8">
          A MVC Finance é uma plataforma de gestão financeira que utiliza IA
          para monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento
        </p>
        <Button variant="outline">
          <LogInIcon className="mr-2" />
          Fazer Login ou criar conta
        </Button>
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

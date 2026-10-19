"use server";

import { put, del } from "@vercel/blob";
import { exigirAdmin } from "@/app/_lib/admin";

// Server Action reutilizável para upload de imagens no Vercel Blob.
// Usado por qualquer tela de admin que precise enviar um arquivo real
// (Cursos, Lições, Questionários, Conquistas, Métodos de Pagamento,
// Tipos de Operação, avatar de Usuário etc.) em vez de salvar só um
// caminho de texto.
//
// Uso típico num formulário client:
//   const formData = new FormData();
//   formData.append("file", arquivoSelecionado);
//   const url = await uploadImage(formData, "cursos");
//   // salva `url` no campo correspondente (ex: imagem) via upsert*

const TAMANHO_MAXIMO_MB = 5;
const TIPOS_PERMITIDOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export const uploadImage = async (formData: FormData, pasta: string) => {
  // Só administradores enviam arquivos (evita uso do storage por qualquer logado).
  await exigirAdmin();

  const file = formData.get("file") as File | null;

  if (!file) {
    throw new Error("Nenhum arquivo foi enviado.");
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    throw new Error("Formato de imagem inválido. Use PNG, JPG, WEBP ou SVG.");
  }

  if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    throw new Error(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB}MB.`);
  }

  const nomeUnico = `${pasta}/${crypto.randomUUID()}-${file.name}`;

  const blob = await put(nomeUnico, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
};

// Remove um arquivo do Vercel Blob (ex: ao trocar/excluir uma imagem).
// Falha em silêncio se a URL não existir mais — não deve travar o CRUD.
export const deleteImage = async (url?: string | null) => {
  if (!url) return;

  // Esta função também é uma Server Action chamável de fora: sem a checagem,
  // qualquer logado poderia apagar qualquer imagem do Blob.
  await exigirAdmin();

  try {
    await del(url);
  } catch (error) {
    console.error("Falha ao remover imagem do Vercel Blob:", error);
  }
};

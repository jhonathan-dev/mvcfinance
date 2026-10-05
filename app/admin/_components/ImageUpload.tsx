"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/button";
import { uploadImage } from "@/app/_actions/upload-image";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  pasta: string; // subpasta no Vercel Blob (ex: "cursos", "licoes")
  label?: string;
}

// Campo reutilizável de upload de imagem (Vercel Blob). Mostra uma prévia
// local instantânea enquanto o arquivo sobe e troca para a URL definitiva
// quando o upload termina. Usado em Cursos, Lições, Questionários e
// Conquistas.
const ImageUpload = ({
  value,
  onChange,
  pasta,
  label = "Imagem",
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [enviando, setEnviando] = useState(false);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewLocal = URL.createObjectURL(file);
    setPreview(previewLocal);
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData, pasta);
      onChange(url);
      setPreview(url);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar imagem",
      );
      setPreview(value);
    } finally {
      setEnviando(false);
      URL.revokeObjectURL(previewLocal);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {preview ? (
            <Image
              src={preview}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
          {enviando && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? "Trocar imagem" : "Enviar imagem"}
          </Button>
          {preview && !enviando && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={handleRemove}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Remover
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleSelect}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        PNG, JPG, WEBP ou SVG — até 5MB.
      </p>
    </div>
  );
};

export default ImageUpload;

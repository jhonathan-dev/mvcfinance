import { Prisma } from "@prisma/client";

interface DetalhesAuditoriaProps {
  alvoTipo: string | null;
  alvoId: string | null;
  erro: string | null;
  detalhes: Prisma.JsonValue | null;
}

const formatar = (valor: unknown): string => {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (typeof valor === "boolean") return valor ? "sim" : "não";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

const ehObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// { campo: { de, para } } é o formato das alterações: mostra "de → para".
const ehAlteracao = (v: unknown): v is { de: unknown; para: unknown } =>
  ehObjeto(v) && "de" in v && "para" in v;

const Linhas = ({ dados }: { dados: Record<string, unknown> }) => (
  <ul className="space-y-1">
    {Object.entries(dados).map(([campo, valor]) => (
      <li key={campo}>
        <span className="font-medium">{campo}:</span>{" "}
        {ehAlteracao(valor) ? (
          <>
            <span className="text-muted-foreground line-through">
              {formatar(valor.de)}
            </span>{" "}
            → <span>{formatar(valor.para)}</span>
          </>
        ) : ehObjeto(valor) ? (
          <div className="ml-4 mt-1">
            <Linhas dados={valor} />
          </div>
        ) : (
          formatar(valor)
        )}
      </li>
    ))}
  </ul>
);

const DetalhesAuditoria = ({
  alvoTipo,
  alvoId,
  erro,
  detalhes,
}: DetalhesAuditoriaProps) => {
  const temDetalhes = ehObjeto(detalhes) && Object.keys(detalhes).length > 0;
  if (!alvoTipo && !alvoId && !erro && !temDetalhes) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <details className="group text-sm">
      <summary className="cursor-pointer select-none text-primary hover:underline">
        Ver detalhes
      </summary>
      <div className="mt-2 space-y-2 rounded-md border bg-muted/40 p-3 text-xs">
        {erro && (
          <p className="text-red-600">
            <span className="font-medium">Motivo da falha:</span> {erro}
          </p>
        )}
        {(alvoTipo || alvoId) && (
          <p>
            <span className="font-medium">Alvo:</span> {alvoTipo ?? "—"}
            {alvoId && (
              <span className="ml-1 break-all font-mono text-muted-foreground">
                ({alvoId})
              </span>
            )}
          </p>
        )}
        {temDetalhes && <Linhas dados={detalhes as Record<string, unknown>} />}
      </div>
    </details>
  );
};

export default DetalhesAuditoria;

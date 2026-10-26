import { db } from "@/app/_lib/prisma";
import { ANO_MAXIMO, ANO_MINIMO, periodoAtual } from "@/app/_lib/periodo";

// Anos que aparecem no seletor do Dashboard: do ano da operação mais antiga
// do usuário até o da mais recente, sempre incluindo o ano atual e o que
// está selecionado. Sem operações, só o ano atual.
export const getAnosDisponiveis = async (
  usuarioId: string,
  anoSelecionado: number,
) => {
  const { _min, _max } = await db.operacao.aggregate({
    where: { usuarioId },
    _min: { data: true },
    _max: { data: true },
  });

  const atual = periodoAtual().ano;
  const anoDe = (data: Date | null) =>
    data ? data.getUTCFullYear() : undefined;
  const primeiro = Math.min(anoDe(_min.data) ?? atual, anoSelecionado, atual);
  const ultimo = Math.max(anoDe(_max.data) ?? atual, anoSelecionado, atual);

  const anos: number[] = [];
  for (
    let ano = Math.max(primeiro, ANO_MINIMO);
    ano <= Math.min(ultimo, ANO_MAXIMO);
    ano++
  ) {
    anos.push(ano);
  }
  // Mais recente primeiro.
  return anos.reverse();
};

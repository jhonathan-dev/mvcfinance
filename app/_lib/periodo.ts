// Tudo que envolve "mês/ano" do sistema passa por aqui, para o Dashboard, o
// relatório com IA, os filtros e o relatório em PDF contarem o mesmo período.

export const ANO_MINIMO = 2000;
export const ANO_MAXIMO = 2100;

// O sistema é brasileiro: o "dia" de uma operação é o dia no horário de
// Brasília (UTC-3, sem horário de verão desde 2019). A data escolhida no
// calendário vira meia-noite de Brasília = 03:00 UTC, então os limites de
// dia/mês começam às 03:00 UTC.
const HORA_UTC_DO_INICIO_DO_DIA = 3;
const UM_DIA_MS = 24 * 60 * 60 * 1000;

export interface Periodo {
  ano: number;
  mes: number; // 1-12
}

// Mês e ano de "agora" no horário de Brasília (e não o do servidor, que fica
// em UTC: às 22h do dia 31 já seria o mês seguinte).
export const periodoAtual = (): Periodo => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const pega = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value);
  return { ano: pega("year"), mes: pega("month") };
};

export const doisDigitos = (mes: number) => String(mes).padStart(2, "0");

const lerMes = (valor?: string) => {
  if (!valor || !/^(0?[1-9]|1[0-2])$/.test(valor)) return undefined;
  return Number(valor);
};

const lerAno = (valor?: string) => {
  if (!valor || !/^\d{4}$/.test(valor)) return undefined;
  const ano = Number(valor);
  return ano >= ANO_MINIMO && ano <= ANO_MAXIMO ? ano : undefined;
};

// Lê ?month=MM&year=AAAA. Devolve null se qualquer um estiver ausente ou
// inválido (a página então redireciona para o período atual).
export const lerPeriodo = (month?: string, year?: string): Periodo | null => {
  const mes = lerMes(month);
  const ano = lerAno(year);
  return mes && ano ? { ano, mes } : null;
};

// [início, fim) do mês: do dia 1 às 00:00 até o dia 1 do mês seguinte.
// Vale para qualquer mês (28, 29, 30 ou 31 dias) e qualquer ano.
export const limitesDoMes = ({ ano, mes }: Periodo) => ({
  inicio: new Date(Date.UTC(ano, mes - 1, 1, HORA_UTC_DO_INICIO_DO_DIA)),
  fim: new Date(Date.UTC(ano, mes, 1, HORA_UTC_DO_INICIO_DO_DIA)),
});

// "2026-10-25" -> 25/10 às 00:00 (Brasília)
export const inicioDoDia = (dataIso: string) =>
  new Date(`${dataIso}T0${HORA_UTC_DO_INICIO_DO_DIA}:00:00.000Z`);

export const inicioDoDiaSeguinte = (dataIso: string) =>
  new Date(inicioDoDia(dataIso).getTime() + UM_DIA_MS);

export const NOMES_DOS_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

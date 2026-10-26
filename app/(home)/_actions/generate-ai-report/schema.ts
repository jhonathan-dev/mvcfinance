import { z } from "zod";
import { ANO_MAXIMO, ANO_MINIMO } from "@/app/_lib/periodo";

export const generateAiReportSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(ANO_MINIMO).max(ANO_MAXIMO),
});

export type GenerateAiReportSchema = z.infer<typeof generateAiReportSchema>;

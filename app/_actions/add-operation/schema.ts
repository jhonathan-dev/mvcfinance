import {
  OperationCategory,
  OperationPaymentMethod,
  OperationType,
} from "@prisma/client";
import { z } from "zod";

export const addOperationSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().positive(),
  type: z.nativeEnum(OperationType),
  category: z.nativeEnum(OperationCategory),
  paymentMethod: z.nativeEnum(OperationPaymentMethod),
  date: z.date(),
});

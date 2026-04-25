"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  OperationCategory,
  OperationPaymentMethod,
  OperationType,
} from "@prisma/client";
import { addOperationSchema } from "./schema";
import { revalidatePath } from "next/cache";

interface AddOperationParams {
  id?: string;
  name: string;
  amount: number;
  type: OperationType;
  category: OperationCategory;
  paymentMethod: OperationPaymentMethod;
  date: Date;
}
export const addOperation = async (params: AddOperationParams) => {
  addOperationSchema.parse(params);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  await db.operation.upsert({
    where: { id: params.id ?? "" },
    create: { ...params, userId },
    update: { ...params, userId },
  });
  revalidatePath("/operations");
};

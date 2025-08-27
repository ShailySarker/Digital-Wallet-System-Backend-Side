import z from "zod";
import { Wallet_Status } from "./wallet.interface";

export const walletBlockingOrUnblockingValidation = z.object({
  status: z
    .enum(Object.values(Wallet_Status) as [string])
    .default(Wallet_Status.UNBLOCK),
});

export const sendMoneyValidation = z.object({
  amount: z
    .number({ message: "amount must be number" })
    .positive({ message: "amount must be positive number" }),
  phone: z
    .string({ error: "Phone number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  // recipientId: z
  //     .string({ message: "recipientId must be string" })
});

export const depositMoneyValidation = z.object({
  amount: z
    .number({ message: "amount must be number" })
    .positive({ message: "amount must be positive number" }),
});

export const withdrawMoneyValidation = z.object({
  amount: z
    .number({ message: "amount must be number" })
    .positive({ message: "amount must be positive number" }),
});

export const cashInValidation = z.object({
  amount: z
    .number({ message: "amount must be number" })
    .positive({ message: "amount must be positive number" }),
  userId: z.string({ message: "userId must be string" }),
});

export const cashOutValidation = z.object({
  amount: z
    .number({ message: "amount must be number" })
    .positive({ message: "amount must be positive number" }),
  userId: z.string({ message: "userId must be string" }),
});

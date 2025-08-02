import z from "zod";
import { Wallet_Status } from "./wallet.interface";

export const blockWalletValidation = z.object({
    status: z
        .enum(Object.values(Wallet_Status) as [string])
        .default(Wallet_Status.UNBLOCK)
});

export const sendMoneyValidation = z.object({
    amount: z
        .number({ message: "amount must be number" })
        .positive({ message: "amount must be positive number" })
});

export const depositMoneyValidation = z.object({
    amount: z
        .number({ message: "amount must be number" })
        .positive({ message: "amount must be positive number" })
});

export const withdrawMoneyValidation = z.object({
    amount: z
        .number({ message: "amount must be number" })
        .positive({ message: "amount must be positive number" })
});

export const cashInValidation = z.object({
    amount: z
        .number({ message: "amount must be number" })
        .positive({ message: "amount must be positive number" })
});

export const cashOutValidation = z.object({
    amount: z
        .number({ message: "amount must be number" })
        .positive({ message: "amount must be positive number" })
});
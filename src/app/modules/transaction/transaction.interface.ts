import { Types } from "mongoose";

export enum Transaction_Type {
    DEPOSIT = "DEPOSIT",
    WITHDRAW = "WITHDRAW",
    SEND = "SEND",
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT"
};

export enum Transaction_Status {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
};

export interface ITransaction {
    fromWallet?: Types.ObjectId;
    toWallet?: Types.ObjectId;
    amount: number;
    fee: number;
    commission?: number;
    type: Transaction_Type;
    status: Transaction_Status;
    initiatedBy: Types.ObjectId;
};
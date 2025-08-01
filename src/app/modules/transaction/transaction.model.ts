import { Schema } from "mongoose";
import { ITransaction, Transaction_Status, Transaction_Type } from "./transaction.interface";
import { model } from "mongoose";


const transactionSchema = new Schema<ITransaction>(
    {
        fromWallet: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        toWallet: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        amount: {
            type: Number,
            required: true
        },
        fee: {
            type: Number,
            required: true
        },
        commission: {
            type: Number
        },
        type: {
            type: String,
            enum: Object.values(Transaction_Type),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(Transaction_Status),
            default: Transaction_Status.SUCCESS
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Transaction = model<ITransaction>(
    "Transaction",
    transactionSchema
);
import { model, Schema } from "mongoose";
import { IWallet, Wallet_Status } from "./wallet.interface";
import { envVars } from "../../config/env";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: Number(envVars.WALLET.INITIAL_BALANCE),
    },
    status: {
      type: String,
      enum: Object.values(Wallet_Status),
      default: Wallet_Status.UNBLOCK,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
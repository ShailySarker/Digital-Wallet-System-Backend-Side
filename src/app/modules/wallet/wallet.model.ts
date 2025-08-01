import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";
import { envVars } from "../../config/env";
import { Role } from "../user/user.interface";

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
    role: {
      type: String,
      enum: [Role.USER, Role.AGENT],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
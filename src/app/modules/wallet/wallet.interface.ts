import { Types } from "mongoose";

export enum Wallet_Status {
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

export interface IWallet {
  user: Types.ObjectId;
  balance: number;
  status?: Wallet_Status;
}

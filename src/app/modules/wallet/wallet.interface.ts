import { Types } from "mongoose";
import { Role } from "../user/user.interface";

export interface IWallet extends Document {
    user: Types.ObjectId;
    balance: number;
    role: Role.USER | Role.AGENT;
    isBlocked?: boolean;
};
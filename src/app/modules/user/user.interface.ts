import { Types } from "mongoose";

export enum Role {
    // SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "AGENT"
};

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
};

export enum IsApproved {
    APPROVED = "APPROVED",
    SUSPENDED = "SUSPENDED"
};

export interface IUser {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: Role;
    nidNumber?: number;
    wallet?: Types.ObjectId;//user 
    isActive?: IsActive; //user
    isVerified?: boolean;//email or phone otp verification
    isApproved?: IsApproved;//agent
    commissionRate?: number;//agent
    isDeleted?: boolean;
};

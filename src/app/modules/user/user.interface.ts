import { Types } from "mongoose";

export enum Role {
    // SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT"
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
    phone: string;
    password: string;
    nidNumber: number;
    role: Role;
    wallet?: Types.ObjectId;//user 
    isActive?: IsActive; //for user set admin
    isVerified?: boolean;//email or phone otp verification
    isApproved?: IsApproved;//for agent set admin
    commissionRate?: number;//for agent set admin
    isDeleted?: boolean;//set admin
};

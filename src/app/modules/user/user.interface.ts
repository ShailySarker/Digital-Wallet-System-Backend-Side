import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export enum IsActive {
  // ACTIVE = "ACTIVE",
  // INACTIVE = "INACTIVE",
  // BLOCKED = "BLOCKED",
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

export enum IsApproved {
  PENDING = "PENDING",
  APPROVE = "APPROVE",
  SUSPEND = "SUSPEND",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  nidNumber: string;
  role: Role;
  wallet?: Types.ObjectId;
  isActive?: IsActive;
  isVerified?: boolean;
  isApproved?: IsApproved;
  commissionRate?: number;
  isDeleted?: boolean;
}

// wallet?: Types.ObjectId; //user
//   isActive?: IsActive; //for user set admin
//   isVerified?: boolean; //email or phone otp verification
//   isApproved?: IsApproved; //for agent set admin
//   commissionRate?: number; //for agent set admin
//   isDeleted?: boolean; //set admin

// Add this interface for filters
export interface IUserFilters {
  search?: string;
  page?: string;
  limit?: string;
  role?: Role;
  isActive?: IsActive;
  isApproved?: IsApproved;
  isVerified?: string; // 'true' or 'false'
  isDeleted?: string; // 'true' or 'false'
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

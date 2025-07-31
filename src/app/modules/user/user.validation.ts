import z from "zod";
import { IsActive, IsApproved, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: z
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    password: z
        .string({ message: "Password must be string" })
        .min(6, { message: "Password must be at least 8 characters long." }),
    phone: z
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    isActive: z
        .enum(Object.values(IsActive) as [string])
        .optional(),
    nidNumber: z
        .coerce.number({ message: 'nidNumber must be a number' })
        .refine((val) => {
            const digits = String(Math.trunc(val)).length;
            return digits === 10 || digits === 17;
        }, {
            message: 'nidNumber must be exactly 10 or 17 digits long',
        })
        .optional(),
    isVerified: z
        .boolean({ message: "isVerified must be boolean" })
        .optional(),
    isApproved: z
        .enum(Object.values(IsApproved) as [string])
        .optional(),
    commissionRate: z
        .number({ message: "commissionRate must be number" })
        .int({ message: "commissionRate must be a positive number" })
        .min(0, { message: "commissionRate must be a positive number" })
        .max(100, { message: "commissionRate cannot more than 100" })
        .optional(),
    isDeleted: z
        .boolean({ message: "isDeleted must be boolean" })
        .optional()
});

export const updateUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: z
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    password: z
        .string({ message: "Password must be string" })
        .min(6, { message: "Password must be at least 8 characters long." }),
    phone: z
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    isActive: z
        .enum(Object.values(IsActive) as [string])
        .optional(),
    nidNumber: z
        .coerce.number({ message: 'nidNumber must be a number' })
        .refine((val) => {
            const digits = String(Math.trunc(val)).length;
            return digits === 10 || digits === 17;
        }, {
            message: 'nidNumber must be exactly 10 or 17 digits long',
        })
        .optional(),
    isVerified: z
        .boolean({ message: "isVerified must be boolean" })
        .optional(),
    isApproved: z
        .enum(Object.values(IsApproved) as [string])
        .optional(),
    commissionRate: z
        .number({ message: "commissionRate must be number" })
        .int({ message: "commissionRate must be a positive number" })
        .min(0, { message: "commissionRate must be a positive number" })
        .max(100, { message: "commissionRate cannot more than 100" })
        .optional(),
    isDeleted: z
        .boolean({ message: "isDeleted must be boolean" })
        .optional()
});
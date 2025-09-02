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
    .regex(/^\d{6}$/, "Password must be string of exactly 6 digits"),
  phone: z
    .string({ message: "Phone number must be string" })
    .regex(/^(?:01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  role: z.enum(Object.values(Role) as [string]).default(Role.USER),
  nidNumber: z
    .string({ message: "nidNumber must be a string of digits" })
    .regex(
      /^([0-9]{10}|[0-9]{17})$/,
      "nidNumber must be a string of exactly 10 or 17 digits long"
    ),
  isActive: z
    .enum(Object.values(IsActive) as [string])
    .default(IsActive.ACTIVE)
    .optional(),
  isVerified: z
    .boolean({ message: "isVerified must be boolean" })
    .default(false)
    .optional(),
  isApproved: z
    .enum(Object.values(IsApproved) as [string])
    .default(IsApproved.PENDING)
    .optional(),
  commissionRate: z
    .number({ message: "commissionRate must be number" })
    .int({ message: "commissionRate must be a positive number" })
    .min(0, { message: "commissionRate must be a positive number" })
    .max(100, { message: "commissionRate cannot more than 100" })
    .optional(),
  isDeleted: z
    .boolean({ message: "isDeleted must be boolean" })
    .default(false)
    .optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  email: z
    .string({ message: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .optional(),
  password: z
    .string({ message: "Password must be string" })
    .min(6, { message: "Password must be at least 8 characters long." })
    .optional(),
  phone: z
    .string({ message: "Phone number must be string" })
    .regex(/^(?:01\d{9})$/, {
      message: "Phone number must be valid for Bangladesh. Format: 01XXXXXXXXX",
    })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  nidNumber: z
    .string({ message: "nidNumber must be a string of digits" })
    .regex(
      /^([0-9]{10}|[0-9]{17})$/,
      "nidNumber must be exactly 10 or 17 digits long"
    )
    .optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isVerified: z.boolean({ message: "isVerified must be boolean" }).optional(),
  isApproved: z.enum(Object.values(IsApproved) as [string]).optional(),
  commissionRate: z
    .number({ message: "commissionRate must be number" })
    .int({ message: "commissionRate must be a positive number" })
    .min(0, { message: "commissionRate must be a positive number" })
    .max(100, { message: "commissionRate cannot more than 100" })
    .optional(),
  isDeleted: z.boolean({ message: "isDeleted must be boolean" }).optional(),
});

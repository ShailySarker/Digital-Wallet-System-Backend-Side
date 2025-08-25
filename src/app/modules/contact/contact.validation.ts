import z from "zod";

export const constctUsZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string({ message: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  phone: z
    .string({ message: "Phone number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  subject: z
    .string({ message: "Subject must be string" })
    .min(5, { message: "Subject must be at least 2 characters long." })
    .max(50, { message: "Subject cannot exceed 50 characters." }),
  message: z
    .string({ message: "Message must be string" })
    .min(10, { message: "Message must be at least 10 characters long." })
    .max(500, { message: "Message cannot exceed 500 characters." }),
  isIssueSolved: z
    .boolean({ message: "IsIssueSolved must be boolean" })
    .optional(),
});

export const updateContactMessageStatusZodSchema = z.object({
  isIssueSolved: z.boolean({ message: "IsIssueSolved must be boolean" }),
});

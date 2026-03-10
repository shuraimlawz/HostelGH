import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { UserRole, UserGender } from "@prisma/client";

const phoneRegex = /^\+233[2-5][0-9]{8}$/;

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().refine(val => ['TENANT', 'OWNER', 'ADMIN'].includes(val), {
    message: "Invalid role. Must be TENANT, OWNER, or ADMIN"
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Invalid Ghana phone number format. Use +233...').optional(),
  gender: z.string().refine(val => ['MALE', 'FEMALE', 'OTHER'].includes(val), {
    message: "Invalid gender. Must be MALE, FEMALE, or OTHER"
  }).optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) { }

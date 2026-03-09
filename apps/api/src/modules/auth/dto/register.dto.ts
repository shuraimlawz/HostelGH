import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { UserRole, UserGender } from "@prisma/client";

const phoneRegex = /^\+233[2-5][0-9]{8}$/;

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Invalid Ghana phone number format. Use +233...').optional(),
  gender: z.nativeEnum(UserGender).optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) { }

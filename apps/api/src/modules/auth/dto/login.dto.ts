import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const phoneRegex = /^\+233[2-5][0-9]{8}$/; // Ghana +233 standard format

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid Ghana phone number format. Use +233...').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
});

export class LoginDto extends createZodDto(LoginSchema) { }

export const RefreshTokenSchema = z.object({
  userId: z.string(),
  refreshToken: z.string(),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) { }

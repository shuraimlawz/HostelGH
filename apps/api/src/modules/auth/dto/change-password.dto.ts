import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) { }

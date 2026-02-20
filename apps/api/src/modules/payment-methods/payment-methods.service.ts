import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.savedPaymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreatePaymentMethodDto) {
    // If this is the first method or explicitly marked as default
    const existingCount = await this.prisma.savedPaymentMethod.count({
      where: { userId },
    });

    const isFirst = existingCount === 0;
    const setAsDefault = isFirst || dto.isDefault;

    // If setting as default, unset others first
    if (setAsDefault) {
      await this.prisma.savedPaymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.savedPaymentMethod.create({
      data: {
        ...dto,
        userId,
        isDefault: !!setAsDefault,
      },
    });
  }

  async delete(userId: string, id: string) {
    const method = await this.prisma.savedPaymentMethod.findUnique({
      where: { id },
    });

    if (!method) throw new NotFoundException("Payment method not found");
    if (method.userId !== userId)
      throw new ForbiddenException(
        "Not authorized to delete this payment method",
      );

    await this.prisma.savedPaymentMethod.delete({
      where: { id },
    });

    // If we deleted the default, set another as default if exists
    if (method.isDefault) {
      const nextMethod = await this.prisma.savedPaymentMethod.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextMethod) {
        await this.prisma.savedPaymentMethod.update({
          where: { id: nextMethod.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefault(userId: string, id: string) {
    const method = await this.prisma.savedPaymentMethod.findUnique({
      where: { id },
    });

    if (!method) throw new NotFoundException("Payment method not found");
    if (method.userId !== userId)
      throw new ForbiddenException(
        "Not authorized to modify this payment method",
      );

    await this.prisma.savedPaymentMethod.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.savedPaymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}

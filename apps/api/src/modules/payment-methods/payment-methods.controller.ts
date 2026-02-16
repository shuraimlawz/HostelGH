import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentMethodsService } from "./payment-methods.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePaymentMethodDto } from "./dto/create-payment-method.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Payment Methods")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payment-methods")
export class PaymentMethodsController {
    constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

    @Get()
    @ApiOperation({ summary: "Get all saved payment methods" })
    findAll(@Req() req: any) {
        return this.paymentMethodsService.findAll(req.user.userId);
    }

    @Post()
    @ApiOperation({ summary: "Save a new payment method" })
    create(@Req() req: any, @Body() dto: CreatePaymentMethodDto) {
        return this.paymentMethodsService.create(req.user.userId, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Delete a saved payment method" })
    delete(@Req() req: any, @Param("id") id: string) {
        return this.paymentMethodsService.delete(req.user.userId, id);
    }

    @Patch(":id/default")
    @ApiOperation({ summary: "Set a payment method as default" })
    setDefault(@Req() req: any, @Param("id") id: string) {
        return this.paymentMethodsService.setDefault(req.user.userId, id);
    }
}

import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export enum PaymentMethodType {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  USSD = 'USSD',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export class InitiateBankPaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsEnum(PaymentMethodType)
  @IsOptional()
  method: PaymentMethodType = PaymentMethodType.BANK_TRANSFER;
}

export class GetPaymentMethodsDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}

export class SelectPaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsEnum(PaymentMethodType)
  @IsNotEmpty()
  method: PaymentMethodType;
}

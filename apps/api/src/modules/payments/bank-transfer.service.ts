import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface BankTransferResponse {
  status: boolean;
  message: string;
  data: {
    transfer_code: string;
    transfer_recipient: {
      domain: string;
      type: string;
      currency: string;
      amount: number;
      transfer_key: string;
      id: number;
      integration_id: number;
      recipient_code: string;
      name: string;
      notes: string;
      active: boolean;
    };
  };
}

interface VerifyBankTransferResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    transfer_code: string;
    amount: number;
    currency: string;
    reference: string;
    recipient: string;
    narration: string;
    created_at: string;
  };
}

@Injectable()
export class BankTransferService {
  private client: AxiosInstance;
  private readonly BANK_TRANSFER_FEE = 300; // 3 GHS in pesewas for bank transfers

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get list of Ghana banks for bank transfer
   */
  async getBankList(): Promise<any> {
    try {
      const response = await this.client.get('/bank', {
        params: {
          country: 'GH',
          currency: 'GHS',
        },
      });

      return response.data?.data || [];
    } catch (error) {
      throw new HttpException(
        'Failed to fetch bank list',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Initiate a bank transfer payment
   * Returns bank details for customer to transfer money to
   */
  async initiateBankTransfer(
    amount: number,
    reference: string,
    metadata: any = {},
  ): Promise<{
    transfer_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: number;
    reference: string;
  }> {
    try {
      const response = await this.client.post<BankTransferResponse>(
        '/transfer',
        {
          type: 'nuban', // NUBAN = Nigerian Unique Bank Account Number (also works for GH banks)
          source: 'balance', // Use Paystack balance
          reason: `HostelGH Booking - Ref: ${reference}`,
          amount: amount + this.BANK_TRANSFER_FEE,
          currency: 'GHS',
          transfer_code: `TRANSFER_${reference}`,
          metadata,
        },
      );

      if (!response.data.status) {
        throw new BadRequestException(response.data.message || 'Transfer initiation failed');
      }

      const transferData = response.data.data;
      const recipient = transferData.transfer_recipient;

      return {
        transfer_code: transferData.transfer_code,
        bank_name: recipient.name,
        account_number: recipient.type, // or parse from recipient details
        account_name: recipient.name,
        amount: transferData.transfer_recipient.amount,
        reference,
      };
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || error.message || 'Bank transfer initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verify bank transfer payment status
   */
  async verifyBankTransfer(transferCode: string): Promise<{
    status: string;
    amount: number;
    reference: string;
    created_at: string;
  }> {
    try {
      const response = await this.client.get<VerifyBankTransferResponse>(
        `/transfer/verify/${transferCode}`,
      );

      if (!response.data.status) {
        throw new NotFoundException('Transfer not found or verification failed');
      }

      const transferData = response.data.data;

      return {
        status: transferData.status,
        amount: transferData.amount,
        reference: transferData.reference,
        created_at: transferData.created_at,
      };
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || 'Bank transfer verification failed',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get bank transfer fee
   */
  getBankTransferFee(): number {
    return this.BANK_TRANSFER_FEE;
  }

  /**
   * Resolve bank account (validate account exists)
   */
  async resolveBankAccount(accountNumber: string, bankCode: string): Promise<{
    account_number: string;
    account_name: string;
    bank_name: string;
  }> {
    try {
      const response = await this.client.get('/bank/resolve', {
        params: {
          account_number: accountNumber,
          bank_code: bankCode,
        },
      });

      if (!response.data.status) {
        throw new BadRequestException('Invalid bank account');
      }

      return response.data.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.message || 'Bank account resolution failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

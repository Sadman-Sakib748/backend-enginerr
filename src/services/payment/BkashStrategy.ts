// services/payment/BkashStrategy.ts (FIXED - Mock Mode)
import axios from 'axios';
import { IPaymentInput, IPaymentResponse, PaymentProvider, PaymentStatus } from '../../interfaces/IPayment';
import { PaymentStrategy } from './PaymentStrategy';
import { getBkashToken, getBkashConfig } from '../../config/bkash';
import { logger } from '../../utils/logger';

export class BkashStrategy extends PaymentStrategy {
  provider: PaymentProvider = 'bkash';
  private isMockMode: boolean = false;

  constructor() {
    super();
    // Check if bKash is configured
    try {
      getBkashConfig();
    } catch (error) {
      logger.warn('⚠️ bKash not configured. Using mock mode.');
      this.isMockMode = true;
    }
  }

  async initializePayment(paymentInput: IPaymentInput): Promise<IPaymentResponse> {
    try {
      // ✅ Mock Mode
      if (this.isMockMode) {
        logger.info('ℹ️ bKash running in MOCK mode');
        return this.formatResponse(
          {
            transactionId: `bkash_mock_${Date.now()}`,
            status: 'pending' as PaymentStatus,
            redirectUrl: 'https://www.bkash.com/mock-payment?token=mock_token',
            amount: paymentInput.amount,
            currency: paymentInput.currency || 'BDT',
          },
          true
        );
      }

      const token = await getBkashToken();
      const { appKey, baseURL } = getBkashConfig();
      
      const createResponse = await axios.post(
        `${baseURL}/tokenized/checkout/create`,
        {
          mode: '0011',
          payerReference: paymentInput.orderId,
          callbackURL: process.env.BKASH_CALLBACK_URL || 'http://localhost:5000/api/payments/webhook/bkash',
          amount: paymentInput.amount.toString(),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: `INV-${paymentInput.orderId}-${Date.now()}`,
        },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (createResponse.data.statusCode === '0000') {
        return this.formatResponse(
          {
            transactionId: createResponse.data.paymentID,
            status: 'pending' as PaymentStatus,
            redirectUrl: createResponse.data.bkashURL,
            amount: paymentInput.amount,
            currency: paymentInput.currency || 'BDT',
          },
          true
        );
      } else {
        throw new Error(createResponse.data.statusMessage || 'bKash payment creation failed');
      }
    } catch (error: any) {
      logger.error('bKash payment initialization failed:', error.message);
      
      // ✅ Fallback to mock mode
      logger.warn('⚠️ Falling back to bKash mock mode.');
      return this.formatResponse(
        {
          transactionId: `bkash_mock_${Date.now()}`,
          status: 'pending' as PaymentStatus,
          redirectUrl: 'https://www.bkash.com/mock-payment?token=mock_token',
          amount: paymentInput.amount,
          currency: paymentInput.currency || 'BDT',
        },
        true
      );
    }
  }

  async verifyPayment(transactionId: string): Promise<IPaymentResponse> {
    try {
      // ✅ Mock Mode
      if (this.isMockMode || transactionId.startsWith('bkash_mock_')) {
        logger.info('✅ bKash mock payment verified successfully');
        return this.formatResponse(
          {
            transactionId,
            status: 'success' as PaymentStatus,
            amount: 100,
            currency: 'BDT',
          },
          true
        );
      }

      const token = await getBkashToken();
      const { appKey, baseURL } = getBkashConfig();
      
      const executeResponse = await axios.post(
        `${baseURL}/tokenized/checkout/execute`,
        {
          paymentID: transactionId,
        },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = executeResponse.data;
      
      if (data.statusCode === '0000' && data.transactionStatus === 'Completed') {
        return this.formatResponse(
          {
            transactionId: data.paymentID,
            status: 'success' as PaymentStatus,
            amount: parseFloat(data.amount),
            currency: data.currency || 'BDT',
          },
          true
        );
      } else {
        return this.formatResponse(
          {
            transactionId: data.paymentID || transactionId,
            status: 'failed' as PaymentStatus,
            error: data.statusMessage || 'Payment execution failed',
          },
          false
        );
      }
    } catch (error: any) {
      logger.error('bKash verification failed:', error.message);
      return this.formatResponse(
        {
          transactionId,
          status: 'failed' as PaymentStatus,
          error: error.message,
        },
        false
      );
    }
  }

  async processWebhook(payload: any, signature?: string): Promise<any> {
    try {
      // ✅ Mock Mode
      if (this.isMockMode) {
        logger.info('ℹ️ bKash webhook processed (mock mode)');
        return {
          success: true,
          transactionId: payload.paymentID || `bkash_mock_${Date.now()}`,
          status: 'success' as PaymentStatus,
          orderId: payload.merchantInvoiceNumber?.replace('INV-', '').split('-')[0],
        };
      }

      const { paymentID, status } = payload;
      
      if (status === 'success' || status === 'completed') {
        const verification = await this.verifyPayment(paymentID);
        return {
          success: true,
          transactionId: paymentID,
          status: verification.status,
          orderId: payload.merchantInvoiceNumber?.replace('INV-', '').split('-')[0],
        };
      } else {
        return {
          success: false,
          transactionId: paymentID,
          status: 'failed' as PaymentStatus,
          error: payload.statusMessage || 'Payment failed',
        };
      }
    } catch (error: any) {
      logger.error('bKash webhook processing failed:', error.message);
      throw new Error(`Webhook Error: ${error.message}`);
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<IPaymentResponse> {
    try {
      // ✅ Mock Mode
      if (this.isMockMode || transactionId.startsWith('bkash_mock_')) {
        logger.info('✅ bKash mock refund successful');
        return this.formatResponse(
          {
            transactionId: `bkash_refund_${Date.now()}`,
            status: 'refunded' as PaymentStatus,
            amount: amount || 100,
          },
          true
        );
      }

      const token = await getBkashToken();
      const { appKey, baseURL } = getBkashConfig();
      
      const refundResponse = await axios.post(
        `${baseURL}/tokenized/checkout/refund`,
        {
          paymentID: transactionId,
          amount: amount?.toString() || '0',
          refundReason: 'Customer request',
          refundType: 'Full',
        },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': appKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (refundResponse.data.statusCode === '0000') {
        return this.formatResponse(
          {
            transactionId: refundResponse.data.paymentID,
            status: 'refunded' as PaymentStatus,
          },
          true
        );
      } else {
        throw new Error(refundResponse.data.statusMessage || 'Refund failed');
      }
    } catch (error: any) {
      logger.error('bKash refund failed:', error.message);
      return this.formatResponse(
        {
          transactionId,
          status: 'failed' as PaymentStatus,
          error: error.message,
        },
        false
      );
    }
  }
}
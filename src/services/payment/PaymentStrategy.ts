// services/payment/PaymentStrategy.ts (Complete)
import { IPaymentInput, IPaymentResponse, PaymentProvider, PaymentStatus } from '../../interfaces/IPayment';

export interface IPaymentStrategy {
  provider: PaymentProvider;
  initializePayment(paymentInput: IPaymentInput): Promise<IPaymentResponse>;
  verifyPayment(transactionId: string): Promise<IPaymentResponse>;
  processWebhook(payload: any, signature?: string): Promise<any>;
  refundPayment(transactionId: string, amount?: number): Promise<IPaymentResponse>;
}

export abstract class PaymentStrategy implements IPaymentStrategy {
  abstract provider: PaymentProvider;
  
  abstract initializePayment(paymentInput: IPaymentInput): Promise<IPaymentResponse>;
  abstract verifyPayment(transactionId: string): Promise<IPaymentResponse>;
  abstract processWebhook(payload: any, signature?: string): Promise<any>;
  abstract refundPayment(transactionId: string, amount?: number): Promise<IPaymentResponse>;
  
  protected formatResponse(data: any, success: boolean): IPaymentResponse {
    return {
      success,
      transactionId: data.transactionId || '',
      status: (data.status || 'pending') as PaymentStatus,
      redirectUrl: data.redirectUrl || undefined,
      clientSecret: data.clientSecret || undefined,
      provider: this.provider,
      error: data.error || undefined,
      amount: data.amount || undefined,
      currency: data.currency || undefined,
    };
  }
}

export class PaymentStrategyFactory {
  private static strategies: Map<PaymentProvider, PaymentStrategy> = new Map();

  static registerStrategy(provider: PaymentProvider, strategy: PaymentStrategy): void {
    this.strategies.set(provider, strategy);
  }

  static getStrategy(provider: PaymentProvider): PaymentStrategy {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider "${provider}" is not supported`);
    }
    return strategy;
  }

  static getSupportedProviders(): PaymentProvider[] {
    return Array.from(this.strategies.keys());
  }

  static hasStrategy(provider: PaymentProvider): boolean {
    return this.strategies.has(provider);
  }
}
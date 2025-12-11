import type { ProductType } from '@nursery/shared';

export interface FulfillmentRequest {
  productId: string;
  productType: ProductType;
  quantity: number;
  customerInfo: {
    email: string;
    name?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  metadata?: Record<string, unknown>;
}

export interface FulfillmentResult {
  success: boolean;
  orderId?: string;
  trackingNumber?: string;
  downloadUrl?: string;
  estimatedDelivery?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface FulfillmentStrategy {
  canFulfill(productType: ProductType): boolean;
  fulfill(request: FulfillmentRequest): Promise<FulfillmentResult>;
  checkStatus(orderId: string): Promise<FulfillmentResult>;
}


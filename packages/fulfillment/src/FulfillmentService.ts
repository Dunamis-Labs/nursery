import type { FulfillmentRequest, FulfillmentResult } from './types';
import { DigitalFulfillment } from './strategies/DigitalFulfillment';
import { DropshipFulfillment } from './strategies/DropshipFulfillment';
import { InventoryFulfillment } from './strategies/InventoryFulfillment';
import type { FulfillmentStrategy } from './types';

/**
 * Fulfillment Service
 * Uses Strategy Pattern to handle different product types
 */
export class FulfillmentService {
  private strategies: FulfillmentStrategy[];

  constructor() {
    this.strategies = [
      new DigitalFulfillment(),
      new DropshipFulfillment(),
      new InventoryFulfillment(),
    ];
  }

  /**
   * Get the appropriate fulfillment strategy for a product type
   */
  private getStrategy(productType: string): FulfillmentStrategy | null {
    return this.strategies.find((strategy) => strategy.canFulfill(productType as any)) || null;
  }

  /**
   * Fulfill an order using the appropriate strategy
   */
  async fulfill(request: FulfillmentRequest): Promise<FulfillmentResult> {
    const strategy = this.getStrategy(request.productType);

    if (!strategy) {
      return {
        success: false,
        error: `No fulfillment strategy found for product type: ${request.productType}`,
      };
    }

    return strategy.fulfill(request);
  }

  /**
   * Check the status of an order
   */
  async checkStatus(orderId: string, productType: string): Promise<FulfillmentResult> {
    const strategy = this.getStrategy(productType);

    if (!strategy) {
      return {
        success: false,
        error: `No fulfillment strategy found for product type: ${productType}`,
      };
    }

    return strategy.checkStatus(orderId);
  }

  /**
   * Add a custom fulfillment strategy
   */
  addStrategy(strategy: FulfillmentStrategy): void {
    this.strategies.push(strategy);
  }
}

// Export singleton instance
export const fulfillmentService = new FulfillmentService();


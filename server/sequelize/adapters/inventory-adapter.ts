/**
 * General Inventory Adapter
 * Aggregates all inventory-related adapters
 */

import productAdapter from './inventory-product-adapter';
import stockAdapter from './inventory-stock-adapter';
import movementAdapter from './inventory-movement-adapter';
import expiryAdapter from './inventory-expiry-adapter';
import categoryAdapter from './inventory-category-adapter';
import batchAdapter from './inventory-batch-adapter';

export default {
  ...productAdapter,
  ...stockAdapter,
  ...movementAdapter,
  ...expiryAdapter,
  ...categoryAdapter,
  ...batchAdapter
};

export {
  productAdapter,
  stockAdapter,
  movementAdapter,
  expiryAdapter,
  categoryAdapter,
  batchAdapter
};

/**
 * Stub function for getting inventory batches
 */
export async function getInventoryBatches(
  tenantId: string,
  limit: number = 100,
  offset: number = 0,
  filters: any = {}
) {
  console.log('[InventoryAdapter] getInventoryBatches called - not yet implemented');
  return {
    success: true,
    data: [],
    total: 0,
    message: 'Inventory batches - not yet implemented'
  };
}

/**
 * Stub function for getting products
 */
export async function getProducts(
  tenantId: string,
  limit: number = 100,
  offset: number = 0,
  filters: any = {}
) {
  console.log('[InventoryAdapter] getProducts called - not yet implemented');
  return {
    success: true,
    data: [],
    total: 0,
    message: 'Products - not yet implemented'
  };
}

/**
 * Stub function for getting inventory statistics
 */
export async function getInventoryStatistics(tenantId: string) {
  console.log('[InventoryAdapter] getInventoryStatistics called - not yet implemented');
  return {
    success: true,
    data: {},
    message: 'Inventory statistics - not yet implemented'
  };
}

/**
 * Stub function for getting stock opname list
 */
export async function getStockOpnameList(
  tenantId: string,
  limit: number = 100,
  offset: number = 0,
  filters: any = {}
) {
  console.log('[InventoryAdapter] getStockOpnameList called - not yet implemented');
  return {
    success: true,
    data: [],
    total: 0,
    message: 'Stock opname list - not yet implemented'
  };
}

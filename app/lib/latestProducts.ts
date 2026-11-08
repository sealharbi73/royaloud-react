import type { Product } from '@salla.sa/twilight-theme-engine/types';

export const LATEST_PRODUCTS_LIMIT = 6;

export function selectLatestProducts(products: Product[]): Product[] {
  return products.slice(0, LATEST_PRODUCTS_LIMIT);
}

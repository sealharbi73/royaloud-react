import { describe, expect, it } from 'vitest';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { LATEST_PRODUCTS_LIMIT, selectLatestProducts } from '../../app/lib/latestProducts';

function makeProduct(id: number, name: string): Product {
  return { id, name, price: id * 10, image: { url: '/images/original.png' } } as Product;
}

describe('selectLatestProducts', () => {
  it('returns the first six store products without replacing their data', () => {
    const products = [
      makeProduct(1, 'كرسي'),
      makeProduct(2, 'مصباح'),
      makeProduct(3, 'طاولة'),
      makeProduct(4, 'منتج 4'),
      makeProduct(5, 'منتج 5'),
      makeProduct(6, 'منتج 6'),
      makeProduct(7, 'منتج 7'),
    ];

    const selected = selectLatestProducts(products);

    expect(selected).toHaveLength(LATEST_PRODUCTS_LIMIT);
    expect(selected.map(({ id }) => id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(selected.map(({ name }) => name)).toEqual([
      'كرسي',
      'مصباح',
      'طاولة',
      'منتج 4',
      'منتج 5',
      'منتج 6',
    ]);
    expect(selected.map(({ image }) => image?.url)).toEqual(
      Array.from({ length: 6 }, () => '/images/original.png')
    );
    expect(selected.map(({ price }) => price)).toEqual([10, 20, 30, 40, 50, 60]);
  });

  it('returns all available products when fewer than six exist', () => {
    const selected = selectLatestProducts([
      makeProduct(1, 'Demo 1'),
      makeProduct(2, 'Demo 2'),
    ]);

    expect(selected).toHaveLength(2);
    expect(selected.map(({ name }) => name)).toEqual(['Demo 1', 'Demo 2']);
    expect(selected.map(({ image }) => image?.url)).toEqual(
      Array.from({ length: 2 }, () => '/images/original.png')
    );
  });
});

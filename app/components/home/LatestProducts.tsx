import { useCallback } from 'react';
import { ProductCardSkeleton, SallaProductsList } from '@salla.sa/twilight-components-react';
import { NoContent } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from '../product';
import { useProductCardLayout } from '../../hooks/useProductCardLayout';
import { LATEST_PRODUCTS_LIMIT, selectLatestProducts } from '../../lib/latestProducts';

export interface LatestProductsProps {
  data: {
    title?: string;
    priority?: boolean;
    [key: string]: unknown;
  };
}

/**
 * `latest-products` home block — the six latest products from the store API.
 * The engine shows it when the merchant placed no blocks.
 *
 * Fork of the engine block — identical markup and data flow, only swapped to the
 * theme's {@link ProductCard} wrapper so these cards match every other product
 * list (solid add-to-cart button, wishlist in the footer). Prices and product
 * ids remain those returned by the store API.
 * Registered in `app/router.tsx`.
 *
 * Upgrade notes: `FORKS.md`.
 */
export function LatestProducts({ data }: LatestProductsProps) {
  const { t } = useTranslation();
  const layout = useProductCardLayout();

  const loader = useCallback(
    () => product.list({ source: 'latest', perPage: LATEST_PRODUCTS_LIMIT }),
    []
  );

  return (
    <>
      <div className="s-block__title">
        <h2>{data.title || t('blocks.home.latest_products', 'Latest Products')}</h2>
      </div>
      <SallaProductsList<Product>
        loader={loader}
        mode="once"
        itemsClassName={`s-products-list-${layout}-cards`}
        skeleton={<ProductCardSkeleton />}
        skeletonType="item"
        skeletonCount={LATEST_PRODUCTS_LIMIT}
        empty={
          <NoContent
            icon="sicon-shopping-bag"
            message={t('pages.categories.no_products', 'No products found in this category')}
          />
        }
        t={(key, fallback) => t(key, fallback || key)}
      >
        {(products) =>
          selectLatestProducts(products).map((item, index) => (
            <ProductCard
              key={item.id}
              product={item}
              layout={layout}
              imagePriority={!!data.priority && index < 2}
            />
          ))
        }
      </SallaProductsList>
    </>
  );
}

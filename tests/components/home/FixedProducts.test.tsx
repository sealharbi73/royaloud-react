import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FixedProducts } from '../../../app/components/home/FixedProducts';

const listMock = vi.fn();

const cardLayout = { value: 'vertical' as 'vertical' | 'horizontal' };
vi.mock('../../../app/hooks/useProductCardLayout', () => ({
  useProductCardLayout: () => cardLayout.value,
}));

const themeSettings: { vertical_fixed_products?: boolean } = {};
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: themeSettings } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (params: Record<string, unknown>) => ({
        queryKey: ['products', 'list', params],
        queryFn: () => listMock(params),
      }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children }: { to: string; children?: unknown }) => (
    <a href={to}>{children as never}</a>
  ),
}));

vi.mock('@salla.sa/twilight-components-react', () => ({
  FixedProductsSkeleton: () => <div data-testid="home-fixed-products-skeleton" />,
}));

vi.mock('../../../app/components/product', () => ({
  ProductCard: ({
    product,
    layout,
  }: {
    product: { id: number; name?: string; price?: number | string; image?: { url?: string } };
    layout?: string;
  }) => (
    <div
      data-testid={`home-fixed-products-card-${product.id}`}
      data-layout={layout}
      data-image={product.image?.url}
      data-price={product.price}
    >
      {product.name}
    </div>
  ),
}));

const products = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `P${index + 1}`,
    price: 10 + index,
  }));

const latestProductsFromApi = (count = 6) => {
  return products(count).map((item) => ({
    ...item,
    name: `Store product ${item.id}`,
    image: { url: `https://store.example.com/product-${item.id}.jpg` },
  }));
};

/** The rendered product cards, in order. */
const cards = (container: HTMLElement) =>
  container.querySelectorAll('[data-testid^="home-fixed-products-card-"]');

function renderBlock(data: Record<string, unknown>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <FixedProducts data={{ products: { source: 'categories', source_value: [1] }, ...data }} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  listMock.mockReset();
  cardLayout.value = 'vertical';
  delete themeSettings.vertical_fixed_products;
});

describe('FixedProducts', () => {
  it('asks for and shows as many products as the block limit, past 4', async () => {
    listMock.mockResolvedValue({ items: products(8) });
    const { container } = renderBlock({ limit: 8 });
    await waitFor(() => expect(cards(container)).toHaveLength(8));
    expect(cards(container)[7].getAttribute('data-testid')).toBe('home-fixed-products-card-8');
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: 8 }));
  });

  it('never shows more than the limit, even when the API sends more', async () => {
    listMock.mockResolvedValue({ items: products(12) });
    const { container } = renderBlock({ limit: '8' });
    await waitFor(() => expect(cards(container)).toHaveLength(8));
  });

  it('shows what the API returns when the block has no limit', async () => {
    listMock.mockResolvedValue({ items: products(6) });
    const { container } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(6));
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: undefined }));
  });

  it('shows the latest products and images returned by the store API', async () => {
    listMock.mockResolvedValue({ items: latestProductsFromApi() });

    const { container } = renderBlock({
      products: { source: 'latest' },
      limit: 6,
    });
    await waitFor(() => expect(cards(container)).toHaveLength(6));

    expect(Array.from(cards(container), (card) => card.getAttribute('data-image'))).toEqual([
      'https://store.example.com/product-1.jpg',
      'https://store.example.com/product-2.jpg',
      'https://store.example.com/product-3.jpg',
      'https://store.example.com/product-4.jpg',
      'https://store.example.com/product-5.jpg',
      'https://store.example.com/product-6.jpg',
    ]);
    expect(Array.from(cards(container), (card) => card.textContent)).toEqual([
      'Store product 1',
      'Store product 2',
      'Store product 3',
      'Store product 4',
      'Store product 5',
      'Store product 6',
    ]);
    expect(Array.from(cards(container), (card) => card.getAttribute('data-price'))).toEqual([
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ]);
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: 6 }));
  });

  it('shows the six newest products without replacing their API names', async () => {
    listMock.mockResolvedValue({
      items: [
        ...products(15),
        {
          id: 21,
          name: 'مسك أبيض فاخر',
          image: { url: 'https://example.com/old-white-musk.jpg' },
        },
        {
          id: 22,
          name: 'عود كلمنتان فاخر',
          image: { url: 'https://example.com/old-clementan.jpg' },
        },
      ],
    });

    const { container } = renderBlock({
      products: { source: 'latest' },
      limit: 6,
    });
    await waitFor(() => expect(cards(container)).toHaveLength(6));
    expect(Array.from(cards(container), (card) => card.getAttribute('data-testid'))).toEqual([
      'home-fixed-products-card-1',
      'home-fixed-products-card-2',
      'home-fixed-products-card-3',
      'home-fixed-products-card-4',
      'home-fixed-products-card-5',
      'home-fixed-products-card-6',
    ]);
    expect(Array.from(cards(container), (card) => card.textContent)).toEqual([
      'P1',
      'P2',
      'P3',
      'P4',
      'P5',
      'P6',
    ]);
  });

  it('preserves original image and name for non-latest product blocks', async () => {
    listMock.mockResolvedValue({
      items: [{ id: 1, name: 'منتج آخر', image: { url: 'https://example.com/original.jpg' } }],
    });

    const { container } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(1));
    expect(cards(container)[0].getAttribute('data-image')).toBe('https://example.com/original.jpg');
  });

  it('does not replace product images in non-latest fixed-product blocks', async () => {
    listMock.mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'زجاجة مسك بيضاء',
          image: { url: 'https://example.com/original.jpg' },
        },
      ],
    });

    const { container } = renderBlock({
      products: { source: 'categories', source_value: [1] },
    });
    await waitFor(() => expect(cards(container)).toHaveLength(1));
    expect(cards(container)[0].getAttribute('data-image')).toBe('https://example.com/original.jpg');
  });

  it('limits the local preview latest-products block to six cards', async () => {
    listMock.mockResolvedValue({ items: latestProductsFromApi() });
    const { container } = renderBlock({
      products: { source: 'latest' },
      limit: 6,
    });

    await waitFor(() => expect(cards(container)).toHaveLength(6));
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: 6 }));
  });

  it('drops "View All" when a latest block came back short of its limit', async () => {
    listMock.mockResolvedValue({ items: latestProductsFromApi(2) });
    const { container, queryByText } = renderBlock({
      products: { source: 'latest' },
      limit: 6,
      title: 'Latest',
      display_all_url: '/latest-products',
    });
    await waitFor(() => expect(cards(container)).toHaveLength(2));
    expect(queryByText('View All')).toBeNull();
  });

  it('keeps "View All" when a latest block filled its limit', async () => {
    listMock.mockResolvedValue({ items: latestProductsFromApi() });
    const { findByText } = renderBlock({
      products: { source: 'latest' },
      limit: 6,
      title: 'Latest',
      display_all_url: '/latest-products',
    });
    expect(await findByText('View All')).toBeTruthy();
  });

  it('keeps "View All" on other sources, however few products came back', async () => {
    listMock.mockResolvedValue({ items: products(2) });
    const { findByText } = renderBlock({
      products: { source: 'categories', source_value: [1] },
      limit: 4,
      title: 'Dresses',
      display_all_url: '/dresses',
    });
    expect(await findByText('View All')).toBeTruthy();
  });

  it('uses horizontal cards when the store layout is horizontal', async () => {
    cardLayout.value = 'horizontal';
    listMock.mockResolvedValue({ items: products(2) });
    const { container } = renderBlock({ isVertical: true });
    await waitFor(() => expect(cards(container)).toHaveLength(2));
    expect(cards(container)[0].getAttribute('data-layout')).toBe('horizontal');
    expect(container.querySelector('.s-products-list-horizontal-cards')).toBeTruthy();
  });

  it("keeps a block's own horizontal choice under the vertical store layout", async () => {
    listMock.mockResolvedValue({ items: products(2) });
    const { container } = renderBlock({ isVertical: false });
    await waitFor(() => expect(cards(container)).toHaveLength(2));
    expect(cards(container)[0].getAttribute('data-layout')).toBe('horizontal');
  });

  it('uses horizontal cards when vertical_fixed_products is off', async () => {
    themeSettings.vertical_fixed_products = false;
    listMock.mockResolvedValue({ items: products(2) });
    const { container } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(2));
    expect(cards(container)[0].getAttribute('data-layout')).toBe('horizontal');
    expect(container.querySelector('.s-products-list-horizontal-cards')).toBeTruthy();
  });

  it.each([true, undefined])(
    'uses vertical cards when vertical_fixed_products is %s',
    async (setting) => {
      if (setting !== undefined) themeSettings.vertical_fixed_products = setting;
      listMock.mockResolvedValue({ items: products(2) });
      const { container } = renderBlock({});
      await waitFor(() => expect(cards(container)).toHaveLength(2));
      expect(cards(container)[0].getAttribute('data-layout')).toBe('vertical');
      expect(container.querySelector('.s-products-list-vertical-cards')).toBeTruthy();
    }
  );

  it.each([
    [false, true, 'horizontal'],
    [true, false, 'vertical'],
  ] as const)(
    "follows vertical_fixed_products %s over the API's isVertical %s, as Twig Raed does",
    async (setting, isVertical, layout) => {
      themeSettings.vertical_fixed_products = setting;
      listMock.mockResolvedValue({ items: products(2) });
      const { container } = renderBlock({ isVertical });
      await waitFor(() => expect(cards(container)).toHaveLength(2));
      expect(cards(container)[0].getAttribute('data-layout')).toBe(layout);
    }
  );

  it('lets the store-wide horizontal layout beat vertical_fixed_products', async () => {
    cardLayout.value = 'horizontal';
    themeSettings.vertical_fixed_products = true;
    listMock.mockResolvedValue({ items: products(2) });
    const { container } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(2));
    expect(cards(container)[0].getAttribute('data-layout')).toBe('horizontal');
  });
});

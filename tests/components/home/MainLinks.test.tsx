import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MainLinks } from '../../../app/components/home/MainLinks';

// Mock the sub-path exports
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
    target,
  }: {
    to: string;
    children?: React.ReactNode;
    className?: string;
    target?: string;
  }) => (
    <a href={to} className={className} target={target}>
      {children}
    </a>
  ),
}));

describe('MainLinks', () => {
  const mockLinks = [
    { url: '/cat1', icon: 'sicon-cat1', title: 'Category 1' },
    { url: '/cat2', icon: 'sicon-cat2', title: 'Category 2' },
  ];

  const mockCategories = [
    { url: '/cat1', name: 'Category 1', icon: 'sicon-cat1' },
    { url: '/cat2', name: 'Category 2', image: 'cat2.jpg' },
  ];

  it('renders SallaSlider with carousel type', () => {
    const { container } = render(<MainLinks data={{ links: mockLinks, position: 1 }} />);
    const slider = container.querySelector('salla-slider');
    expect(slider?.getAttribute('type')).toBe('carousel');
    expect(slider?.getAttribute('id')).toBe('main-links-1');
    expect(slider?.getAttribute('controls-outer')).toBe('true');
    expect(slider?.getAttribute('show-controls')).toBe('false');
  });

  it('centers links that fit without scrolling instead of leaving them at the start edge', () => {
    const { container } = render(<MainLinks data={{ links: mockLinks }} />);
    const config = JSON.parse(
      container.querySelector('salla-slider')?.getAttribute('slider-config') ?? '{}'
    );
    expect(config.centerInsufficientSlides).toBe(true);
  });

  it('renders links with icon', () => {
    const { container } = render(<MainLinks data={{ links: mockLinks }} />);
    const icon = container.querySelector('.slide--cat-entry i');
    expect(icon?.className).toBe('sicon-cat1');
  });

  it("shows a link's image instead of its icon", () => {
    const { container } = render(
      <MainLinks
        data={{
          links: [
            { url: '/perfume', icon: 'sicon-cat1', image: 'perfume.png', title: 'Perfume' },
            { url: '/gifts', icon: 'sicon-gift', title: 'Gifts' },
          ],
        }}
      />
    );
    const [withImage, withIcon] = Array.from(container.querySelectorAll('.slide--cat-entry'));
    const img = withImage.querySelector('img');
    expect(img?.getAttribute('src')).toBe('perfume.png');
    expect(withImage.querySelector('i')).toBeNull();
    // No image: the icon, as before.
    expect(withIcon.querySelector('img')).toBeNull();
    expect(withIcon.querySelector('i')?.className).toBe('sicon-gift');
  });

  it('renders links with title', () => {
    const { container } = render(<MainLinks data={{ links: mockLinks }} />);
    const title = container.querySelector('.slide--cat-entry h2');
    expect(title?.textContent).toBe('Category 1');
  });

  it('renders selected store categories when show_cats is true', () => {
    const { container } = render(
      <MainLinks data={{ categories: mockCategories, show_cats: true }} />
    );
    const items = container.querySelectorAll('.royaloud-category-card');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('h3')?.textContent).toBe('Category 1');
    expect(items[1].querySelector('h3')?.textContent).toBe('Category 2');
    expect(container.querySelector('salla-slider')).toBeNull();
  });

  it('uses the store category name, image, and link instead of fixed presentation data', () => {
    const { container } = render(
      <MainLinks
        data={{
          categories: [{ url: '/oud', name: 'أدهان العود الملكية', image: 'old-category.jpg' }],
          show_cats: true,
        }}
      />
    );
    const card = container.querySelector('.royaloud-category-card');
    expect(card?.getAttribute('href')).toBe('/oud');
    expect(card?.querySelector('img')?.getAttribute('src')).toBe('old-category.jpg');
    expect(card?.querySelector('h3')?.textContent).toBe('أدهان العود الملكية');
  });

  it('renders every selected category in editor order with its own image and name', () => {
    const categories = [
      { id: 1, url: '/natural-oud', name: 'العود الطبيعي والمحسن', image: '/store/cat1.png' },
      { id: 2, url: '/oud-oils', name: 'أدهان العود الملكية', image: '/store/cat2.png' },
      { id: 3, url: '/mabthouth', name: 'المبثوث والمعمول', image: '/store/cat3.png' },
      { id: 4, url: '/burners', name: 'المباخر والإكسسوارات', image: '/store/cat4.png' },
      { id: 5, url: '/perfumes', name: 'العطور الشرقية', image: '/store/cat5.png' },
      { id: 6, url: '/more', name: 'تصنيف إضافي', image: '/store/cat6.png' },
    ];
    const { container } = render(
      <MainLinks data={{ categories, show_cats: true, title: 'الأقسام' }} />
    );
    const cards = Array.from(container.querySelectorAll('.royaloud-category-card'));

    expect(
      cards.every((card) =>
        Boolean(card.querySelector('.royaloud-category-card__image')?.nextElementSibling?.matches('h3'))
      )
    ).toBe(true);
    expect(cards).toHaveLength(6);
    expect(cards.map((card) => card.querySelector('h3')?.textContent)).toEqual(
      categories.map((category) => category.name)
    );
    expect(cards.map((card) => card.querySelector('img')?.getAttribute('src'))).toEqual(
      categories.map((category) => category.image)
    );
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(
      categories.map((category) => category.url)
    );
    expect(container.querySelector('.royaloud-category-grid__title')?.textContent).toBe('الأقسام');
  });

  it.each([
    [
      'link',
      { links: [{ url: '/perfume', image: 'perfume.png', title: 'Perfume' }] },
      '.slide--cat-entry',
      'h2',
      'Perfume',
    ],
    [
      'category',
      {
        categories: [{ url: '/perfume', image: 'perfume.png', name: 'العطور الشرقية' }],
        show_cats: true,
      },
      '.royaloud-category-card',
      'h3',
      'العطور الشرقية',
    ],
  ])(
    'names a %s with an image once, by the title shown beside it',
    (_kind, data, card, heading, title) => {
      const { container } = render(<MainLinks data={data} />);
      const entry = container.querySelector(card)!;
      expect(entry.querySelector('img')?.getAttribute('alt')).toBe('');
      expect(entry.querySelector(heading)?.textContent).toBe(title);
    }
  );

  it('returns null when no links', () => {
    const { container } = render(<MainLinks data={{ links: [] }} />);
    expect(container.firstChild).toBeNull();
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HeaderMainMenu } from '../../../app/components/layout/HeaderMainMenu';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      { id: 'natural-oud', title: 'العود الطبيعي والمحسن', url: '/ar/oud/c101' },
      { id: 'oud-oils', title: 'أدهان العود الملكية', url: '/ar/oud-oils/c102' },
      { id: 'mabthouth', title: 'المبثوث والمعمول', url: '/ar/mabthouth/c103' },
      { id: 'burners', title: 'المباخر والإكسسوارات', url: '/ar/burners/c104' },
      { id: 'perfumes', title: 'العطور الشرقية', url: '/ar/perfumes/c105' },
    ],
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menus', 'header'] }) } },
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: { enable_more_menu: true } } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('../../../app/components/product', () => ({
  ProductCard: () => null,
}));

describe('HeaderMainMenu', () => {
  it('uses the merchant menu and its real category routes', () => {
    const { container } = render(<HeaderMainMenu />);
    const links = Array.from(container.querySelectorAll('.main-menu a')).filter(
      (link) => !link.closest('.site-header__more-probe')
    );

    expect(links.map((link) => link.textContent)).toEqual([
      'العود الطبيعي والمحسن',
      'أدهان العود الملكية',
      'المبثوث والمعمول',
      'المباخر والإكسسوارات',
      'العطور الشرقية',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/ar/oud/c101',
      '/ar/oud-oils/c102',
      '/ar/mabthouth/c103',
      '/ar/burners/c104',
      '/ar/perfumes/c105',
    ]);
  });
});

import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HeaderNav } from '../../../app/components/layout/HeaderNav';

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

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    languageName: 'English',
    isRTL: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    store: { name: 'Store', url: '/', logo: '/logo.png', settings: {} },
    currency: { code: 'SAR' },
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  Image: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

afterEach(() => {
  cleanup();
  document.body.className = '';
  vi.useRealTimers();
});

describe('HeaderNav', () => {
  it('renders nothing while closed', () => {
    const { container } = render(<HeaderNav open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the merchant menu and its real category routes in the drawer', () => {
    const { container } = render(<HeaderNav open onClose={() => {}} />);
    const links = Array.from(container.querySelectorAll('.site-nav-drawer__link'));

    expect(links.map((link) => link.textContent?.trim())).toEqual([
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
    expect(container.querySelectorAll('.site-nav-drawer__panel')).toHaveLength(1);
    expect(container.querySelector('.site-nav-drawer__browse-all')).toBeNull();
  });

  it('locks body scrolling while the category drawer is open', () => {
    render(<HeaderNav open onClose={() => {}} />);
    expect(document.body.classList.contains('menu-opened')).toBe(true);
  });
});

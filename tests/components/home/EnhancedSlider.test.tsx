import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedSlider } from '../../../app/components/home/EnhancedSlider';

let themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: themeSettings } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('EnhancedSlider', () => {
  it('renders a centered text overlay without an eyebrow label', () => {
    const { container } = render(<EnhancedSlider data={{}} />);
    const image = container.querySelector('.royaloud-hero-banner img');

    expect(image?.getAttribute('src')).toBe('/images/hero-main%20(2).png');
    expect(image?.getAttribute('alt')).toBe('');
    expect(container.querySelector('.royaloud-hero-banner__eyebrow')).toBeNull();
    expect(container.querySelector('.royaloud-hero-banner__title')?.textContent).toBe('عودٌ يليق بك');
    expect(container.querySelector('.royaloud-hero-banner__subtitle')?.textContent).toContain(
      'اكتشف نفائس العود الطبيعي'
    );
    expect(container.querySelector('.royaloud-hero-banner__cta')?.textContent).toBe('تسوق بفخامة');
    expect(container.querySelector('.royaloud-hero-banner__scrim')).toBeTruthy();
  });

  it('uses the merchant text and CTA destination settings', () => {
    themeSettings = {
      hero_eyebrow: 'اختيار التاجر',
      hero_title: 'عنوان قابل للتعديل',
      hero_subtitle: 'وصف قابل للتعديل',
      hero_cta_url: '/ar/oud/c101',
      hero_cta_label: 'اكتشف المزيد',
    };
    const { container } = render(<EnhancedSlider data={{}} />);
    const cta = container.querySelector('.royaloud-hero-banner__cta');

    expect(container.querySelector('.royaloud-hero-banner__eyebrow')).toBeNull();
    expect(container.querySelector('.royaloud-hero-banner__title')?.textContent).toBe(
      'عنوان قابل للتعديل'
    );
    expect(container.querySelector('.royaloud-hero-banner__subtitle')?.textContent).toBe(
      'وصف قابل للتعديل'
    );
    expect(cta?.textContent).toBe('تسوق بفخامة');
    expect(cta?.getAttribute('href')).toBe('/ar/oud/c101');
    themeSettings = {};
  });

  it('renders a static banner and keeps the configured CTA label fixed', () => {
    themeSettings = { hero_cta_label: '' };
    const { container } = render(<EnhancedSlider data={{ slider_banner: [{ image: 'old.jpg' }] }} />);
    const cta = container.querySelector('.royaloud-hero-banner__cta');

    expect(container.querySelector('salla-slider')).toBeNull();
    expect(container.querySelector('.royaloud-hero-banner')).toBeTruthy();
    expect(cta?.textContent).toBe('تسوق بفخامة');
    themeSettings = {};
  });
});

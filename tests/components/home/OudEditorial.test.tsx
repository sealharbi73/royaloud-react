import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { OudEditorial } from '../../../app/components/home/OudEditorial';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to: string; children?: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Image: ({ src, alt }: { src: string; alt?: string }) => <img src={src} alt={alt} />,
}));

describe('OudEditorial', () => {
  it('renders editable story content, image, and its destination', () => {
    const { getByRole, getByText } = render(
      <OudEditorial
        data={{
          eyebrow: 'نفحات من التراث',
          title: 'حكاية العود',
          description: 'تفاصيل من عالم العود.',
          image: { url: '/images/oud.png', alt: 'قطع العود' },
          button_text: 'اكتشف عالم العود',
          button_link: '/products',
        }}
      />
    );

    expect(getByText('حكاية العود')).toBeTruthy();
    expect(getByText('تفاصيل من عالم العود.')).toBeTruthy();
    expect(getByRole('img', { name: 'قطع العود' }).getAttribute('src')).toBe('/images/oud.png');
    expect(getByRole('link', { name: 'اكتشف عالم العود' }).getAttribute('href')).toBe('/products');
  });

  it('does not render a button without both its label and destination', () => {
    const { queryByRole } = render(
      <OudEditorial data={{ title: 'حكاية العود', button_text: 'اكتشف عالم العود' }} />
    );

    expect(queryByRole('link')).toBeNull();
  });

  it('renders nothing when all editable content is empty', () => {
    const { container } = render(<OudEditorial data={{}} />);
    expect(container.firstChild).toBeNull();
  });
});

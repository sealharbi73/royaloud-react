import { memo } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';

type EditorialImage = string | { url?: string; alt?: string } | null;

export interface OudEditorialProps {
  data: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: EditorialImage;
    button_text?: string;
    button_link?: string;
  };
}

export const OudEditorial = memo(function OudEditorial({ data }: OudEditorialProps) {
  const imageSource = typeof data.image === 'string' ? data.image : data.image?.url;
  const imageAlt = typeof data.image === 'object' && data.image ? data.image.alt : data.title;

  if (!data.title && !data.description && !imageSource) return null;

  return (
    <div className="container">
      <div className="oud-editorial">
        <div className="oud-editorial__content">
          {data.eyebrow && <p className="oud-editorial__eyebrow">{data.eyebrow}</p>}
          {data.title && <h2 className="oud-editorial__title">{data.title}</h2>}
          {data.description && <p className="oud-editorial__description">{data.description}</p>}
          {data.button_text && data.button_link && (
            <Link to={data.button_link} className="oud-editorial__link">
              {data.button_text}
            </Link>
          )}
        </div>
        <div className="oud-editorial__media">
          {imageSource && (
            <Image
              src={imageSource}
              alt={imageAlt || ''}
              className="h-full w-full object-cover"
              width={960}
              height={720}
            />
          )}
          <span className="oud-editorial__seal" aria-hidden="true">
            ROYAL OUD
          </span>
        </div>
      </div>
    </div>
  );
});

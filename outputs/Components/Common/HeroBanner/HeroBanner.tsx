import React from 'react';
import placeholderImg from '@images/placeholder.png';
import './HeroBanner.css';

export interface HeroBannerProps {
  className?: string;
  /* URL da imagem para orientação horizontal (paisagem) */
  imageUrlHorizontal?: string;
  /* URL da imagem para orientação vertical (retrato) */
  imageUrlVertical?: string;
  /* Força uma orientação no componente ou deixa automático via tag picture */
  orientation?: 'Auto' | 'Horizontal' | 'Vertical';
  /* Texto alternativo para acessibilidade */
  altText?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  className = '',
  imageUrlHorizontal = placeholderImg,
  imageUrlVertical = placeholderImg,
  orientation = 'Auto',
  altText = 'Banner promocional',
}) => {
  const wrapperClass = `hero-banner ${className}`.trim();

  return (
    <div className={wrapperClass}>
      {orientation === 'Auto' ? (
        <picture className="hero-banner__picture">
          <source
            media="(orientation: portrait)"
            srcSet={imageUrlVertical || imageUrlHorizontal}
          />
          <img className="hero-banner__image" src={imageUrlHorizontal} alt={altText} />
        </picture>
      ) : orientation === 'Vertical' ? (
        <img
          key="vertical"
          className="hero-banner__image"
          src={imageUrlVertical || imageUrlHorizontal}
          alt={altText}
        />
      ) : (
        <img
          key="horizontal"
          className="hero-banner__image"
          src={imageUrlHorizontal}
          alt={altText}
        />
      )}
    </div>
  );
};

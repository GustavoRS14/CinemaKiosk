import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../HeroBanner';
import './HeroCarousel.css';

export interface HeroCarouselItem {
  id: string | number;
  imageUrlHorizontal: string;
  imageUrlVertical?: string;
  altText?: string;
}

export interface HeroCarouselProps {
  className?: string;
  /* Array of items to be displayed in the carousel */
  items: HeroCarouselItem[];
  /* Forces the orientation for all banners inside the carousel */
  orientation?: 'Auto' | 'Horizontal' | 'Vertical';
  /* Time in milliseconds between slide transitions. Default is 7000 (7 seconds) */
  interval?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  className = '',
  items = [],
  orientation = 'Auto',
  interval = 7000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);

  // CRITICAL FIX: If exactly 2 items exist, duplicate them to allow continuous 3-state CSS transition without rewinding
  const displayItems = items.length === 2
    ? [...items, ...items.map(item => ({ ...item, id: `${item.id}_clone` }))]
    : items;

  const isSingleItem = displayItems.length === 1;

  useEffect(() => {
    if (isSingleItem || displayItems.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % displayItems.length;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [displayItems.length, interval, isSingleItem]);

  if (!displayItems || displayItems.length === 0) {
    return null;
  }

  return (
    <div className={`hero-carousel ${className}`.trim()}>
      <div className="hero-carousel__track">
        {displayItems.map((item, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === prevIndex;

          let slideClass = 'hero-carousel__slide';
          
          // CRITICAL FIX: Apply static class if there is only 1 item to prevent any entrance animations
          if (isSingleItem) {
            slideClass += ' hero-carousel__slide--static';
          } else {
            if (isActive) slideClass += ' hero-carousel__slide--active';
            else if (isPrev) slideClass += ' hero-carousel__slide--prev';
          }

          return (
            <div
              key={item.id}
              className={slideClass}
              aria-hidden={!isActive && !isSingleItem}
            >
              <HeroBanner 
                altText={item.altText} 
                imageUrlHorizontal={item.imageUrlHorizontal} 
                imageUrlVertical={item.imageUrlVertical} 
                orientation={orientation}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

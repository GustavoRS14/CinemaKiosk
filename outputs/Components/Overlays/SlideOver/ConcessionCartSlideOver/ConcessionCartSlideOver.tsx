import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react';

import { ConcessionOnCart, type ConcessionFlowType } from '../../../Common/ConcessionOnCart';
import { Divider } from '../../../Common/Divider';
import { ModalFooter } from '../../../Common/ModalFooter';
import { ModalHeader } from '../../../Common/ModalHeader';
import { TextButton } from '../../../Common/TextButton';
import EmptyCartIllustration from '@illustrations/EmptyCart.svg';
import { useI18n, type TranslationKey } from '../../../../i18n';
import './ConcessionCartSlideOver.css';

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8.5 9.5v7m3.5-7v7m3.5-7v7M5.5 6.5h13M9 6.5V4.75h6V6.5m2.25 0-.75 12H7.5l-.75-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type ConcessionCartItem = {
  id: string;
  category: string;
  productName: string;
  price: string;
  imageUrl?: string;
  quantity?: number;
  flowType?: ConcessionFlowType;
  modifiers?: Array<{ quantity: number; name: string }>;
};

export type ConcessionCartSlideOverProps = {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  items?: ConcessionCartItem[];
  suggestions?: ConcessionCartItem[];
  maxItems?: number;
  showDiscount?: boolean;
  discountLabel?: string;
  discountPrice?: string;
  ticketCount?: number;
  ticketSubtotal?: string;
  onEditItem?: (item: ConcessionCartItem) => void;
  /** Persists quantities so suggestions can be promoted to their category on the next opening. */
  onItemsChange?: (items: ConcessionCartItem[]) => void;
  /** Requests confirmation before the cart is cleared. */
  onRequestClearCart?: () => void;
  onClearCart?: () => void;
  onPay?: () => void;
  onClose?: () => void;
  className?: string;
};

export function ConcessionCartSlideOver({
  width = 'md',
  items = [],
  suggestions = [],
  maxItems = 10,
  showDiscount = false,
  discountLabel,
  discountPrice = '0,00',
  ticketCount = 0,
  ticketSubtotal,
  onEditItem,
  onItemsChange,
  onRequestClearCart,
  onClearCart,
  onPay,
  onClose,
  className = '',
}: ConcessionCartSlideOverProps) {
  const { t } = useI18n();
  const resolvedDiscountLabel = discountLabel ?? t('cart.comboOffer');
  const allProducts = useMemo(() => [...items, ...suggestions], [items, suggestions]);
  const [sessionSuggestionIds] = useState(() => new Set(
    suggestions.filter(item => (item.quantity ?? 0) === 0).map(item => item.id),
  ));
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(allProducts.map(item => [item.id, item.quantity ?? 0])),
  );
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(() => new Set());
  const [suggestionVersions, setSuggestionVersions] = useState<Record<string, number>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [suggestionsDocked, setSuggestionsDocked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLElement>(null);

  const promotedSuggestions = suggestions.filter(item => !sessionSuggestionIds.has(item.id));
  const sessionSuggestions = suggestions.filter(item => sessionSuggestionIds.has(item.id));
  const cartProducts = [...items, ...promotedSuggestions];
  const visibleItems = cartProducts.filter(item => !removedItemIds.has(item.id));
  const itemCount = allProducts.reduce(
    (total, item) => total + (removedItemIds.has(item.id) ? 0 : (quantities[item.id] ?? 0)),
    0,
  );
  const hasActiveSessionSuggestion = sessionSuggestions.some(
    item => (quantities[item.id] ?? 0) > 0,
  );
  const isEmpty = visibleItems.length === 0 && !hasActiveSessionSuggestion;
  const categories = [...new Set(visibleItems.map(item => item.category))];
  const localizeCategory = (category: string) => {
    const normalized = category.trim().toLocaleLowerCase('pt-BR');
    const key = ({
      combo: 'concessions.category.combos', combos: 'concessions.category.combos',
      pipoca: 'concessions.category.popcorn', pipocas: 'concessions.category.popcorn', popcorn: 'concessions.category.popcorn',
      bebida: 'concessions.category.beverages', bebidas: 'concessions.category.beverages', beverage: 'concessions.category.beverages',
      doce: 'concessions.category.candy', doces: 'concessions.category.candy', candy: 'concessions.category.candy',
      colecionável: 'concessions.category.collectibles', colecionáveis: 'concessions.category.collectibles', collectible: 'concessions.category.collectibles',
    } as Record<string, TranslationKey>)[normalized];
    return key ? t(key) : category;
  };

  const parsePrice = (price: string) => {
    const normalized = price.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    return Math.round((Number.parseFloat(normalized) || 0) * 100);
  };
  const formatPrice = (valueInCents: number) => new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueInCents / 100);
  const subtotalInCents = allProducts.reduce(
    (total, item) => total + parsePrice(item.price) * (removedItemIds.has(item.id) ? 0 : (quantities[item.id] ?? 0)),
    0,
  );
  const discountInCents = showDiscount ? parsePrice(discountPrice) : 0;
  const ticketSubtotalInCents = ticketSubtotal ? parsePrice(ticketSubtotal) : 0;
  const combinedSubtotalInCents = subtotalInCents + ticketSubtotalInCents;
  const combinedItemCount = itemCount + ticketCount;
  const hasTicketOrder = ticketCount > 0 && ticketSubtotal !== undefined;
  const showConcessionBreakdown = hasTicketOrder && itemCount > 0;
  const totalInCents = Math.max(0, combinedSubtotalInCents - discountInCents);

  const persistQuantities = (nextQuantities: Record<string, number>) => {
    onItemsChange?.(allProducts.map(item => ({ ...item, quantity: nextQuantities[item.id] ?? 0 })));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setQuantities(current => {
      const currentQuantity = current[id] ?? 0;
      const allowedQuantity = quantity > currentQuantity && itemCount >= maxItems ? currentQuantity : quantity;
      const next = { ...current, [id]: Math.max(0, allowedQuantity) };
      persistQuantities(next);
      return next;
    });
  };

  const clearCart = () => {
    setQuantities(current => Object.fromEntries(Object.keys(current).map(id => [id, 0])));
    setRemovedItemIds(new Set(cartProducts.map(item => item.id)));
    onItemsChange?.(allProducts.map(item => ({ ...item, quantity: 0 })));
    onClearCart?.();
  };

  const finalizeRemoval = (id: string) => {
    setQuantities(current => {
      const next = { ...current, [id]: 0 };
      persistQuantities(next);
      return next;
    });
    setRemovedItemIds(current => new Set(current).add(id));
  };

  const finalizeSuggestionRemoval = (id: string) => {
    setQuantities(current => {
      const next = { ...current, [id]: 0 };
      persistQuantities(next);
      return next;
    });
    setSuggestionVersions(current => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };

  const maxQuantityFor = (id: string) => {
    const currentQuantity = quantities[id] ?? 0;
    return currentQuantity + Math.max(0, maxItems - itemCount);
  };

  const measureSuggestionPosition = useCallback(() => {
    const content = contentRef.current;
    const products = productsRef.current;
    const suggestionList = suggestionsRef.current;
    if (!content || !products || !suggestionList || isEmpty) {
      setSuggestionsDocked(false);
      return;
    }

    setSuggestionsDocked(
      products.offsetHeight + suggestionList.offsetHeight <= content.clientHeight,
    );
  }, [isEmpty]);

  useEffect(() => {
    measureSuggestionPosition();
    const observer = new ResizeObserver(measureSuggestionPosition);
    if (contentRef.current) observer.observe(contentRef.current);
    if (productsRef.current) observer.observe(productsRef.current);
    if (suggestionsRef.current) observer.observe(suggestionsRef.current);
    return () => observer.disconnect();
  }, [measureSuggestionPosition, visibleItems.length, sessionSuggestions.length]);

  return (
    <aside
      className={`concession-cart-slide-over ${isScrolled ? 'concession-cart-slide-over--scrolled' : ''} ${className}`.trim()}
      data-width={width}
      aria-label={t('cart.title')}
    >
      <ModalHeader text={t('cart.title')} onClose={onClose} className="concession-cart-slide-over__header" />

      <div
        ref={contentRef}
        className={`concession-cart-slide-over__content ${isEmpty ? 'concession-cart-slide-over__content--empty' : ''} ${suggestionsDocked ? 'concession-cart-slide-over__content--suggestions-docked' : ''}`.trim()}
        onScroll={(event: UIEvent<HTMLDivElement>) => setIsScrolled(event.currentTarget.scrollTop > 0)}
      >
        {isEmpty ? (
          <div className="concession-cart-slide-over__empty">
            <EmptyCartIllustration aria-hidden="true" />
            <div>
              <h2>{t('cart.emptyTitle')}</h2>
              <p>{t('cart.emptyDescription')}</p>
            </div>
          </div>
        ) : (
          <>
            <div ref={productsRef} className="concession-cart-slide-over__products">
              <div className="concession-cart-slide-over__clear-action">
                <TextButton
                  label={t('cart.clear')}
                  intent="Danger"
                  size="sm"
                  weight="SemiBold"
                  hasRightIcon
                  rightIcon={<TrashIcon />}
                  onClick={onRequestClearCart ?? clearCart}
                />
              </div>

              <div className="concession-cart-slide-over__groups">
                {categories.map((category, categoryIndex) => (
                  <section className="concession-cart-slide-over__group" key={category}>
                    {categoryIndex > 0 && <Divider />}
                    <h2>{localizeCategory(category)}</h2>
                    <div className="concession-cart-slide-over__items">
                      {visibleItems.filter(item => item.category === category).map(item => (
                        <ConcessionOnCart
                          key={item.id}
                          productName={item.productName}
                          price={item.price}
                          imageUrl={item.imageUrl}
                          quantity={quantities[item.id] ?? 0}
                          maxQuantity={maxQuantityFor(item.id)}
                          flowType={item.flowType ?? 'Express'}
                          hasModifiers={Boolean(item.modifiers?.length)}
                          modifiers={item.modifiers}
                          onEdit={() => onEditItem?.(item)}
                          onQuantityChange={quantity => updateQuantity(item.id, quantity)}
                          onRemove={() => finalizeRemoval(item.id)}
                          onUndo={() => setRemovedItemIds(current => {
                            const next = new Set(current);
                            next.delete(item.id);
                            return next;
                          })}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {sessionSuggestions.length > 0 && (
              <section ref={suggestionsRef} className="concession-cart-slide-over__suggestions">
                <h2>{t('cart.suggestions')}</h2>
                <div className="concession-cart-slide-over__items">
                  {sessionSuggestions.map(item => (
                    <ConcessionOnCart
                      key={`${item.id}-${suggestionVersions[item.id] ?? 0}`}
                      productName={item.productName}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      quantity={quantities[item.id] ?? 0}
                      maxQuantity={maxQuantityFor(item.id)}
                      onQuantityChange={quantity => updateQuantity(item.id, quantity)}
                      onRemove={() => finalizeSuggestionRemoval(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <ModalFooter
        className="concession-cart-slide-over__footer"
        layout="cart"
        itemCount={combinedItemCount}
        subtotalPrice={formatPrice(combinedSubtotalInCents)}
        ticketCount={hasTicketOrder ? ticketCount : undefined}
        ticketSubtotal={hasTicketOrder ? formatPrice(ticketSubtotalInCents) : undefined}
        concessionCount={showConcessionBreakdown ? itemCount : undefined}
        concessionSubtotal={showConcessionBreakdown ? formatPrice(subtotalInCents) : undefined}
        showDiscount={!isEmpty && showDiscount}
        discountLabel={resolvedDiscountLabel}
        discountPrice={discountPrice}
        price={formatPrice(totalInCents)}
        primaryLabel={t('concessions.payOrder')}
        primaryDisabled={isEmpty && !hasTicketOrder}
        onPrimaryAction={onPay}
      />
    </aside>
  );
}

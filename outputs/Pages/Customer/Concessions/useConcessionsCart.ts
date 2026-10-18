import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ALL_CONCESSION_PRODUCTS,
  type ConcessionProduct,
} from './concessionsCatalog';
import { useCustomerPurchaseLimits } from '../customerPurchaseLimits';

export type CartNotification = {
  id: number;
  badge: 'Added' | 'Removed';
  product: ConcessionProduct;
  previousAmount: number;
};

const CART_STORAGE_KEY = 'totem-concessions-cart';
const CART_PRICES_STORAGE_KEY = 'totem-concessions-cart-offer-prices';
const CART_CHANGE_EVENT = 'totem-concessions-cart-change';

export function resetConcessionsCartSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.localStorage.removeItem(CART_PRICES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

function readCartQuantities(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    const productIds = new Set(ALL_CONCESSION_PRODUCTS.map(({ id }) => id));
    return Object.fromEntries(Object.entries(parsed)
      .filter(([id, quantity]) => productIds.has(id) && typeof quantity === 'number' && quantity > 0)
      .map(([id, quantity]) => [id, Math.floor(quantity as number)]));
  } catch {
    return {};
  }
}

function persistCartQuantities(quantities: Record<string, number>) {
  if (typeof window === 'undefined') return;
  const normalized = Object.fromEntries(Object.entries(quantities).filter(([, quantity]) => quantity > 0));
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // The active page still keeps the cart when persistent storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

function readDiscountedPrices(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(CART_PRICES_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function persistDiscountedPrices(prices: Record<string, number>) {
  try {
    window.localStorage.setItem(CART_PRICES_STORAGE_KEY, JSON.stringify(prices));
  } catch {
    // The active page still keeps promotional prices in memory.
  }
}

function clampCartQuantities(quantities: Record<string, number>, maxItems: number) {
  let remaining = maxItems;
  return Object.fromEntries(Object.entries(quantities).map(([id, quantity]): [string, number] => {
    const nextQuantity = Math.min(Math.max(0, Math.floor(quantity)), remaining);
    remaining -= nextQuantity;
    return [id, nextQuantity];
  }).filter((entry) => entry[1] > 0));
}

export function useConcessionsCart() {
  const { maxConcessionItems } = useCustomerPurchaseLimits();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => clampCartQuantities(readCartQuantities(), maxConcessionItems),
  );
  const [notification, setNotification] = useState<CartNotification | null>(null);
  const [discountedPrices, setDiscountedPrices] = useState<Record<string, number>>(readDiscountedPrices);

  useEffect(() => {
    const update = () => {
      setQuantities(clampCartQuantities(readCartQuantities(), maxConcessionItems));
      setDiscountedPrices(readDiscountedPrices());
      setNotification(null);
    };
    window.addEventListener(CART_CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [maxConcessionItems]);

  useEffect(() => {
    setQuantities((current) => {
      const next = clampCartQuantities(current, maxConcessionItems);
      if (JSON.stringify(next) === JSON.stringify(current)) return current;
      persistCartQuantities(next);
      return next;
    });
  }, [maxConcessionItems]);

  const totalItems = useMemo(
    () => Object.values(quantities).reduce((total, quantity) => total + quantity, 0),
    [quantities],
  );

  const totalPrice = useMemo(
    () => ALL_CONCESSION_PRODUCTS.reduce(
      (total, product) => total + (quantities[product.id] ?? 0) * (discountedPrices[product.id] ?? product.price),
      0,
    ),
    [discountedPrices, quantities],
  );

  const changeAmount = useCallback((product: ConcessionProduct, amount: number, offeredUnitPrice?: number) => {
    if (offeredUnitPrice !== undefined) {
      setDiscountedPrices((current) => {
        const next = { ...current, [product.id]: offeredUnitPrice };
        persistDiscountedPrices(next);
        return next;
      });
    } else if (amount <= 0) {
      setDiscountedPrices((current) => {
        const { [product.id]: _removed, ...next } = current;
        persistDiscountedPrices(next);
        return next;
      });
    }
    setQuantities((current) => {
      const previousAmount = current[product.id] ?? 0;
      const quantityWithoutProduct = Object.entries(current).reduce(
        (total, [id, quantity]) => total + (id === product.id ? 0 : quantity),
        0,
      );
      const nextAmount = Math.max(0, Math.min(Math.floor(amount), maxConcessionItems - quantityWithoutProduct));
      if (nextAmount === previousAmount) return current;

      const nextQuantities = { ...current, [product.id]: nextAmount };
      persistCartQuantities(nextQuantities);
      setNotification({
        id: Date.now(),
        badge: nextAmount > previousAmount ? 'Added' : 'Removed',
        product,
        previousAmount,
      });
      return nextQuantities;
    });
  }, [maxConcessionItems]);

  const dismissNotification = useCallback(() => setNotification(null), []);

  const undoRemoval = useCallback(() => {
    if (!notification || notification.badge !== 'Removed') return;
    setQuantities((current) => {
      const quantityWithoutProduct = Object.entries(current).reduce(
        (total, [id, quantity]) => total + (id === notification.product.id ? 0 : quantity),
        0,
      );
      const next = {
        ...current,
        [notification.product.id]: Math.min(
          notification.previousAmount,
          Math.max(0, maxConcessionItems - quantityWithoutProduct),
        ),
      };
      persistCartQuantities(next);
      return next;
    });
    setNotification(null);
  }, [maxConcessionItems, notification]);

  const replaceQuantities = useCallback((nextQuantities: Record<string, number>) => {
    const normalizedQuantities = clampCartQuantities(nextQuantities, maxConcessionItems);
    setQuantities(normalizedQuantities);
    persistCartQuantities(normalizedQuantities);
    setDiscountedPrices((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => (normalizedQuantities[id] ?? 0) > 0),
      );
      persistDiscountedPrices(next);
      return next;
    });
  }, [maxConcessionItems]);

  const clearCart = useCallback(() => {
    setQuantities({});
    setDiscountedPrices({});
    setNotification(null);
    persistCartQuantities({});
    persistDiscountedPrices({});
  }, []);

  return {
    quantities,
    discountedPrices,
    notification,
    totalItems,
    totalPrice,
    maxItems: maxConcessionItems,
    changeAmount,
    dismissNotification,
    undoRemoval,
    replaceQuantities,
    clearCart,
  };
}

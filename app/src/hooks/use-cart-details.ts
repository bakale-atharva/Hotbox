import { api } from '@backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';

import { useCart, type CartLine } from '@/components/cart/cart-provider';

export type MenuPizza = FunctionReturnType<typeof api.pizzas.listMenu>[number];

export type CartDetailLine = CartLine & {
  pizza: MenuPizza | undefined;
  unitPrice: number;
  /** Removed from the menu or sold out since it was added. */
  unavailable: boolean;
};

/** Delivery fee in cents; the backend's DELIVERY_FEE is authoritative. */
export const DELIVERY_FEE = 299;

/**
 * Joins cart lines with the live menu so prices and sold-out state stay
 * current. The server recomputes everything when the order is placed.
 */
export function useCartDetails() {
  const cart = useCart();
  const menu = useQuery(api.pizzas.listMenu);

  const lines: CartDetailLine[] = cart.lines.map((line) => {
    const pizza = menu?.find((p) => p._id === line.pizzaId);
    return {
      ...line,
      pizza,
      unitPrice: pizza ? pizza.prices[line.size] : 0,
      unavailable: menu !== undefined && (!pizza || pizza.soldOut),
    };
  });

  const subtotal = lines
    .filter((l) => !l.unavailable)
    .reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return {
    ...cart,
    isLoading: menu === undefined,
    lines,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total: subtotal + DELIVERY_FEE,
    hasUnavailable: lines.some((l) => l.unavailable),
  };
}

import type { Id } from '@backend/convex/_generated/dataModel';
import { createContext, use, useMemo, useReducer, type ReactNode } from 'react';

import type { PizzaSize } from '@/utils/order-status';

/** Matches the backend's per-line cap (MAX_QUANTITY_PER_ITEM). */
export const MAX_QUANTITY = 20;

export type CartLine = {
  pizzaId: Id<'pizzas'>;
  size: PizzaSize;
  quantity: number;
};

export type CheckoutDraft = { address: string; phone: string; notes: string };

type State = { lines: CartLine[]; draft: CheckoutDraft };

type Action =
  | { type: 'add'; pizzaId: Id<'pizzas'>; size: PizzaSize; quantity: number }
  | { type: 'setQuantity'; pizzaId: Id<'pizzas'>; size: PizzaSize; quantity: number }
  | { type: 'clear' }
  | { type: 'setDraft'; draft: Partial<CheckoutDraft> };

const sameLine = (line: CartLine, pizzaId: Id<'pizzas'>, size: PizzaSize) =>
  line.pizzaId === pizzaId && line.size === size;

const clamp = (quantity: number) => Math.min(Math.max(quantity, 0), MAX_QUANTITY);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const existing = state.lines.find((l) => sameLine(l, action.pizzaId, action.size));
      const lines = existing
        ? state.lines.map((l) =>
            l === existing ? { ...l, quantity: clamp(l.quantity + action.quantity) } : l,
          )
        : [
            ...state.lines,
            { pizzaId: action.pizzaId, size: action.size, quantity: clamp(action.quantity) },
          ];
      return { ...state, lines };
    }
    case 'setQuantity': {
      const quantity = clamp(action.quantity);
      const lines =
        quantity === 0
          ? state.lines.filter((l) => !sameLine(l, action.pizzaId, action.size))
          : state.lines.map((l) =>
              sameLine(l, action.pizzaId, action.size) ? { ...l, quantity } : l,
            );
      return { ...state, lines };
    }
    case 'clear':
      // Keep the address and phone for next time; notes are per order.
      return { lines: [], draft: { ...state.draft, notes: '' } };
    case 'setDraft':
      return { ...state, draft: { ...state.draft, ...action.draft } };
  }
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  draft: CheckoutDraft;
  add: (pizzaId: Id<'pizzas'>, size: PizzaSize, quantity?: number) => void;
  setQuantity: (pizzaId: Id<'pizzas'>, size: PizzaSize, quantity: number) => void;
  clear: () => void;
  setDraft: (draft: Partial<CheckoutDraft>) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    lines: [],
    draft: { address: '', phone: '', notes: '' },
  });

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      count: state.lines.reduce((n, l) => n + l.quantity, 0),
      draft: state.draft,
      add: (pizzaId, size, quantity = 1) => dispatch({ type: 'add', pizzaId, size, quantity }),
      setQuantity: (pizzaId, size, quantity) =>
        dispatch({ type: 'setQuantity', pizzaId, size, quantity }),
      clear: () => dispatch({ type: 'clear' }),
      setDraft: (draft) => dispatch({ type: 'setDraft', draft }),
    }),
    [state],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const cart = use(CartContext);
  if (!cart) throw new Error('useCart must be used inside <CartProvider>');
  return cart;
}

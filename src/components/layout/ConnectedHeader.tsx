"use client";

/**
 * ConnectedHeader — wires Header props from live context.
 *
 * Replaces the static <Header cartCount={2} user={null} /> in the root layout
 * with one that reads from AuthProvider and CartProvider.
 *
 * Kept thin on purpose — all actual rendering logic lives in Header.tsx.
 */

import { useAuth } from "@/src/store/auth.store";
import { useCart } from "@/src/store/cart.store";
import { Header } from "./Header";

export function ConnectedHeader() {
  const { state: authState, logout } = useAuth();
  const { state: cartState } = useCart();

  const user = authState.user
    ? { name: authState.user.name ?? authState.user.fullName, email: authState.user.email }
    : null;

  return (
    <Header
      cartCount={cartState.items.reduce((sum, i) => sum + i.quantity, 0)}
      wishlistCount={0}
      compareCount={0}
      user={user}
      onLogout={logout}
    />
  );
}

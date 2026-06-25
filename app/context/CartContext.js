"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0); // 0-100

  useEffect(() => {
    const saved = localStorage.getItem("rollbox-cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("rollbox-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const key = `${item.id}-${item.variant}`;
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) => c.key === key ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, key, qty: 1 }];
    });
    showToast(`${item.name} added to cart!`);
  }, []);

  const updateQty = useCallback((key, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.key === key ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const removeItem = useCallback((key) => {
    setCart((prev) => prev.filter((c) => c.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountPercent(0);
  }, []);

  const setDiscount = useCallback((val) => {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    setDiscountPercent(num);
  }, []);

  const showToast = useCallback((message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0;
  const totalPrice = subtotal - discountAmount;

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, updateQty, removeItem, clearCart,
        totalItems, totalPrice, subtotal,
        discountPercent, discountAmount, setDiscount,
        toasts, setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

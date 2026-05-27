"use client";
import { useCart } from "../context/CartContext";

export default function Toast() {
  const { toasts } = useCart();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">✅ {t.message}</div>
      ))}
    </div>
  );
}

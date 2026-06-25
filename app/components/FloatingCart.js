"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="floating-cart">
      <div className="floating-cart-info">
        <span className="floating-cart-count">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
        <span className="floating-cart-divider">•</span>
        <span className="floating-cart-total">₹{totalPrice}</span>
      </div>
      <Link href="/cart" className="floating-cart-btn">
        View Cart →
      </Link>
    </div>
  );
}

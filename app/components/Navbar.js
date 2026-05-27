"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, totalPrice } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>🥡</span> Roll Box
          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 400, marginLeft: "0.5rem" }}>POS</span>
        </Link>
        <div className={`navbar-links ${open ? "open" : ""}`}>
          <Link href="/menu" className={pathname === "/menu" ? "active" : ""} onClick={() => setOpen(false)}>
            📋 Menu
          </Link>
          <Link href="/cart" className="cart-btn" onClick={() => setOpen(false)}>
            🧾 Bill
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            {totalItems > 0 && <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>₹{totalPrice}</span>}
          </Link>
        </div>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}

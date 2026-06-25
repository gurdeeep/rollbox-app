"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, totalPrice } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState(0);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const fetchUnpaid = async () => {
      try {
        const res = await fetch("/api/orders?status=unpaid");
        const data = await res.json();
        if (data.success) setUnpaidCount(data.orders?.length || 0);
      } catch {}
    };
    fetchUnpaid();
    const interval = setInterval(fetchUnpaid, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span>🥡</span> Taste N' RoLLs
        </Link>

        {/* Desktop-only links (hidden on mobile) */}
        <div className="navbar-desktop-links">
          <Link href="/menu" className={pathname === "/menu" ? "active" : ""}>
            📋 Menu
          </Link>
          <Link href="/unpaid" className={`unpaid-nav-btn ${pathname === "/unpaid" ? "active" : ""}`}>
            ⏳ Unpaid
            {unpaidCount > 0 && <span className="unpaid-nav-badge">{unpaidCount}</span>}
          </Link>
          <Link href="/history" className={pathname === "/history" ? "active" : ""}>
            📜 History
          </Link>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mobile-only quick links (visible only on phone) */}
        <div className="navbar-mobile-quick">
          <Link href="/menu" className={`nav-quick-btn ${pathname === "/menu" ? "active" : ""}`}>
            📋
          </Link>
          <Link href="/history" className={`nav-quick-btn ${pathname === "/history" ? "active" : ""}`}>
            📜
          </Link>
          <Link href="/unpaid" className={`nav-quick-btn unpaid-quick ${pathname === "/unpaid" ? "active" : ""}`}>
            ⏳
            {unpaidCount > 0 && <span className="unpaid-nav-badge">{unpaidCount}</span>}
          </Link>
        </div>

        {/* Right side — Bill + Hamburger */}
        <div className="navbar-right">
          <Link href="/cart" className="cart-btn">
            🧾 Bill
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            {totalItems > 0 && <span className="cart-price">₹{totalPrice}</span>}
          </Link>
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="navbar-dropdown">
          <Link href="/menu" className={pathname === "/menu" ? "active" : ""} onClick={() => setOpen(false)}>
            📋 Menu
          </Link>
          <Link href="/unpaid" className={`navbar-dd-link ${pathname === "/unpaid" ? "active" : ""}`} onClick={() => setOpen(false)}>
            ⏳ Unpaid
            {unpaidCount > 0 && <span className="unpaid-nav-badge">{unpaidCount}</span>}
          </Link>
          <Link href="/history" className={pathname === "/history" ? "active" : ""} onClick={() => setOpen(false)}>
            📜 Order History
          </Link>
          <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""} onClick={() => setOpen(false)}>
            📊 Dashboard
          </Link>
          <button className="navbar-dd-btn" onClick={() => { toggleTheme(); setOpen(false); }}>
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  );
}

"use client";
import Link from "next/link";
import { menuData } from "./data/menu";
import { useCart } from "./context/CartContext";

export default function Home() {
  const totalItems = menuData.reduce((sum, cat) => sum + cat.items.length, 0);
  const { totalItems: cartCount, totalPrice } = useCart();

  return (
    <section className="hero" id="hero">
      <div className="hero-particles">
        {[8, 22, 35, 48, 61, 75, 88, 15, 42, 56, 70, 93].map((pos, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: `${pos}%`,
              top: `${(pos * 3 + 17) % 100}%`,
              animationDelay: `${(i * 0.5) % 4}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      </div>
      <div className="hero-content">
        <div className="hero-badge">🏪 POS Counter System</div>
        <h1>Roll Box</h1>
        <p>
          Take customer orders quickly. Select items from the menu, review the
          bill, and generate the order slip.
        </p>

        {/* Quick stats */}
        <div style={{
          display: "flex", gap: "1.5rem", justifyContent: "center",
          margin: "1.5rem 0 2rem", flexWrap: "wrap",
        }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "1rem 1.5rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-light)" }}>{totalItems}+</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Menu Items</div>
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "1rem 1.5rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--green)" }}>{cartCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>In Current Order</div>
          </div>
          {cartCount > 0 && (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", padding: "1rem 1.5rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold)" }}>₹{totalPrice}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Bill Amount</div>
            </div>
          )}
        </div>

        <div className="hero-actions">
          <Link href="/menu" className="btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 2.5rem" }}>
            🍽️ New Order
          </Link>
          {cartCount > 0 && (
            <Link href="/cart" className="btn-secondary" style={{ fontSize: "1.1rem", padding: "1rem 2.5rem" }}>
              🧾 View Bill ({cartCount} items)
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

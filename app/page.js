"use client";
import Link from "next/link";
import { menuData } from "./data/menu";
import { useCart } from "./context/CartContext";

const floatingEmojis = [
  { emoji: "🌯", left: "8%", top: "15%", delay: "0s", size: "2.8rem" },
  { emoji: "🍔", left: "85%", top: "20%", delay: "1s", size: "3rem" },
  { emoji: "🍕", left: "12%", top: "72%", delay: "2s", size: "2.5rem" },
  { emoji: "🍟", left: "78%", top: "65%", delay: "0.5s", size: "2.2rem" },
  { emoji: "🥤", left: "92%", top: "45%", delay: "1.5s", size: "2rem" },
  { emoji: "🍜", left: "5%", top: "45%", delay: "3s", size: "2.3rem" },
  { emoji: "🧀", left: "72%", top: "85%", delay: "2.5s", size: "2rem" },
  { emoji: "🥪", left: "28%", top: "88%", delay: "1.2s", size: "2.2rem" },
];

export default function Home() {
  const totalItems = menuData.reduce((sum, cat) => sum + cat.items.length, 0);
  const { totalItems: cartCount, totalPrice } = useCart();

  return (
    <section className="hero" id="hero">
      {/* Background particles */}
      <div className="hero-particles">
        {[8, 22, 35, 48, 61, 75, 88, 15, 42, 56, 70, 93].map((pos, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              left: `${pos}%`,
              top: `${(pos * 3 + 17) % 100}%`,
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              animationDelay: `${(i * 0.5) % 4}s`,
              animationDuration: `${5 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Floating food emojis */}
      <div className="hero-emojis">
        {floatingEmojis.map((item, i) => (
          <span
            key={i}
            className="hero-emoji"
            style={{
              left: item.left,
              top: item.top,
              fontSize: item.size,
              animationDelay: item.delay,
              animationDuration: `${5 + i * 0.7}s`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-badge">🔥 Freshly Made. Always Delicious.</div>
        <h1>Taste N' RoLLs</h1>
        <p>
          Serving the tastiest rolls, burgers, pizzas, and more —
          crafted with fresh ingredients and premium quality.
        </p>

        {/* Glassmorphic Stats */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ color: "var(--accent-light)" }}>
              {totalItems}+
            </div>
            <div className="hero-stat-label">Menu Items</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value" style={{ color: "var(--green)" }}>
              {cartCount}
            </div>
            <div className="hero-stat-label">In Cart</div>
          </div>
          {cartCount > 0 && (
            <div className="hero-stat">
              <div className="hero-stat-value" style={{ color: "var(--gold)" }}>
                ₹{totalPrice}
              </div>
              <div className="hero-stat-label">Bill Amount</div>
            </div>
          )}
        </div>

        <div className="hero-actions">
          <Link
            href="/menu"
            className="btn-primary"
            style={{ fontSize: "1.1rem", padding: "1.1rem 2.8rem" }}
          >
            🍽️ Explore Menu
          </Link>
          {cartCount > 0 && (
            <Link
              href="/cart"
              className="btn-secondary"
              style={{ fontSize: "1.1rem", padding: "1.1rem 2.8rem" }}
            >
              🧾 View Bill ({cartCount})
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

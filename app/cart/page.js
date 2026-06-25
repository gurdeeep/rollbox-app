"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, updateQty, removeItem, totalPrice, subtotal, discountPercent, discountAmount, setDiscount } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🧾</div>
          <h2>No items in the order</h2>
          <p>Select items from the menu to start a new order.</p>
          <Link href="/menu" className="btn-primary">📋 Open Menu</Link>
        </div>
      </div>
    );
  }

  const handleProceed = () => {
    router.push("/checkout");
  };

  return (
    <div className="cart-page">
      <div className="section-header" style={{ marginBottom: "1.5rem" }}>
        <h2>🧾 Current Order</h2>
        <p>{cart.length} item{cart.length > 1 ? "s" : ""} • ₹{totalPrice}</p>
      </div>

      <div className="cart-items">
        {cart.map((item) => (
          <div className="cart-item" key={item.key}>
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-variant">{item.variant}</div>
              <div className="cart-item-price">₹{item.price}</div>
            </div>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => updateQty(item.key, -1)}>−</button>
              <span className="qty-value">{item.qty}</span>
              <button className="qty-btn" onClick={() => updateQty(item.key, 1)}>+</button>
            </div>
            <div className="cart-item-total">₹{item.price * item.qty}</div>
            <button className="cart-item-remove" onClick={() => removeItem(item.key)}>✕</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Bill Summary</h3>
        <div className="summary-row">
          <span>Subtotal</span><span>₹{subtotal}</span>
        </div>

        {/* Custom Discount Input */}
        <div className="discount-input-row">
          <div className="discount-label">
            <span>🏷️ Discount</span>
            {discountAmount > 0 && <span className="discount-badge">−₹{discountAmount}</span>}
          </div>
          <div className="discount-input-group">
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent || ""}
              placeholder="0"
              onChange={(e) => setDiscount(e.target.value)}
              className="discount-input"
            />
            <span className="discount-input-suffix">%</span>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="summary-row discount-row">
            <span>Discount ({discountPercent}%)</span><span>−₹{discountAmount}</span>
          </div>
        )}

        <div className="summary-row total">
          <span>Total</span><span>₹{totalPrice}</span>
        </div>
        <button
          className="pay-btn"
          style={{ display: "block", textAlign: "center", marginTop: "1rem", width: "100%" }}
          onClick={handleProceed}
        >
          Place Order – ₹{totalPrice} →
        </button>
      </div>
    </div>
  );
}

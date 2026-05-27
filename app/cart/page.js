"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { generalAddOns } from "../data/menu";

export default function CartPage() {
  const { cart, updateQty, removeItem, totalPrice, addToCart } = useCart();
  const router = useRouter();
  const [showAddOns, setShowAddOns] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState({});

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
    setSelectedAddOns({});
    setShowAddOns(true);
  };

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current > 0 ? 0 : 1 };
    });
  };

  const changeAddOnQty = (id, delta) => {
    setSelectedAddOns((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const confirmAndCheckout = () => {
    generalAddOns.forEach((ao) => {
      const qty = selectedAddOns[ao.id] || 0;
      if (qty > 0) {
        for (let i = 0; i < qty; i++) {
          addToCart({ id: ao.id, name: ao.name, variant: "add-on", price: ao.price });
        }
      }
    });
    setShowAddOns(false);
    router.push("/checkout");
  };

  const skipAndCheckout = () => {
    setShowAddOns(false);
    router.push("/checkout");
  };

  const addOnTotal = generalAddOns.reduce((sum, ao) => {
    return sum + (selectedAddOns[ao.id] || 0) * ao.price;
  }, 0);

  return (
    <>
      {/* General Add-Ons Popup */}
      {showAddOns && (
        <div className="addon-overlay" onClick={skipAndCheckout}>
          <div className="addon-modal addon-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close" onClick={skipAndCheckout}>✕</button>
            <div className="addon-modal-icon">➕</div>
            <h3>Any add-ons?</h3>
            <p className="addon-modal-hint">Ask the customer if they want extras</p>

            <div className="addon-options">
              {generalAddOns.map((ao) => {
                const qty = selectedAddOns[ao.id] || 0;
                return (
                  <div key={ao.id} className={`addon-option-row ${qty > 0 ? "selected" : ""}`}>
                    <div className="addon-row-left">
                      <span className={ao.veg ? "veg-badge" : "nonveg-badge"} style={{ width: 14, height: 14, borderWidth: 1.5 }}></span>
                      <span className="addon-option-name">{ao.name}</span>
                    </div>
                    <span className="addon-option-price">₹{ao.price}</span>
                    {qty === 0 ? (
                      <button className="addon-add-btn" onClick={() => toggleAddOn(ao.id)}>
                        ADD
                      </button>
                    ) : (
                      <div className="addon-qty-controls">
                        <button onClick={() => changeAddOnQty(ao.id, -1)}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => changeAddOnQty(ao.id, 1)}>+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {addOnTotal > 0 && (
              <div className="addon-total">
                Add-ons total: <strong>₹{addOnTotal}</strong>
              </div>
            )}

            <div className="addon-modal-actions">
              <button className="btn-secondary" onClick={skipAndCheckout} style={{ flex: 1 }}>
                No Thanks
              </button>
              <button className="btn-primary" onClick={confirmAndCheckout} style={{ flex: 1 }}>
                {addOnTotal > 0 ? `Add ₹${addOnTotal} & Continue` : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cart-page">
        <div className="section-header">
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
          <div className="summary-row total">
            <span>Total</span><span>₹{totalPrice}</span>
          </div>
          <button
            className="pay-btn"
            style={{ display: "block", textAlign: "center", marginTop: "1rem", width: "100%" }}
            onClick={handleProceed}
          >
            Generate Bill →
          </button>
        </div>
      </div>
    </>
  );
}

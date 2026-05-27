"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("Please enter customer name and phone number");
    if (cart.length === 0) return alert("No items in the order");

    if (paymentMethod === "upi") {
      setShowQR(true);
      return;
    }

    placeOrder("Cash");
  };

  const placeOrder = async (method) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart,
          total: totalPrice,
          paymentMethod: method,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Store order details for the receipt page
        const orderData = {
          orderId: data.orderId,
          method,
          customer: form,
          items: [...cart],
          total: totalPrice,
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        };
        sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
        clearCart();
        router.push(`/order-success?id=${data.orderId}&method=${encodeURIComponent(method)}`);
      } else {
        alert("Failed to place order. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleUPIDone = () => {
    setShowQR(false);
    placeOrder("UPI");
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page" style={{ textAlign: "center", paddingTop: "10rem" }}>
        <h2>No items to bill</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Add items from the menu first.</p>
        <Link href="/menu" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
          📋 Open Menu
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* UPI QR Modal */}
      {showQR && (
        <div className="qr-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)}>✕</button>
            <h3 style={{ marginBottom: "0.25rem", fontSize: "1.3rem" }}>Scan & Pay</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Customer pays <span style={{ color: "var(--accent-light)", fontWeight: 700 }}>₹{totalPrice}</span>
            </p>
            <div className="qr-image-wrapper">
              <Image src="/upi-qr.png" alt="UPI QR Code" width={280} height={280} style={{ borderRadius: "12px" }} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0.75rem 0 1.25rem" }}>
              After payment is confirmed, tap below
            </p>
            <button className="pay-btn" onClick={handleUPIDone} disabled={loading}>
              {loading ? "Placing Order..." : "✅ Payment Received – Place Order"}
            </button>
          </div>
        </div>
      )}

      <div className="checkout-page">
        <div className="section-header">
          <h2>🧾 Finalize Order</h2>
          <p>Enter customer details and payment method</p>
        </div>

        {/* Order items recap */}
        <div className="cart-summary" style={{ marginBottom: "1.5rem" }}>
          <h3>Order Items</h3>
          {cart.map((item) => (
            <div className="summary-row" key={item.key}>
              <span>{item.name} ({item.variant}) × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span><span>₹{totalPrice}</span>
          </div>
        </div>

        {/* Customer form — simplified for counter use */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h3 style={{ marginBottom: "1.25rem" }}>Customer Details</h3>
          <div className="form-group">
            <label htmlFor="name">Customer Name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Customer name" autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" type="tel" />
          </div>

          {/* Payment Method Selection */}
          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === "cash" ? "selected" : ""}`}>
                <input
                  type="radio" name="payment" value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                <span className="payment-icon">💵</span>
                <div>
                  <strong>Cash</strong>
                  <small>Customer pays in cash</small>
                </div>
              </label>
              <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
                <input
                  type="radio" name="payment" value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <span className="payment-icon">📱</span>
                <div>
                  <strong>UPI</strong>
                  <small>Customer scans QR to pay</small>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="pay-btn" disabled={loading}>
            {loading
              ? "Placing Order..."
              : paymentMethod === "upi"
                ? `Show QR – ₹${totalPrice}`
                : `Place Order – ₹${totalPrice} (Cash)`
            }
          </button>
        </form>
      </div>
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart, totalPrice, subtotal, discountPercent, discountAmount, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [splitCash, setSplitCash] = useState("");
  const [splitUpi, setSplitUpi] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Auto-fill the other split field
  const handleSplitCash = (val) => {
    setSplitCash(val);
    const num = parseFloat(val) || 0;
    if (num >= 0 && num <= totalPrice) {
      setSplitUpi(String(totalPrice - num));
    }
  };
  const handleSplitUpi = (val) => {
    setSplitUpi(val);
    const num = parseFloat(val) || 0;
    if (num >= 0 && num <= totalPrice) {
      setSplitCash(String(totalPrice - num));
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!form.name) return alert("Please enter customer name");
    if (cart.length === 0) return alert("No items in the order");

    if (paymentMethod === "split") {
      const cash = parseFloat(splitCash) || 0;
      const upi = parseFloat(splitUpi) || 0;
      if (Math.round(cash + upi) !== totalPrice) {
        return alert(`Cash (₹${cash}) + UPI (₹${upi}) must equal ₹${totalPrice}`);
      }
      placeOrder("Split", cash, upi);
    } else {
      const methodMap = { upi: "UPI", unpaid: "Unpaid", cash: "Cash" };
      placeOrder(methodMap[paymentMethod] || "Cash");
    }
  };

  const placeOrder = async (method, cashAmount = 0, upiAmount = 0) => {
    setLoading(true);
    try {
      const editingOrderId = sessionStorage.getItem("editingOrderId");

      let res;
      let finalOrderId;

      if (editingOrderId) {
        res = await fetch("/api/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: editingOrderId,
            items: cart,
            total: totalPrice,
            subtotal,
            discountPercent,
            discountAmount,
          }),
        });
        finalOrderId = editingOrderId;
        sessionStorage.removeItem("editingOrderId");
      } else {
        res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: form,
            items: cart,
            total: totalPrice,
            paymentMethod: method,
            subtotal,
            discountPercent,
            discountAmount,
            cashAmount: method === "Split" ? cashAmount : (method === "Cash" ? totalPrice : 0),
            upiAmount: method === "Split" ? upiAmount : (method === "UPI" ? totalPrice : 0),
          }),
        });
      }

      const data = await res.json();

      if (data.success) {
        const usedOrderId = finalOrderId || data.orderId;
        const orderData = {
          orderId: usedOrderId,
          dailyOrderNumber: data.dailyOrderNumber || null,
          method,
          cashAmount: method === "Split" ? cashAmount : 0,
          upiAmount: method === "Split" ? upiAmount : 0,
          customer: form,
          items: [...cart],
          subtotal,
          discountPercent,
          discountAmount,
          total: totalPrice,
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        };
        sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
        clearCart();
        router.push(`/order-success?id=${usedOrderId}&method=${encodeURIComponent(method)}`);
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

  const btnLabel = () => {
    if (loading) return "Placing Order...";
    if (paymentMethod === "split") return `Place Order – ₹${totalPrice} (Split)`;
    if (paymentMethod === "unpaid") return `Place Order – ₹${totalPrice} (Unpaid)`;
    return `Place Order – ₹${totalPrice} (${paymentMethod === "upi" ? "UPI" : "Cash"})`;
  };

  return (
    <div className="checkout-page">
      <div className="section-header">
        <h2>🧾 Finalize Order</h2>
        <p>Enter customer details and payment method</p>
      </div>

      <div className="checkout-grid">
        {/* Left: Order items recap */}
        <div className="cart-summary">
          <h3>Order Items</h3>
          {cart.map((item) => (
            <div className="summary-row" key={item.key}>
              <span>{item.name} ({item.variant}) × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span><span>₹{subtotal}</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row discount-row">
              <span>Discount ({discountPercent}%)</span><span>−₹{discountAmount}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span><span>₹{totalPrice}</span>
          </div>
        </div>

        {/* Right: Customer form */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h3 style={{ marginBottom: "1.25rem" }}>Customer Details</h3>
          <div className="form-group">
            <label htmlFor="name">Customer Name *</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Customer name" autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX (optional)" type="tel" />
          </div>

          {/* Payment Method Selection */}
          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === "cash" ? "selected" : ""}`}>
                <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                <span className="payment-icon">💵</span>
                <div><strong>Cash</strong><small>Customer pays in cash</small></div>
              </label>
              <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
                <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
                <span className="payment-icon">📱</span>
                <div><strong>UPI</strong><small>Customer pays via UPI</small></div>
              </label>
              <label className={`payment-option ${paymentMethod === "unpaid" ? "selected" : ""}`}>
                <input type="radio" name="payment" value="unpaid" checked={paymentMethod === "unpaid"} onChange={() => setPaymentMethod("unpaid")} />
                <span className="payment-icon">⏳</span>
                <div><strong>Unpaid</strong><small>Customer pays later</small></div>
              </label>
              <label className={`payment-option ${paymentMethod === "split" ? "selected" : ""}`}>
                <input type="radio" name="payment" value="split" checked={paymentMethod === "split"} onChange={() => { setPaymentMethod("split"); setSplitCash(String(totalPrice)); setSplitUpi("0"); }} />
                <span className="payment-icon">💳</span>
                <div><strong>Split</strong><small>Part cash, part UPI</small></div>
              </label>
            </div>
          </div>

          {/* Split payment inputs */}
          {paymentMethod === "split" && (
            <div className="split-inputs">
              <div className="split-field">
                <label>💵 Cash Amount</label>
                <input type="number" min="0" max={totalPrice} value={splitCash} onChange={(e) => handleSplitCash(e.target.value)} placeholder="0" />
              </div>
              <div className="split-field">
                <label>📱 UPI Amount</label>
                <input type="number" min="0" max={totalPrice} value={splitUpi} onChange={(e) => handleSplitUpi(e.target.value)} placeholder="0" />
              </div>
              <div className="split-total">
                Total: ₹{(parseFloat(splitCash) || 0) + (parseFloat(splitUpi) || 0)} / ₹{totalPrice}
              </div>
            </div>
          )}

          <button type="submit" className="pay-btn" disabled={loading}>
            {btnLabel()}
          </button>
        </form>
      </div>
    </div>
  );
}

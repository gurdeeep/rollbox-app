"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ReceiptContent() {
  const params = useSearchParams();
  const orderId = params.get("id") || "N/A";
  const method = params.get("method") || "Cash";
  const [order, setOrder] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("lastOrder");
      if (stored) setOrder(JSON.parse(stored));
    } catch {}
  }, []);

  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE || "";

  // Build WhatsApp message text
  const buildSlipText = () => {
    if (!order) return "";
    let text = `🥡 *ROLL BOX*\n`;
    text += `━━━━━━━━━━━━━━━\n`;
    text += `📋 *Order Slip*\n`;
    text += `🆔 ${orderId}\n`;
    text += `📅 ${order.time}\n`;
    text += `👤 ${order.customer.name}\n`;
    text += `📞 ${order.customer.phone}\n`;
    text += `━━━━━━━━━━━━━━━\n`;
    order.items.forEach((item) => {
      text += `▸ ${item.name} (${item.variant}) ×${item.qty} — ₹${item.price * item.qty}\n`;
    });
    text += `━━━━━━━━━━━━━━━\n`;
    text += `💰 *Total: ₹${order.total}*\n`;
    text += `💳 Payment: ${method}\n`;
    text += `━━━━━━━━━━━━━━━\n`;
    text += `Thank you! Visit again 🙏`;
    return text;
  };

  const sendWhatsApp = (phone) => {
    const text = encodeURIComponent(buildSlipText());
    // Clean phone number
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "91" + cleanPhone.slice(1);
    if (!cleanPhone.startsWith("91") && cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h1>Order Placed!</h1>

      {/* Printable Receipt */}
      <div className="receipt" ref={receiptRef} id="receipt">
        <div className="receipt-header">
          <h2>🥡 ROLL BOX</h2>
          <p>Eat Healthy. Be Healthy.</p>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-info">
          <div className="receipt-row">
            <span>Order ID</span>
            <span className="order-id">{orderId}</span>
          </div>
          <div className="receipt-row">
            <span>Date & Time</span>
            <span>{order?.time || new Date().toLocaleString("en-IN")}</span>
          </div>
          <div className="receipt-row">
            <span>Customer</span>
            <span>{order?.customer?.name || "—"}</span>
          </div>
          <div className="receipt-row">
            <span>Phone</span>
            <span>{order?.customer?.phone || "—"}</span>
          </div>
          <div className="receipt-row">
            <span>Payment</span>
            <span style={{ color: method === "UPI" ? "var(--green)" : "var(--gold)", fontWeight: 600 }}>
              {method === "UPI" ? "📱 UPI" : "💵 Cash"}
            </span>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-items">
          <div className="receipt-items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {order?.items?.map((item, i) => (
            <div className="receipt-item-row" key={i}>
              <span className="receipt-item-name">
                {item.name}
                <small> ({item.variant})</small>
              </span>
              <span>×{item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="receipt-divider" />

        <div className="receipt-total">
          <span>TOTAL</span>
          <span>₹{order?.total || "—"}</span>
        </div>

        <div className="receipt-footer">
          <p>Thank you! Visit again 🙏</p>
        </div>
      </div>

      {/* Action Buttons — hidden in print */}
      <div className="receipt-actions no-print">
        <button className="btn-primary" onClick={handlePrint} style={{ flex: 1 }}>
          🖨️ Print Bill
        </button>

        {order?.customer?.phone && (
          <button
            className="btn-whatsapp"
            onClick={() => sendWhatsApp(order.customer.phone)}
            style={{ flex: 1 }}
          >
            📲 Send to Customer
          </button>
        )}

        {ownerPhone && (
          <button
            className="btn-whatsapp owner"
            onClick={() => sendWhatsApp(ownerPhone)}
            style={{ flex: 1 }}
          >
            📲 Send to Owner
          </button>
        )}
      </div>

      <div className="receipt-actions no-print" style={{ marginTop: "0.5rem" }}>
        <Link href="/menu" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
          🍽️ New Order
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="success-page"><p>Loading...</p></div>}>
      <ReceiptContent />
    </Suspense>
  );
}

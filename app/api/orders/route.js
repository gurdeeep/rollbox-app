import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase";

export async function POST(req) {
  try {
    const { customer, items, total, paymentMethod } = await req.json();

    // Validate required fields
    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ error: "Missing customer name or phone" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const supabase = createServerClient();
    const orderId = `RB-${Date.now().toString(36).toUpperCase()}`;

    // Insert order into Supabase
    const { data, error } = await supabase.from("orders").insert({
      order_id: orderId,
      customer_name: customer.name,
      customer_phone: customer.phone,
      items: items,
      total_amount: total,
      payment_method: paymentMethod,
      status: "completed",
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId, order: data });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

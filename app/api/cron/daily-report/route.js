import { NextResponse } from "next/server";
import { createServerClient } from "../../../lib/supabase";
import { menuData } from "../../../data/menu";

// Build a lookup: item ID → category name & icon
function buildItemCategoryMap() {
  const map = {};
  menuData.forEach((cat) => {
    cat.items.forEach((item) => {
      map[item.id] = { category: cat.name, icon: cat.icon };
    });
  });
  return map;
}

// Generate daily report (same logic as /api/report)
function generateReport(orders, dateLabel) {
  const cashOrders = orders.filter((o) => o.payment_method === "Cash");
  const upiOrders = orders.filter((o) => o.payment_method === "UPI");
  const splitOrders = orders.filter((o) => o.payment_method === "Split");

  const totalCash = cashOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
    + splitOrders.reduce((s, o) => s + (o.cash_amount || 0), 0);
  const totalUpi = upiOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
    + splitOrders.reduce((s, o) => s + (o.upi_amount || 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalDiscount = orders.reduce((s, o) => s + (o.discount_amount || 0), 0);
  const discountedOrders = orders.filter((o) => o.discount_applied).length;

  const catMap = buildItemCategoryMap();
  const sectionMap = {};

  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const lookup = catMap[item.id];
      const sectionKey = lookup ? `${lookup.icon} ${lookup.category}` : "🍽️ Other";
      const itemLabel = item.variant ? `${item.name} (${item.variant})` : item.name;

      if (!sectionMap[sectionKey]) {
        sectionMap[sectionKey] = { totalQty: 0, totalRev: 0, items: {} };
      }
      sectionMap[sectionKey].totalQty += item.qty || 1;
      sectionMap[sectionKey].totalRev += (item.price || 0) * (item.qty || 1);

      if (!sectionMap[sectionKey].items[itemLabel]) {
        sectionMap[sectionKey].items[itemLabel] = { qty: 0, rev: 0 };
      }
      sectionMap[sectionKey].items[itemLabel].qty += item.qty || 1;
      sectionMap[sectionKey].items[itemLabel].rev += (item.price || 0) * (item.qty || 1);
    });
  });

  const sortedSections = Object.entries(sectionMap)
    .sort((a, b) => b[1].totalQty - a[1].totalQty);
  const totalItemsSold = sortedSections.reduce((s, [, sec]) => s + sec.totalQty, 0);

  let text = `📊 *TASTE N' ROLLS — Daily Report*\n`;
  text += `📅 ${dateLabel}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🧾 *Total Orders:* ${orders.length}\n`;
  text += `🍽️ *Total Items Sold:* ${totalItemsSold}\n`;
  text += `💰 *Total Revenue:* ₹${totalRevenue.toLocaleString("en-IN")}\n`;
  if (totalDiscount > 0) {
    text += `🏷️ *Total Discount Given:* ₹${totalDiscount.toLocaleString("en-IN")} (${discountedOrders} orders)\n`;
  }
  text += `\n`;
  text += `💵 *Cash:* ₹${totalCash.toLocaleString("en-IN")} (${cashOrders.length} orders)\n`;
  text += `📱 *UPI:* ₹${totalUpi.toLocaleString("en-IN")} (${upiOrders.length} orders)\n`;
  if (splitOrders.length > 0) {
    text += `💳 *Split:* ${splitOrders.length} orders\n`;
  }

  if (sortedSections.length === 0) {
    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `No items sold today.\n`;
  } else {
    sortedSections.forEach(([sectionName, section]) => {
      text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*${sectionName}* — ${section.totalQty} sold (₹${section.totalRev.toLocaleString("en-IN")})\n\n`;
      const sortedItems = Object.entries(section.items)
        .sort((a, b) => b[1].qty - a[1].qty);
      sortedItems.forEach(([name, data]) => {
        text += `  ▸ ${name} × ${data.qty} = ₹${data.rev}\n`;
      });
    });
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🏪 Taste N' RoLLs, Sampla`;

  return text;
}

// Cron endpoint — called by Vercel Cron at 11 PM IST daily
export async function GET(req) {
  try {
    // Verify cron secret — Vercel sends via header, browser can use ?secret=
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch today's orders directly from Supabase
    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const supabase = createServerClient();

    const { data: allOrders, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "completed")
      .order("created_at", { ascending: true });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Failed to fetch orders", details: dbError.message }, { status: 500 });
    }

    const dayOrders = (allOrders || []).filter((o) => {
      const orderDate = new Date(o.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      return orderDate === todayIST;
    });

    const dateLabel = new Date(todayIST).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const reportText = generateReport(dayOrders, dateLabel);

    const results = { email: null, whatsapp: null };

    // ===== 1. EMAIL via Resend =====
    const resendApiKey = process.env.RESEND_API_KEY;
    const reportEmail = process.env.REPORT_EMAIL;

    if (resendApiKey && reportEmail) {
      try {
        const htmlReport = reportText
          .replace(/\n/g, "<br>")
          .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
          .replace(/━+/g, "<hr style='border:1px solid #333'>")
          .replace(/▸/g, "•");

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Taste N Rolls <onboarding@resend.dev>",
            to: [reportEmail],
            subject: `📊 Daily Report — ${todayIST} | Taste N' RoLLs`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#1a1a2e;color:#e0e0e0;border-radius:12px;">
                <div style="text-align:center;margin-bottom:16px;">
                  <span style="font-size:2rem;">🥡</span>
                  <h2 style="margin:4px 0;color:#f97316;">Taste N' RoLLs</h2>
                </div>
                <div style="background:#16162a;padding:16px;border-radius:8px;line-height:1.8;font-size:14px;">
                  ${htmlReport}
                </div>
                <p style="text-align:center;color:#888;font-size:12px;margin-top:16px;">
                  Auto-generated at 11:00 PM IST
                </p>
              </div>
            `,
          }),
        });

        const emailResult = await emailRes.json();
        if (emailRes.ok) {
          results.email = { success: true, emailId: emailResult.id };
        } else {
          results.email = { success: false, error: emailResult };
          console.error("Resend error:", JSON.stringify(emailResult));
        }
      } catch (emailErr) {
        results.email = { success: false, error: emailErr.message };
      }
    } else {
      results.email = { success: false, error: "RESEND_API_KEY or REPORT_EMAIL not set" };
    }

    // ===== 2. WHATSAPP via CallMeBot (if configured) =====
    const callmebotPhone = process.env.CALLMEBOT_PHONE;
    const callmebotKey = process.env.CALLMEBOT_APIKEY;

    if (callmebotPhone && callmebotKey) {
      try {
        const waText = encodeURIComponent(reportText);
        const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${callmebotPhone}&text=${waText}&apikey=${callmebotKey}`;
        const waRes = await fetch(waUrl);
        if (waRes.ok) {
          results.whatsapp = { success: true };
        } else {
          results.whatsapp = { success: false, status: waRes.status, error: await waRes.text() };
        }
      } catch (waErr) {
        results.whatsapp = { success: false, error: waErr.message };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Daily report processed",
      date: todayIST,
      ordersFound: dayOrders.length,
      results,
    });
  } catch (err) {
    console.error("Cron report error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}

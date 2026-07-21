import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const invoiceId = String(formData.get("invoice_id") ?? "");

  if (!invoiceId) {
    return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: invoices, error } = await supabase.rpc("get_invoice_public", {
    p_invoice_id: invoiceId,
  });
  const invoice = invoices?.[0];

  if (error || !invoice) {
    return NextResponse.json({ error: "請求書が見つかりません" }, { status: 404 });
  }

  if (invoice.status === "paid") {
    return NextResponse.json({ error: "この請求書はすでに支払い済みです" }, { status: 400 });
  }
  if (invoice.status === "void") {
    return NextResponse.json({ error: "この請求書は無効化されています" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            // JPY is a zero-decimal currency for Stripe — the amount is
            // the yen value itself, not multiplied by 100.
            unit_amount: Math.round(invoice.total),
            product_data: {
              name: `請求書 ${invoice.invoice_no}`,
              description: invoice.company_name,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { invoice_id: invoice.id },
      success_url: `${origin}/pay/${invoice.id}?status=success`,
      cancel_url: `${origin}/pay/${invoice.id}?status=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "決済セッションの作成に失敗しました" }, { status: 500 });
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err) {
    // Logged so it shows up in Vercel's function logs (Deployments → function → Logs).
    console.error("[api/checkout] Stripe session creation failed:", err);
    const message = err instanceof Error ? err.message : "決済セッションの作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

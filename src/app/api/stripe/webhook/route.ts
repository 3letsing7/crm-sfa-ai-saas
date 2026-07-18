import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;

    if (invoiceId) {
      const supabase = createAdminClient();

      const { data: invoice } = await supabase
        .from("invoices")
        .select("id, customer_id, total, organization_id, status")
        .eq("id", invoiceId)
        .single();

      // Idempotency: Stripe may redeliver the same event more than once.
      if (invoice && invoice.status !== "paid") {
        const paidAmount = (session.amount_total ?? invoice.total) as number;

        await supabase.from("payments").insert({
          invoice_id: invoice.id,
          customer_id: invoice.customer_id,
          organization_id: invoice.organization_id,
          paid_amount: paidAmount,
          paid_at: new Date().toISOString().slice(0, 10),
          method: "credit_card",
          match_status: paidAmount >= invoice.total ? "matched" : "partial",
        });

        if (paidAmount >= invoice.total) {
          await supabase.from("invoices").update({ status: "paid" }).eq("id", invoice.id);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

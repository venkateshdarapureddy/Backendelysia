import Elysia, { error } from "elysia";
import Stripe from "stripe";
export const webhook = new Elysia({}).post("/webhook", async ({ body, headers }) => {
    const stripeClient = new Stripe(Bun.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-12-18.acacia",
    });
    const sig = headers["stripe-signature"];
    let event;
    try {
        event = stripeClient.webhooks.constructEvent(
        //@ts-ignore
        body, sig, "whsec_0a46bf3ebcc6181a2e3106f34ec31e44fa40b3808bbc0147b6b6cf43357d1a96");
    }
    catch (err) {
        // Type guard to check if `err` has a `message` property
        if (err instanceof Error) {
            console.error("Webhook signature verification failed:", err.message);
        }
        else {
            console.error("Webhook signature verification failed:", err);
        }
        return error(400, "Webhook signature verification failed");
    }
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            console.log("Payment Intent Succeeded:", paymentIntent);
            // Handle successful payment intent
            break;
        case "payment_intent.created":
            console.log("Payment Intent Created:", event.data.object);
            break;
        case "charge.succeeded":
            console.log("Charge Succeeded:", event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    return { received: true };
});

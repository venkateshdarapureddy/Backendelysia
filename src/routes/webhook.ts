import Elysia, { error } from "elysia";
import Stripe from "stripe";

export const webhook = new Elysia()
    .post("/webhook", async ({ request, headers }) => {
        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2024-12-18.acacia",
        });

        const sig = headers["stripe-signature"];
        let event;

        let rawBody;
        try {
            // Read raw request body
            rawBody = await request.text();
        } catch (err) {
            console.error("Failed to read request body:", err);
            return error(400, "Failed to read request body");
        }

        try {
            // Use constructEventAsync instead of constructEvent
            event = await stripeClient.webhooks.constructEventAsync(
                rawBody, // Use raw body
                //@ts-ignore
                sig,
                "whsec_0a46bf3ebcc6181a2e3106f34ec31e44fa40b3808bbc0147b6b6cf43357d1a96"
            );
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return error(400, "Webhook signature verification failed");
        }

        // Handle different event types
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntentSucceeded = event.data.object;
                console.log("Payment succeeded:", paymentIntentSucceeded);
                break;
            case "charge.succeeded":
                const chargeSucceeded = event.data.object;
                console.log("Charge succeeded:", chargeSucceeded);
                break;
            case "payment_intent.payment_failed":
                const paymentFailed = event.data.object;
                console.error("Payment failed:", paymentFailed);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    });

export default webhook;

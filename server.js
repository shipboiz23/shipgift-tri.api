const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());

app.use(
    cors( )
);

// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use("/test", (req, res) => {
    res.send("Hello world!");
});

app.get("/config", (req, res) => {
    res.send({
        stripeKey: process.env.STRIPE_PUBLISHABLE_KEY,
        paystackKey: process.env.PAYSTACK_PUBLIC_KEY,
        paypalKey: process.env.PAYPAL_PUBLIC_KEY,
    });
});

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map((item) => {
                return {
                    price_data: {
                        currency: "kes",
                        product_data: {
                            name: item.name
                        },
                        unit_amount: (item.price) * 100,
                    },
                    quantity: item.quantity
                }
            }),
            success_url: 'https://shipgift-tri.onrender.com/success',
            cancel_url: 'https://shipgift-tri.onrender.com/cancel'
        })

        res.json({url: session.url})

    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

const server = app.listen(4000, () =>
    console.log(`Server is running on http://localhost:4000`)
);

process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`Shutting down the server for an unhandled promise rejection`);

    server.close(() => {
        process.exit(1);
    });
});

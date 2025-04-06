import dotenv from "dotenv";
import paypal from "@paypal/paypal-server-sdk";

dotenv.config();

// paypal.configure({
//     mode: "sandbox",
//     clientId: process.env.PAYPAL_CLIENT_ID,
//     clientSecret: process.env.PAYPAL_CLIENT_SECRET,
// });

export default paypal;


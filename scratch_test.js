const crypto = require("crypto");

const ABA_PAYWAY_API_URL = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
const ABA_PAYWAY_MERCHANT_ID = "ec474354";
const ABA_PAYWAY_API_KEY = "ca45eaca7d55f0eb4bd1ed25049cf1c63db371a3"; // Dummy key, we should rely on their env if we don't have it

// Since we don't have their API key locally, let me just look at what the API says about the difference between abapay_deeplink and abapay_khqr_deeplink.

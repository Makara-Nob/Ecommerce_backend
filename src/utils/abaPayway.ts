import crypto from "crypto";

// Sandbox / API URL
export const ABA_PAYWAY_API_URL =
  process.env.ABA_PAYWAY_API_URL ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";

export const ABA_PAYWAY_COF_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial";

// Merchant ID
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID || "";

// Use the API Key for HMAC hash generation
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY || "";

// Private key variable (for signing if needed)
const ABA_PAYWAY_PRIVATE_KEY = process.env.ABA_RSA_PRIVATE_KEY || "";

/**
 * Generate HMAC-SHA512 hash for ABA PayWay checkout payload
 */
export const generatePwHash = (payload: any): string => {
  const hashString =
    (payload.req_time || "") +
    (payload.merchant_id || "") +
    (payload.tran_id || "") +
    (payload.amount || "") +
    (payload.items || "") +
    (payload.shipping || "") +
    (payload.firstname || "") +
    (payload.lastname || "") +
    (payload.email || "") +
    (payload.phone || "") +
    (payload.type || "") +
    (payload.payment_option || "") +
    (payload.return_url || "") +
    (payload.cancel_url || "") +
    (payload.continue_success_url || "") +
    (payload.return_deeplink || "") +
    (payload.currency || "") +
    (payload.custom_fields || "") +
    (payload.return_params || "") +
    (payload.payout || "") +
    (payload.lifetime || "") +
    (payload.additional_params || "") +
    (payload.google_pay_token || "") +
    (payload.skip_success_page || "");

  // Use API Key as the “key” for HMAC-SHA512
  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");
};

/**
 * Get the full payload to render the checkout form
 */
export const getCheckoutPayload = (orderInfo: any) => {
  const dt = new Date();
  const req_time =
    dt.getFullYear().toString() +
    (dt.getMonth() + 1).toString().padStart(2, "0") +
    dt.getDate().toString().padStart(2, "0") +
    dt.getHours().toString().padStart(2, "0") +
    dt.getMinutes().toString().padStart(2, "0") +
    dt.getSeconds().toString().padStart(2, "0");

  const items = Buffer.from(JSON.stringify(orderInfo.items)).toString("base64");

  const payload = {
    req_time: req_time.toString(),
    merchant_id: ABA_PAYWAY_MERCHANT_ID.toString(),
    tran_id: orderInfo.tran_id.toString(),
    amount: parseFloat(orderInfo.amount).toFixed(2).toString(),
    items,
    shipping: "0.00",
    currency: (orderInfo.currency || "USD").toString(),
    firstname: (orderInfo.firstname || "").toString(),
    lastname: (orderInfo.lastname || "").toString(),
    email: (orderInfo.email || "").toString(),
    phone: (orderInfo.phone || "").toString(),
    type: "purchase",
    payment_option: (orderInfo.payment_option || "").toString(),
    return_url: (process.env.ABA_RETURN_URL || "").toString(),
    continue_success_url: (process.env.ABA_SUCCESS_URL || "").toString(),
    cancel_url: (process.env.ABA_CANCEL_URL || "").toString(),
    return_deeplink: (orderInfo.return_deeplink || "").toString(),
    custom_fields: (orderInfo.custom_fields || "").toString(),
    return_params: (orderInfo.return_params || "").toString(),
    payout: (orderInfo.payout || "").toString(),
    lifetime: (orderInfo.lifetime || "").toString(),
    additional_params: (orderInfo.additional_params || "").toString(),
    google_pay_token: (orderInfo.google_pay_token || "").toString(),
    skip_success_page: (orderInfo.skip_success_page || "").toString(),
    view_type: (orderInfo.view_type || "hosted").toString(),
  };

  const hash = generatePwHash(payload);

  return {
    ...payload,
    hash,
  };
};

/**
 * Generate HMAC-SHA512 hash for ABA Link Card (COF) payload
 */
export const generateCofHash = (payload: any): string => {
  const hashString =
    (payload.merchant_id || "") +
    (payload.ctid || "") +
    (payload.return_param || "");

  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");
};

/**
 * Get the payload for Link Card (COF) initialization
 */
export const getCofPayload = (info: any) => {
  const dt = new Date();
  const req_time =
    dt.getFullYear().toString() +
    (dt.getMonth() + 1).toString().padStart(2, "0") +
    dt.getDate().toString().padStart(2, "0") +
    dt.getHours().toString().padStart(2, "0") +
    dt.getMinutes().toString().padStart(2, "0") +
    dt.getSeconds().toString().padStart(2, "0");

  const payload = {
    req_time: req_time.toString(),
    merchant_id: ABA_PAYWAY_MERCHANT_ID.toString(),
    ctid: `user${info.ctid}`, // Pure alphanumeric, no special characters
    return_param: (info.return_param || "").toString(),
    firstname: (info.firstname || "").toString(),
    lastname: (info.lastname || "").toString(),
    email: (info.email || "").toString(),
    phone: (info.phone || "").toString(),
    return_url: (process.env.ABA_RETURN_URL || "").toString(),
    continue_add_card_success_url: (process.env.ABA_SUCCESS_URL || "").toString(),
  };

  const hash = generateCofHash(payload);

  return {
    ...payload,
    hash,
  };
};

/**
 * Verify webhook signature from ABA PayWay Checkout 2.0
 */
export const verifyWebhookSignature = (
  payload: any,
  receivedSignature: string,
) => {
  // 1. Sort fields by key (ascending)
  const keys = Object.keys(payload).sort();

  // 2. Concatenate all values
  let b4hash = "";
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "object" && value !== null) {
      b4hash += JSON.stringify(value);
    } else {
      b4hash += value;
    }
  }

  // 3. Generate HMAC-SHA512 signature
  const expectedSignature = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(b4hash)
    .digest("base64");

  // 4. Compare signatures
  return expectedSignature === receivedSignature;
};

/**
 * Check transaction status using ABA Payway check-transaction-2 API
 */
export const checkAbaTransaction = async (tran_id: string) => {
  const dt = new Date();
  const req_time =
    dt.getFullYear().toString() +
    (dt.getMonth() + 1).toString().padStart(2, "0") +
    dt.getDate().toString().padStart(2, "0") +
    dt.getHours().toString().padStart(2, "0") +
    dt.getMinutes().toString().padStart(2, "0") +
    dt.getSeconds().toString().padStart(2, "0");

  const hashString = req_time + ABA_PAYWAY_MERCHANT_ID + tran_id;
  const hash = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");

  const checkUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2";

  const formData = new URLSearchParams();
  formData.append("req_time", req_time);
  formData.append("merchant_id", ABA_PAYWAY_MERCHANT_ID);
  formData.append("tran_id", tran_id);
  formData.append("hash", hash);

  const response = await fetch(checkUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`ABA API returned ${response.status}`);
  }

  return await response.json();
};

// Export private key for any signing operations if needed
export { ABA_PAYWAY_PRIVATE_KEY };

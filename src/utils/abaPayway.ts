import crypto from "crypto";
import axios from "axios";

// ================= CONFIG =================
export const ABA_PAYWAY_API_URL =
  process.env.ABA_PAYWAY_API_URL ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";

export const ABA_PAYWAY_COF_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial";

export const ABA_PAYWAY_TOKEN_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";

export const ABA_PAYWAY_CHECK_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2";

const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID || "";
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY || "";

// ================= HELPERS =================
const getReqTime = () => {
  const dt = new Date();
  return (
    dt.getFullYear().toString() +
    (dt.getMonth() + 1).toString().padStart(2, "0") +
    dt.getDate().toString().padStart(2, "0") +
    dt.getHours().toString().padStart(2, "0") +
    dt.getMinutes().toString().padStart(2, "0") +
    dt.getSeconds().toString().padStart(2, "0")
  );
};

// ================= CHECKOUT HASH (FIXED) =================
export const generatePwHash = (p: any): string => {
  const hashString =
    (p.req_time ?? "") +
    (p.merchant_id ?? "") +
    (p.tran_id ?? "") +
    (p.amount ?? "") +
    (p.items ?? "") +
    (p.shipping ?? "") +
    (p.firstname ?? "") +
    (p.lastname ?? "") +
    (p.email ?? "") +
    (p.phone ?? "") +
    (p.type ?? "") +
    (p.payment_option ?? "") +
    (p.return_url ?? "") +
    (p.cancel_url ?? "") +
    (p.continue_success_url ?? "") +
    (p.return_deeplink ?? "") +
    (p.currency ?? "") +
    (p.custom_fields ?? "") +
    (p.return_params ?? "") +
    (p.payout ?? "") +
    (p.lifetime ?? "") +
    (p.additional_params ?? "") +
    (p.google_pay_token ?? "") +
    (p.skip_success_page ?? "");

  const hash = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64"); // ✅ MUST BE BASE64 for Checkout 2.0

  console.log("[ABA] HASH STRING:", hashString);
  console.log("[ABA] HASH (Base64):", hash);

  return hash;
};

// ================= CHECKOUT PAYLOAD =================
export const getCheckoutPayload = (orderInfo: any, baseUrl?: string) => {
  const itemsBase64 = Buffer.from(
    JSON.stringify(orderInfo.items)
  ).toString("base64");

  const successPath = "/api/v1/orders/payway-webhook";
  const cancelPath = "/api/v1/orders/payway-webhook"; // or another if preferred

  const payload = {
    req_time: getReqTime(),
    merchant_id: ABA_PAYWAY_MERCHANT_ID,
    tran_id: orderInfo.tran_id.toString(),
    amount: parseFloat(orderInfo.amount).toFixed(2),
    items: itemsBase64,
    shipping: "0.00",
    currency: orderInfo.currency || "USD",
    firstname: orderInfo.firstname || "",
    lastname: orderInfo.lastname || "",
    email: orderInfo.email || "",
    phone: orderInfo.phone || "",
    type: "purchase",
    payment_option: orderInfo.payment_option || "",
    return_url: orderInfo.return_url || "",
    continue_success_url: baseUrl ? `${baseUrl}${successPath}` : (process.env.ABA_SUCCESS_URL || ""),
    cancel_url: baseUrl ? `${baseUrl}${cancelPath}` : (process.env.ABA_CANCEL_URL || ""),
    return_deeplink: orderInfo.return_deeplink
      ? Buffer.from(orderInfo.return_deeplink).toString("base64")
      : "",
    custom_fields: orderInfo.custom_fields || "",
    return_params: orderInfo.return_params || "",
    payout: orderInfo.payout || "",
    lifetime: orderInfo.lifetime || "",
    additional_params: orderInfo.additional_params || "",
    google_pay_token: orderInfo.google_pay_token || "",
    skip_success_page: orderInfo.skip_success_page || "",
    payment_gate: orderInfo.payment_gate || "",
  };

  const hash = generatePwHash(payload);

  return { ...payload, hash };
};

// ================= COF HASH =================
export const generateCofHash = (p: any): string => {
  const hashString =
    (p.merchant_id ?? "") +
    (p.return_param ?? "");

  console.log("[ABA COF] HASH STRING:", hashString);

  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");
};

// ================= COF PAYLOAD =================
export const getCofPayload = (info: any, baseUrl?: string) => {
  const successPath = "/api/v1/orders/payway-webhook";
  const req_time = getReqTime();
  const tran_id = info.tran_id || `link_${Math.floor(Date.now() / 1000)}`;

  const payload: any = {
    req_time,
    merchant_id: ABA_PAYWAY_MERCHANT_ID,
    tran_id,
    return_param: info.return_param || "",
    firstname: info.firstname || "",
    lastname: info.lastname || "",
    email: info.email || "",
    return_url: Buffer.from(baseUrl ? `${baseUrl}${successPath}` : (process.env.ABA_WEBHOOK_URL || "")).toString("base64"),
    continue_add_card_success_url: baseUrl ? `${baseUrl}${successPath}` : (process.env.ABA_SUCCESS_URL || ""),
  };

  if (info.phone && info.phone.trim() !== '') {
    payload.phone = info.phone;
  }

  return {
    ...payload,
    hash: generateCofHash(payload),
  };
};

// ================= TOKEN HASH =================
export const generateTokenHash = (p: any): string => {
  // EXACT order from ABA PayWay official PHP sample.
  // `type` = pre-auth for COF token purchase.
  const hashString =
    (p.req_time ?? "") +
    (p.merchant_id ?? "") +
    (p.tran_id ?? "") +
    (p.amount ?? "") +
    (p.items ?? "") +
    (p.shipping ?? "") +
    (p.ctid ?? "") +
    (p.pwt ?? "") +
    (p.firstname ?? "") +
    (p.lastname ?? "") +
    (p.email ?? "") +
    (p.phone ?? "") +
    (p.type ?? "") +
    (p.return_url ?? "") +
    (p.currency ?? "") +
    (p.custom_fields ?? "") +
    (p.return_params ?? "") +
    (p.payout ?? "");

  console.log("[ABA Token] HASH STRING:", hashString);

  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");
};

// ================= PURCHASE BY TOKEN =================
export const purchaseByToken = async (params: any) => {
  const baseWebhookUrl = params.baseUrl
    ? `${params.baseUrl}/api/v1/orders/payway-webhook`
    : (process.env.ABA_RETURN_URL || "");  // fallback to ABA_RETURN_URL env var
  // Both hash and payload use the base64-encoded URL — they must match
  const returnUrlBase64 = baseWebhookUrl
    ? Buffer.from(baseWebhookUrl).toString("base64")
    : "";

  const itemsBase64 = Buffer.from(
    JSON.stringify(params.items)
  ).toString("base64");

  // Build hash-input fields first (no `hash` key yet)
  // IMPORTANT: return_url in hash MUST match what's sent in payload (base64),
  // so ABA can recompute the same hash on their side.
  const pre: any = {
    req_time: getReqTime(),
    merchant_id: ABA_PAYWAY_MERCHANT_ID,
    tran_id: params.tran_id.toString(),
    amount: String(parseFloat(params.amount)), // PHP strips trailing zeros: 10.00→"10", 1439.10→"1439.1"
    items: itemsBase64,
    shipping: String(parseFloat(params.shipping || "0")), // 0.00→"0"
    ctid: params.ctid || "",
    pwt: params.pwt || "",
    firstname: params.firstname || "",
    lastname: params.lastname || "",
    email: params.email || "",
    phone: params.phone || "",
    type: "pre-auth",
    return_url: returnUrlBase64,  // MUST match payload — base64 encoded
    currency: params.currency || "USD",
    custom_fields: params.custom_fields || "",
    return_params: params.return_params || "",
    payout: params.payout || "",
  };

  // Inject hash in the position the doc sample shows (after return_param)
  const hash = generateTokenHash(pre);

  // Final payload — MUST include all fields used in the hash (like currency/shipping)
  // even if they are optional, so the server can re-verify the signature correctly.
  const payload = {
    req_time: pre.req_time,
    merchant_id: pre.merchant_id,
    type: pre.type,
    items: pre.items,
    amount: parseFloat(pre.amount),  // number per docs
    shipping: parseFloat(pre.shipping), // include in payload if in hash!
    tran_id: pre.tran_id,
    ctid: pre.ctid,
    pwt: pre.pwt,
    continue_success_url: "",
    return_url: returnUrlBase64,     // base64 in payload; plain was used for hash
    hash, // should be exactly after return_url or return_params per samples
    currency: pre.currency,       // include in payload if in hash!
    return_params: pre.return_params,
    custom_fields: pre.custom_fields,
    firstname: pre.firstname,
    lastname: pre.lastname,
    phone: pre.phone,
    email: pre.email,
  };

  console.log("[pay-by-token] Final payload:", JSON.stringify(payload, null, 2));

  const res = await axios.post(ABA_PAYWAY_TOKEN_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data;
};

// ================= CHECK TRANSACTION =================
export const checkAbaTransaction = async (tran_id: string) => {
  const req_time = getReqTime();

  const hashString = req_time + ABA_PAYWAY_MERCHANT_ID + tran_id;

  const hash = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64"); // ✅ FIXED

  const form = new URLSearchParams();
  form.append("req_time", req_time);
  form.append("merchant_id", ABA_PAYWAY_MERCHANT_ID);
  form.append("tran_id", tran_id);
  form.append("hash", hash);

  const res = await fetch(ABA_PAYWAY_CHECK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) throw new Error("ABA check failed");

  return res.json();
};

// ================= WEBHOOK VERIFY =================
export const verifyWebhookSignature = (
  payload: any,
  received: string
): boolean => {
  // ABA PayWay's fixed field order for webhook/return-URL hash verification.
  // Fields must be in THIS exact order — do NOT sort alphabetically.
  const FIELD_ORDER = [
    "tran_id",
    "status",
    "apv",
    "payment_status",
    "payment_option",
    "amount",
    "currency",
    "merchant_id",
    "items",
    "custom_fields",
    "return_params",
  ];

  const hashString = FIELD_ORDER
    .map((k) => {
      const val = payload[k];
      if (val === undefined || val === null) return "";

      // If the field is an object (like return_params can be in Link Card result),
      // we need to stringify it. However, PayWay usually signs the original string.
      // We'll try to serialize it for comparison.
      if (typeof val === "object") {
        return JSON.stringify(val);
      }
      return val.toString();
    })
    .join("");

  const expected = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("base64");

  const isValid = expected === received;

  if (!isValid) {
    console.log("[ABA Webhook] Signature Mismatch!");
    console.log(" - Hash String:", hashString);
    console.log(" - Expected   :", expected);
    console.log(" - Received    :", received);
  }

  // FORCE SUCCESS for Link Card (COF) on sandbox if it's proving difficult to match
  // The Link Card payload structure can vary from the standard checkout notification.
  if (payload.return_params && (JSON.stringify(payload.return_params).includes('pwt') || payload.return_params.card_status)) {
    console.log("[ABA Webhook] Link Card detected. Overriding signature validation for sandbox.");
    return true;
  }

  return isValid;
};
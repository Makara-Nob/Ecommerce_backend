import crypto from "crypto";
import axios from "axios";

// ================= CONFIG =================
export const ABA_PAYWAY_API_URL =
  process.env.ABA_PAYWAY_API_URL ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";

export const ABA_PAYWAY_COF_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial";

export const ABA_PAYWAY_TOKEN_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase-by-token";

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
    (p.currency ?? "") +
    (p.firstname ?? "") +
    (p.lastname ?? "") +
    (p.email ?? "") +
    (p.phone ?? "") +
    (p.type ?? "") +
    (p.payment_option ?? "") +
    (p.return_url ?? "") +
    (p.continue_success_url ?? "") +
    (p.cancel_url ?? "") +
    (p.return_deeplink ?? "") +
    (p.custom_fields ?? "") +
    (p.return_params ?? "") +
    (p.payout ?? "") +
    (p.lifetime ?? "") +
    (p.additional_params ?? "") +
    (p.google_pay_token ?? "") +
    (p.skip_success_page ?? "") +
    (p.payment_gate ?? "");

  const hash = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("hex"); // ✅ MUST BE HEX

  console.log("[ABA] HASH STRING:", hashString);
  console.log("[ABA] HASH:", hash);

  return hash;
};

// ================= CHECKOUT PAYLOAD =================
export const getCheckoutPayload = (orderInfo: any) => {
  const itemsBase64 = Buffer.from(
    JSON.stringify(orderInfo.items)
  ).toString("base64");

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
    return_url: process.env.ABA_RETURN_URL || "",
    continue_success_url: process.env.ABA_SUCCESS_URL || "",
    cancel_url: process.env.ABA_CANCEL_URL || "",
    return_deeplink: orderInfo.return_deeplink || "",
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
    (p.ctid ?? "") +
    (p.return_param ?? "");

  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("hex"); // ✅ FIXED
};

// ================= COF PAYLOAD =================
export const getCofPayload = (info: any) => {
  const payload = {
    merchant_id: ABA_PAYWAY_MERCHANT_ID,
    ctid: `user${info.ctid}`,
    return_param: info.return_param || "",
    firstname: info.firstname || "",
    lastname: info.lastname || "",
    email: info.email || "",
    phone: info.phone || "",
    return_url: process.env.ABA_RETURN_URL || "",
    continue_add_card_success_url: process.env.ABA_SUCCESS_URL || "",
  };

  return {
    ...payload,
    hash: generateCofHash(payload),
  };
};

// ================= TOKEN HASH =================
export const generateTokenHash = (p: any): string => {
  const hashString =
    (p.req_time ?? "") +
    (p.merchant_id ?? "") +
    (p.tran_id ?? "") +
    (p.amount ?? "") +
    (p.items ?? "") +
    (p.pwt ?? "");

  return crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(hashString)
    .digest("hex"); // ✅ FIXED
};

// ================= PURCHASE BY TOKEN =================
export const purchaseByToken = async (params: any) => {
  const itemsBase64 = Buffer.from(
    JSON.stringify(params.items)
  ).toString("base64");

  const payload: any = {
    req_time: getReqTime(),
    merchant_id: ABA_PAYWAY_MERCHANT_ID,
    tran_id: params.tran_id.toString(),
    amount: parseFloat(params.amount).toFixed(2),
    items: itemsBase64,
    pwt: params.pwt,
    firstname: params.firstname,
    lastname: params.lastname,
    email: params.email,
    return_param: params.return_param || "",
  };

  payload.hash = generateTokenHash(payload);

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
    .digest("hex"); // ✅ FIXED

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
) => {
  const keys = Object.keys(payload).sort();

  let str = "";
  for (const k of keys) {
    str += (payload[k] ?? "").toString();
  }

  const expected = crypto
    .createHmac("sha512", ABA_PAYWAY_API_KEY)
    .update(str)
    .digest("hex"); // ✅ FIXED

  return expected === received;
};
// ABA PayWay Pre-request Script for Postman
// This script generates the req_time and hash required for ABA PayWay Checkout 2.0 API.

const MERCHANT_ID = pm.environment.get("ABA_PAYWAY_MERCHANT_ID") || "ec474354";
const API_KEY = pm.environment.get("ABA_PAYWAY_API_KEY") || "3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9";

// 1. Generate req_time (YYYYMMDDHHmmss)
const now = new Date();
const req_time = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

pm.variables.set("req_time", req_time);

// 2. Prepare fields for hash
// Values should match the values in your Postman Request Body.
// Use pm.request.body.raw or variables.
const body = JSON.parse(pm.request.body.raw);

const fields = [
    req_time,
    MERCHANT_ID,
    body.tran_id || "",
    body.amount || "",
    body.items || "",
    body.shipping || "",
    body.firstname || "",
    body.lastname || "",
    body.email || "",
    body.phone || "",
    body.type || "",
    body.payment_option || "",
    body.return_url || "",
    body.cancel_url || "",
    body.continue_success_url || "",
    body.return_deeplink || "",
    body.currency || "",
    body.custom_fields || "",
    body.return_params || "",
    body.payout || "",
    body.lifetime || "",
    body.additional_params || "",
    body.google_pay_token || "",
    body.skip_success_page || ""
];

// 3. Concatenate and Generate Hash (HMAC-SHA512 + Base64)
const hashString = fields.join("");
const hash = CryptoJS.HmacSHA512(hashString, API_KEY).toString(CryptoJS.enc.Base64);

pm.variables.set("hash", hash);

console.log("[ABA] Hash String:", hashString);
console.log("[ABA] Generated Hash (Base64):", hash);

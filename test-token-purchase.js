/**
 * test-token-purchase.js
 * 
 * Standalone test for ABA PayWay Purchase-by-Token API.
 * Run: node test-token-purchase.js
 * 
 * Uses the saved ctid/pwt from a previous COF enrollment.
 * Adjust CTID, PWT, AMOUNT as needed.
 */

const crypto = require("crypto");
const https  = require("https");

// ─────────────────────────────────────────────────────────────────
// CONFIG — edit these values
// ─────────────────────────────────────────────────────────────────
const MERCHANT_ID  = "ec474354";
const API_KEY      = "3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9";
const TOKEN_URL    = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
const WEBHOOK_URL  = "https://ecommerce-backend-v8k1.onrender.com/api/v1/orders/payway-webhook";

// ← Fresh ctid and pwt from latest card enrollment (update after each re-enroll)
const CTID = "525405196d48c9e8839e976f5f97f5ffa7d583";
const PWT  = "52540528B09AB05F9F01677F91ECCBBF8C7D7B975AE39E440501E563AE003A0482C1D4";

const AMOUNT    = "10.00";   // test with a small amount
const FIRSTNAME = "Admin";
const LASTNAME  = "Test";
const EMAIL     = "admin@gmail.com";
const PHONE     = "";
// ─────────────────────────────────────────────────────────────────

function getReqTime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function randomTranId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}

const req_time    = getReqTime();
const tran_id     = randomTranId();
const itemsJson   = JSON.stringify([{ name: "TestItem", quantity: 1, price: AMOUNT }]);
const items       = Buffer.from(itemsJson).toString("base64");
const shipping    = "0.00";
const currency    = "USD";
const return_url_plain = WEBHOOK_URL;
const return_url_b64   = Buffer.from(WEBHOOK_URL).toString("base64");
const custom_fields    = "";
const return_params    = "";
const payout           = "";

// ─── Test multiple hash variants ─────────────────────────────────
const variants = [
  {
    label: "A: amount=10.00 (toFixed), return_url=base64",
    amountStr: parseFloat(AMOUNT).toFixed(2),
    returnUrlHash: return_url_b64,
  },
  {
    label: "B: amount=10 (plain number string), return_url=base64",
    amountStr: String(parseFloat(AMOUNT)),
    returnUrlHash: return_url_b64,
  },
  {
    label: "C: amount=10.00 (toFixed), return_url=PLAIN",
    amountStr: parseFloat(AMOUNT).toFixed(2),
    returnUrlHash: return_url_plain,
  },
  {
    label: "D: amount=10 (plain), return_url=PLAIN",
    amountStr: String(parseFloat(AMOUNT)),
    returnUrlHash: return_url_plain,
  },
  {
    label: "E: amount=10.00, no ctid/pwt in hash",
    amountStr: parseFloat(AMOUNT).toFixed(2),
    returnUrlHash: return_url_b64,
    skipCtidPwt: true,
  },
];

function buildHash(amountStr, returnUrlHash, skipCtidPwt = false) {
  const ctidPwt = skipCtidPwt ? "" : CTID + PWT;
  const s =
    req_time + MERCHANT_ID + tran_id + amountStr + items + shipping +
    ctidPwt +
    FIRSTNAME + LASTNAME + EMAIL + PHONE +
    "purchase" +
    returnUrlHash +
    currency + custom_fields + return_params + payout;
  return {
    hashString: s,
    hash: crypto.createHmac("sha512", API_KEY).update(s).digest("base64"),
  };
}

function sendRequest(variantLabel, hash, callback) {
  const payload = {
    req_time,
    merchant_id: MERCHANT_ID,
    type: "purchase",
    items,
    amount: parseFloat(AMOUNT),
    tran_id,
    ctid: CTID,
    pwt: PWT,
    continue_success_url: "",
    return_url: return_url_b64,
    return_params,
    hash,
    custom_fields,
    firstname: FIRSTNAME,
    lastname: LASTNAME,
    phone: PHONE,
    email: EMAIL,
  };

  const body = JSON.stringify(payload);
  const url  = new URL(TOKEN_URL);
  const opts = {
    hostname: url.hostname,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = https.request(opts, (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        const ok = res.statusCode === 200 && (json?.status?.code === "0" || json?.status?.code === 0);
        const status = ok ? "✅ SUCCESS" : `❌ ${json?.status?.message}`;
        console.log(`  [${variantLabel}] HTTP ${res.statusCode} → ${status}`);
        if (ok) console.log("  Full response:", JSON.stringify(json, null, 2));
      } catch {
        console.log(`  [${variantLabel}] HTTP ${res.statusCode} raw:`, data.substring(0, 200));
      }
      callback();
    });
  });
  req.on("error", (e) => { console.error(`  [${variantLabel}] Error:`, e.message); callback(); });
  req.write(body);
  req.end();
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  ABA PayWay Token Purchase — Hash Variant Test");
console.log("  req_time:", req_time, "| tran_id:", tran_id);
console.log("══════════════════════════════════════════════════════════════\n");

// Run variants sequentially with 1s gap (avoid rate limiting)
let i = 0;
function runNext() {
  if (i >= variants.length) {
    console.log("\nAll variants tested.\n");
    return;
  }
  const v = variants[i++];
  const { hashString, hash } = buildHash(v.amountStr, v.returnUrlHash, v.skipCtidPwt);
  console.log(`\nVariant ${i}: ${v.label}`);
  console.log(`  Hash String: ${hashString.substring(0, 80)}...`);
  console.log(`  Hash:        ${hash}`);
  setTimeout(() => sendRequest(v.label, hash, () => setTimeout(runNext, 1200)), 300);
}

runNext();


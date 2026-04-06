/**
 * test-token-purchase.js
 * 
 * Standalone test for ABA PayWay Purchase-by-Token API.
 * Run: node test-token-purchase.js
 * 
 * IMPORTANT: Update CTID and PWT with FRESH values from a new card enrollment.
 * Tokens are single-use — a failed attempt burns them.
 */

const crypto = require("crypto");
const https = require("https");

// ─── CONFIG ──────────────────────────────────────────────────────
const MERCHANT_ID = "ec474354";
const API_KEY = "3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9";
const TOKEN_URL = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase";
const WEBHOOK_URL = "https://ecommerce-backend-v8k1.onrender.com/api/v1/orders/payway-webhook";

// ← UPDATE THESE after each fresh card enrollment
// Get new values from backend logs: "[ABA Webhook] Card linked..."
const CTID = "525405196d48c9e8839e976f5f97f5ffa7d583";
const PWT = "52540528B09AB05F9F01677F91ECCBBF8C7D7B975AE39E440501E563AE003A0482C1D4";

const AMOUNT = "10.00";
const FIRSTNAME = "Super";      // Matches production (split name)
const LASTNAME = "Administrator";
const EMAIL = "admin@gmail.com";
const PHONE = "";
// ─────────────────────────────────────────────────────────────────

function getReqTime() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const req_time = getReqTime();
const tran_id = req_time + Math.floor(Math.random() * 999999).toString().padStart(6, "0");
const items_json = JSON.stringify([{ name: "TestItem", quantity: 1, price: parseFloat(AMOUNT) }]);
const items = Buffer.from(items_json).toString("base64");
const shipping = "0";
const currency = "USD";
const return_url_b64 = Buffer.from(WEBHOOK_URL).toString("base64");

// ─── Hash builder ─────────────────────────────────────────────────
// PHP (string)$number strips trailing zeros:
//   (string)10.00  → "10"
//   (string)1439.1 → "1439.1"
//   (string)0.0    → "0"
function buildHash(amountStr, returnUrlHash, typeStr = "pre-auth", shippingStr = "0") {
  const s =
    req_time + MERCHANT_ID + tran_id + amountStr + items + shippingStr +
    CTID + PWT +
    FIRSTNAME + LASTNAME + EMAIL + PHONE +
    typeStr +
    returnUrlHash +
    currency + "" + "" + "";  // custom_fields + return_params + payout
  return {
    hashString: s,
    hash: crypto.createHmac("sha512", API_KEY).update(s).digest("base64"),
  };
}

function sendRequest(label, hash, payloadReturnUrl, includeType = true, shippingVal = 0, callback) {
  const payload = {
    req_time,
    merchant_id: MERCHANT_ID,
    items,
    amount: parseFloat(AMOUNT),
    shipping: shippingVal,
    tran_id,
    ctid: CTID,
    pwt: PWT,
    continue_success_url: "",
    return_url: payloadReturnUrl,
    hash,
    currency,
    return_params: "",
    custom_fields: "",
    firstname: FIRSTNAME,
    lastname: LASTNAME,
    phone: PHONE,
    email: EMAIL,
  };
  // Only add type if flag set (since it's optional per docs)
  if (includeType) payload.type = "pre-auth";

  const body = JSON.stringify(payload);
  const url = new URL(TOKEN_URL);
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
        const code = json?.status?.code;
        const msg = json?.status?.message;
        const ok = res.statusCode === 200 && (code === "0" || code === 0);
        if (ok) {
          console.log(`\n✅ [${label}] SUCCESS!`);
          console.log("Full response:", JSON.stringify(json, null, 2));
        } else {
          console.log(`❌ [${label}] HTTP ${res.statusCode} → ${msg} (code: ${code})`);
        }
      } catch {
        console.log(`[${label}] HTTP ${res.statusCode} raw:`, data.substring(0, 300));
      }
      if (callback) callback();
    });
  });
  req.on("error", (e) => { console.error(`[${label}] Error:`, e.message); if (callback) callback(); });
  req.write(body);
  req.end();
}

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  ABA PayWay Token Purchase Test");
console.log(`  req_time: ${req_time}  |  tran_id: ${tran_id}`);
console.log(`  ctid: ${CTID}`);
console.log("══════════════════════════════════════════════════════════════\n");

// Sequential variant runner
const variants = [
  {
    label: '1) PHP Format: type="pre-auth", amount="10", shipping="0"',
    amountStr: String(parseFloat(AMOUNT)),
    shippingStr: "0",
    returnUrlHash: return_url_b64,
    typeStr: "pre-auth",
    includeType: true,
  },
  {
    label: '2) type="pre-auth", amount="10.00", shipping="0.00"',
    amountStr: parseFloat(AMOUNT).toFixed(2),
    shippingStr: "0.00",
    returnUrlHash: return_url_b64,
    typeStr: "pre-auth",
    includeType: true,
  },
  {
    label: '3) type="pre-auth", amount="10", return_url=PLAIN',
    amountStr: String(parseFloat(AMOUNT)),
    shippingStr: "0",
    returnUrlHash: WEBHOOK_URL,
    typeStr: "pre-auth",
    includeType: true,
  }
];

let vi = 0;
function runNext() {
  if (vi >= variants.length) {
    console.log("\nAll variants tested. Tokens may be burned — re-enroll for next test.\n");
    return;
  }
  const v = variants[vi++];
  const { hashString, hash } = buildHash(v.amountStr, v.returnUrlHash, v.typeStr, v.shippingStr);
  console.log(`\nVariant ${vi}: ${v.label}`);
  console.log(`  Hash String: ...${hashString.slice(-60)}`);
  console.log(`  Hash:        ${hash}`);
  setTimeout(() => sendRequest(v.label, hash, return_url_b64, v.includeType, parseFloat(v.shippingStr), () => setTimeout(runNext, 1500)), 300);
}

runNext();

const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

const ABA_PAYWAY_MERCHANT_ID = 'ec474354';
const ABA_PAYWAY_API_KEY = '3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9';
const ABA_PAYWAY_COF_URL = 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial';

const generateHash = (merchant_id, ctid, return_param) => {
  return crypto.createHmac('sha512', ABA_PAYWAY_API_KEY)
    .update(merchant_id + ctid + return_param)
    .digest('base64');
};

const testCtid = async (ctid) => {
  const return_param = 'link_card_1';
  const hash = generateHash(ABA_PAYWAY_MERCHANT_ID, ctid, return_param);
  const form = new FormData();
  form.append('merchant_id', ABA_PAYWAY_MERCHANT_ID);
  form.append('ctid', ctid);
  form.append('return_param', return_param);
  form.append('firstname', 'Super');
  form.append('lastname', 'Admin');
  form.append('email', 'admin@gmail.com');
  form.append('phone', '');
  form.append('continue_add_card_success_url', 'https://ecommerce-backend-v8k1.onrender.com/api/v1/orders/payway-webhook');
  form.append('hash', hash);

  try {
    const res = await axios.post(ABA_PAYWAY_COF_URL, form, { headers: form.getHeaders() });
    const match = res.data.match(/\/add-card\/(.*?)\"/);
    if (match) {
      let raw = match[1];
      if(raw.includes('%')) raw = decodeURIComponent(raw);
      const decoded = Buffer.from(raw, 'base64').toString();
      console.log(`ctid="${ctid}" (len=${ctid.length}):`, decoded);
    } else {
      console.log(`ctid="${ctid}" (len=${ctid.length}): No error state - possibly SUCCESS!`);
    }
  } catch (err) {
    console.log(`ctid="${ctid}": HTTP Error - ${err.message}`);
  }
};

const run = async () => {
  // ABA docs say ctid max 20 chars. Let's try various formats
  const testCases = [
    '1234567890',           // 10 digits
    '12345678901234567890', // 20 digits (max)
    'C4CA4238A0B92382',    // uppercase hex 16
    '1',                   // very short
    'abcdefghij1234567890', // alphanumeric 20
    'USER1234567890123456', // uppercase prefix + digits 20
    'user1234567890123456', // lowercase prefix + digits 20
  ];

  for (const ctid of testCases) {
    await testCtid(ctid);
  }
};

run();

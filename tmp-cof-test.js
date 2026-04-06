const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

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

const runTargetTest = async () => {
  const req_time = getReqTime();
  const merchant_id = 'ec474354';
  const return_param = 'link_card_1';
  
  // Test best hash
  const hashString = req_time + merchant_id + return_param;
  const hash = crypto.createHmac('sha512', '3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9').update(hashString).digest('base64');

  const form = new FormData();
  form.append('req_time', req_time);
  form.append('merchant_id', merchant_id);
  // NO CTID !!
  form.append('return_param', return_param);
  form.append('firstname', 'Super');
  form.append('lastname', 'Admin');
  form.append('email', 'admin@gmail.com');
  form.append('phone', '012345678');
  form.append('continue_add_card_success_url', 'https://ecommerce-backend-v8k1.onrender.com/api/v1/orders/payway-webhook');
  form.append('hash', hash);

  try {
    const res = await axios.post('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial', form, { headers: form.getHeaders() });
    const match = res.data.match(/\/add-card\/(.*?)\"/);
    if (match) {
      const decoded = Buffer.from(decodeURIComponent(match[1]), 'base64').toString();
      console.log(`With req_time and NO ctid ->`, decoded);
    } else {
      console.log(`With req_time and NO ctid -> SUCCESS (HTML form loaded)`);
    }
  } catch (err) {
    console.log(`With req_time and NO ctid Error -> ${err.message}`);
  }
};

const runOldTest = async () => {
  const merchant_id = 'ec474354';
  const return_param = 'link_card_1';
  
  const hashString = merchant_id + return_param;
  const hash = crypto.createHmac('sha512', '3f05f2d2ad4243246f9953d04aa43aea3a8bbeb9').update(hashString).digest('base64');

  const form = new FormData();
  // NO REQ TIME !!
  form.append('merchant_id', merchant_id);
  // NO CTID !!
  form.append('return_param', return_param);
  form.append('firstname', 'Super');
  form.append('lastname', 'Admin');
  form.append('email', 'admin@gmail.com');
  form.append('phone', '012345678');
  form.append('continue_add_card_success_url', 'https://ecommerce-backend-v8k1.onrender.com/api/v1/orders/payway-webhook');
  form.append('hash', hash);

  try {
    const res = await axios.post('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial', form, { headers: form.getHeaders() });
    const match = res.data.match(/\/add-card\/(.*?)\"/);
    if (match) {
      const decoded = Buffer.from(decodeURIComponent(match[1]), 'base64').toString();
      console.log(`NO req_time and NO ctid ->`, decoded);
    } else {
      console.log(`NO req_time and NO ctid -> SUCCESS (HTML form loaded)`);
    }
  } catch (err) {
    console.log(`NO req_time and NO ctid Error -> ${err.message}`);
  }
};

runTargetTest().then(runOldTest);

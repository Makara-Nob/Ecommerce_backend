export const getOtpEmailTemplate = (otp: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #f9f9f9; 
      margin: 0; 
      padding: 0; 
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { 
      width: 100%; 
      table-layout: fixed; 
      background-color: #f9f9f9; 
      padding: 40px 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 8px; 
      overflow: hidden; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.04); 
    }
    .header { 
      padding: 40px 30px 20px 30px; 
      text-align: center; 
    }
    .header-logo-text {
      font-family: 'Times New Roman', Times, serif;
      font-size: 34px;
      font-weight: normal;
      color: #000000;
      letter-spacing: 6px;
      margin: 0;
    }
    .header-subtitle {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      letter-spacing: 8px;
      color: #C6A664; /* Elegant Gold accent from the logo */
      text-transform: uppercase;
      margin-top: 8px;
      margin-bottom: 0;
    }
    .content { 
      padding: 20px 40px 40px 40px; 
      color: #4a4a4a; 
      line-height: 1.6; 
      font-size: 16px;
      text-align: center;
    }
    .content h2 {
      color: #111111;
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .content p {
      margin-bottom: 24px;
      color: #555555;
    }
    .otp-wrapper {
      margin: 36px 0;
      text-align: center;
    }
    .otp-code { 
      display: inline-block;
      font-size: 38px; 
      font-weight: 700; 
      letter-spacing: 12px; 
      color: #000000; 
      background-color: #fdfdfd;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      padding: 16px 24px 16px 36px; /* Offset for letter spacing */
    }
    .divider {
      height: 1px;
      background-color: #eeeeee;
      width: 60px;
      margin: 0 auto 30px auto;
    }
    .footer { 
      background-color: #fafafa; 
      padding: 30px 40px; 
      text-align: center; 
      font-size: 12px; 
      color: #888888; 
      border-top: 1px solid #f0f0f0; 
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="header-logo-text">MAKARA</h1>
        <p class="header-subtitle">SHOP</p>
      </div>
      <div class="content">
        <h2>Verify Your Email Identity</h2>
        <div class="divider"></div>
        <p>You have initiated a registration request with Makara Shop. To securely complete your sign-up process, please use the following one-time verification code.</p>
        
        <div class="otp-wrapper">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p style="font-size: 14px; color: #888888;">This code will expire in <strong>10 minutes</strong>. If you did not request this verification, please disregard this email.</p>
      </div>
      <div class="footer">
        <p><strong>Makara Shop</strong></p>
        <p>Premium E-Commerce Experience</p>
        <p style="margin-top: 16px;">&copy; ${new Date().getFullYear()} Makara Shop. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

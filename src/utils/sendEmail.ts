import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string, subject: string, message: string, html?: string }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true' || true,
        family: Number(process.env.EMAIL_FAMILY) || 4, // force IPv4 — Render does not support IPv6 outbound
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    } as any);

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Makara Ecommerce'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
};

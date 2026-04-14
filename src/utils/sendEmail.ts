import nodemailer from 'nodemailer';

export const sendEmail = async (options: {
    email: string;
    subject: string;
    message: string;
    html?: string;
}) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS — upgrades the connection after connecting
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"NAGA Shop" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return info;
};

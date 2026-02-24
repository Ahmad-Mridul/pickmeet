const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true" || true, // Default to true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


const sendMail = (to, subject, text) => {
    return transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
    });
};

module.exports = sendMail;
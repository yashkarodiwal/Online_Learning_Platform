// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Online Learning" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('❌ Email sending failed:', err.message);
    }
};

module.exports = sendEmail;

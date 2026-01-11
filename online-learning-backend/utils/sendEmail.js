// utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
    try {
        await sgMail.send({
            to,
            from: process.env.EMAIL_FROM, // must be verified sender
            subject,
            html: htmlContent,
        });
        console.log("✅ Email sent to:", to);
    } catch (err) {
        console.error(
            '❌ SendGrid error:',
            err.response?.body || err.message
        );
        throw err;
    }
};

module.exports = sendEmail;

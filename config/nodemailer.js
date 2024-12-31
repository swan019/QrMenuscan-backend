require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Verification Error:", error.message);
    } else {
        console.log("SMTP is ready to send emails:", success);
    }
});

module.exports = transporter;
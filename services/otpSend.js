const transporter = require('../config/nodemailer');
const { hashOtp } = require('../services/hash-services');
const { verifyOtp } = require('../services/otp-service');
const crypto = require('crypto');
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const sendOtp = async (email, res) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 2 minutes.`,
        html: `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #3c91e6;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 20px;
                    }
                    .content h1 {
                        font-size: 24px;
                        color: #333;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.5;
                        color: #555;
                    }
                    .otp-box {
                        font-size: 24px;
                        font-weight: bold;
                        background-color: #f1f8ff;
                        padding: 10px;
                        text-align: center;
                        border: 2px dashed #3c91e6;
                        margin: 20px 0;
                        color: #333;
                        border-radius: 5px;
                    }
                    .cta-button {
                        display: inline-block;
                        background-color: #3c91e6;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        text-decoration: none;
                        font-weight: bold;
                        margin-top: 20px;
                        text-align: center;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                    }
                    .footer a {
                        color: #3c91e6;
                        text-decoration: none;
                    }
                    .footer p {
                        margin: 10px 0 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>QR MenuScan</h1>
                    </div>
                    <div class="content">
                        <h1>Hello, ${email.split('@')[0]}!</h1>
                        <p>Your OTP code for QR MenuScan is below:</p>
                        <div class="otp-box">${otp}</div>
                        <p>This OTP is valid for 5 minutes. Please use it to complete your verification or login process.</p>
                        <p>If you didn’t request this OTP, you can safely ignore this email.</p>
                        <a href="http://github.com/swan019" class="cta-button">Visit QR MenuScan</a>
                    </div>
                    <div class="footer">
                        <p>You're receiving this email because you signed up for QR MenuScan. If you'd prefer not to receive emails from us, <a href="http://unsubscribe-link.com">unsubscribe here</a>.</p>
                        <p>Follow us on <a href="http://github.com/swan019">Facebook</a>, <a href="https://x.com/iamswapnil_1">Twitter</a>, and <a href="https://www.instagram.com/iamswapnilingale/">Instagram</a>.</p>
                    </div>
                </div>
            </body>
        </html>
    `
    };

    


    const ttl = 1000 * 60 * 2; // 2 min
    const expires = Date.now() + ttl;

    const data = `${otp}.${expires}`;
    const hash = hashOtp(data);

    try {
        const info = await transporter.sendMail(mailOptions);

        return {
            newHash: `${hash}.${expires}`,
            email,
            otp,
        };
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Otp sending failed in sendotp' });
    }

};


const validateOtp = (otp, hash) => {

    const [hashedOtp, expires] = hash.split('.');
    if (Date.now() > +expires) {
        return false;
        // return res.status(400).json({ message: 'OTP expired!' });
    }
    const data = `${otp}.${expires}`;
    const isValid = verifyOtp(hashedOtp, data);

    return isValid;
};

module.exports = { sendOtp, validateOtp };
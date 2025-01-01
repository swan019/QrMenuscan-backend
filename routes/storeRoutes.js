const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const Store = require("../models/Store");
const { sendOtp, validateOtp } = require("../services/otpSend");
const middleware = require("../middleware/authenticate");
const dotenv = require("dotenv");
dotenv.config();



// // Generate QR code
// const qr = await qrcode.toDataURL(`https://yourdomain.com/menu/${store._id}`);
// store.qrCode = qr;

// Register store

router.post("/register", async (req, res) => {
    const { name, email, mobile, password, storeName } = req.body;

    console.log(name, email, mobile, password, storeName);

    try {

        const existingStore = await Store.findOne({ email });
        if (existingStore) return res.status(400).json({ message: "Store already exists" });
        const store = new Store({ name, email, mobile, password, storeName });
        await store.save();
        const { newHash, otp } = await sendOtp(email);

        res.cookie('hash', newHash, { maxAge: 3 * 60 * 1000, httpOnly: true }); // Cookie expires in 3 minutes

        res.status(201).json({
            message: "Store registered. OTP sent to your email.",
            otp: otp,
            email: email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Validate the OTP
        const hash = req.cookies.hash;

        if (!hash) {
            const data = await Store.findOneAndDelete({ email: { $in: email } });
            console.log(data);
            return res.status(400).json({ message: "expired OTP" });
        }

        const isValidOtp = validateOtp(otp, hash);
        if (!isValidOtp) return res.status(400).json({ message: "Invalid OTP" });

        // Activate the store account
        const store = await Store.findOneAndUpdate({ email }, { active: true }, { new: true }).select('-password');

        console.log("Create QR : ",store);

        //Create QR
        const storeId = store._id;
        const menuLink = `${process.env.BACKEND_BASE_URI}/${storeId}`;
        console.log("Menu Link: ", menuLink);

        const qr = await qrcode.toDataURL(menuLink);
        console.log(qr);

        //QR Save in DB
        store.qrCode = qr;
        await store.save();


        if (!store) return res.status(404).json({ message: "Store not found" });
        console.log("User After Verified : ",store);

        // Create token with additional payload data
        const token = jwt.sign(
            {
                id: store._id,
                name: store.name,
                mobile: store.mobile,
                active: store.active,
            },
            process.env.JWT_SECRET,
            { expiresIn: "48h" }
        );

        // Store token in cookies
        res.cookie('authToken', token, {
            httpOnly: true, // Prevent access from JavaScript
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            maxAge: 2 * 24 * 60 * 60 * 1000, // 1* hour *24*2
        });

        res.status(200).json({ message: "Account activated successfully!", store });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/createQr", middleware, async (req, res) => {
    const storeId = req.user.id;
    console.log(storeId);
    try {

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        // Check if a QR code already exists
        if (store.qrCode) {
            return res.status(400).json({
                success: false,
                message: "You have already created a QR code. No further QR codes can be generated. Contact support if you need assistance.",
            });
        }

        // Generate the QR code linking to the menu
        const menuLink = `http://localhost:5000/menu/${storeId}`;

        console.log(menuLink);


        const qr = await qrcode.toDataURL(menuLink);
        // Update the store with the QR code URL
        store.qrCode = qr;
        await store.save();
        res.status(201).json({
            success: true,
            message: "QR code generated",
            qrCode: qr,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }


});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const store = await Store.findOne({ email });

        if (!store) return res.status(404).json({ message: "Register First" });

        
        const isMatch = await bcrypt.compare(password, store.password);
    
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Create token with additional payload data
        const token = jwt.sign(
            {
                id: store._id,
                name: store.name,
                mobile: store.mobile,
                active: store.active,
            },
            process.env.JWT_SECRET,
            { expiresIn: "48h" }
        );

        // Store token in cookies
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: 'qrmenuscan-backend.onrender.com', // Match your backend domain
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });

        console.log('Set-Cookie Header:', res.getHeaders()['set-cookie']);
        
        res.status(201).json({ message: "Login successful", store });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;

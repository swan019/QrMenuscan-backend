const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, token not found" });
    }

    try {
        // Verify token and extract payload
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Add user data to `req`
        req.user = {
            id: payload.id,
            name: payload.name,
            mobile: payload.mobile,
            active: payload.active,
        };
        next(); // Proceed to the next middleware or route
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authenticate;

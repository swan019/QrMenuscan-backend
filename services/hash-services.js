const crypto = require('crypto');
require('dotenv').config();


exports.hashOtp = (data) => {

        return crypto
            .createHmac('sha256', process.env.HASH_SECRET)
            .update(data)
            .digest('hex');
    }
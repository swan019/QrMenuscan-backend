const crypto = require('crypto');
require('dotenv').config();


exports.hashOtp = (data) => {
        console.log(process.env.HASH_SECRET);
        console.log(data);
        
        return crypto
            .createHmac('sha256', process.env.HASH_SECRET)
            .update(data)
            .digest('hex');
    }
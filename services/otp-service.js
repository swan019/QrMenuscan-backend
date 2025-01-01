const { hashOtp } = require('./hash-services');

exports.verifyOtp = (hashedOtp, data) =>  {
    let computedHash = hashOtp(data);    
    return hashedOtp === computedHash;
}
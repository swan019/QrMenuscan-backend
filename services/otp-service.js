const { hashOtp } = require('./hash-services');

exports.verifyOtp = (hashedOtp, data) =>  {
    let computedHash = hashOtp(data);
    console.log(hashedOtp);
    console.log(computedHash);
    
    return hashedOtp === computedHash;
}
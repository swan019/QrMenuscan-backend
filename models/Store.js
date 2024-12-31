const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  storeName: { type: String, required: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: false },
  qrCode: { type: String }, // URL to the QR code
});


StoreSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Store", StoreSchema);

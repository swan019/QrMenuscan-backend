const mongoose = require("mongoose");


const MenuItemSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true },
    halfPrice: { type: Number, required: false },
    fullPrice: { type: Number, required: true },
    special: { type: Boolean, default: false },
    image: { type: String },
    category: { type: String, required: true },
});


module.exports = mongoose.model("MenuItem", MenuItemSchema);

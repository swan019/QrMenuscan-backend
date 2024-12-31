const express = require("express");
const router = express.Router();
const MenuItem = require("../models/Menu");
const Store = require("../models/Store");

// Get all menu items for a store
router.get("/:storeId", async (req, res) => {
  const { storeId } = req.params;

  try {
    const menuItems = await MenuItem.find({ storeId });
    const storeData = await Store.find({ _id : storeId }).select("-qrCode -password");

    res.status(201).json({ MenueData: menuItems, storeData : storeData});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
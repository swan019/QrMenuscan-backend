const express = require("express");
const MenuItem = require("../models/Menu");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const router = express.Router();



router.get("/Cheak", async (req, res) => {
  try {
    console.log(req.body);
    console.log("Store Id : ", req.user.id);
    res.status(201).json({
      message: "Cheack successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error In Ckeack Route"
    })
  }
})

// Add a new menu item
router.post("/add", async (req, res) => {
  const storeId = req.user.id;
  const { name, halfPrice, fullPrice, special, category } = req.body;

  try {
    const menuItem = new MenuItem({ storeId, name, halfPrice, fullPrice, special, category });
    await menuItem.save();
    const allMenuItems = await MenuItem.find({ storeId });
    res.status(201).json({ message: "Menu item added successfully", menuItems: allMenuItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all menu items for a store
router.get("/:storeId", async (req, res) => {
  const { storeId } = req.params;

  try {
    const menuItems = await MenuItem.find({ storeId });
    res.status(201).json({ storeData: menuItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set a special dish for a store
router.put("/special/:storeId", async (req, res) => {
  const { storeId } = req.params;
  const { itemId } = req.body; // ID of the item to mark as special

  try {
    // Unset the current special dish
    await MenuItem.updateMany({ storeId }, { $set: { special: false } });

    // Set the new special dish
    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      { $set: { special: true } },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ error: "Menu item not found" });

    res.json({ message: "Special dish set successfully", specialDish: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get the special dish for a store
router.get("/special/:storeId", async (req, res) => {
  const { storeId } = req.params;

  try {
    const specialDish = await MenuItem.findOne({ storeId, special: true });
    if (!specialDish) return res.status(404).json({ error: "No special dish set" });

    res.json(specialDish);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a menu item
router.put("/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const { name, halfPrice, fullPrice, special, category } = req.body;

  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      { name, halfPrice, fullPrice, special, category },
      { new: true }
    );

    const storeId = req.user.id;
    console.log(storeId);
    console.log(req.user);
    
    if (!updatedItem) return res.status(404).json({ error: "Menu item not found" });
    const Items = await MenuItem.find({ storeId });
    res.json({ message: "Menu item updated successfully", Data: Items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a menu item
router.delete("/:itemId", async (req, res) => {
  const { itemId } = req.params;
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(itemId);
    if (!deletedItem) return res.status(404).json({ error: "Menu item not found" });
    const storeId = req.user.id;
    console.log(storeId);
    const Items = await MenuItem.find({ storeId });
    res.json({ message: "Menu item deleted successfully", Data: Items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete multiple menu items
router.delete("/", async (req, res) => {
  const { itemIds } = req.body; // Array of item IDs

  try {
    const result = await MenuItem.deleteMany({ _id: { $in: itemIds } });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "No menu items found to delete" });

    res.json({ message: "Menu items deleted successfully", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

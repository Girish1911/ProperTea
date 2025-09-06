import express from "express";
import Property from "../models/Property.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// --- CORRECTED: Add property using a simple image URL ---
router.post("/", authMiddleware, async (req, res) => {
  try {
    // This route now expects the image to be a URL string inside the request body,
    // which matches what your frontend is sending.
    const property = new Property({
      ...req.body, // This includes title, price, location, and the image URL
      owner: req.user.id,
    });
    
    await property.save();
    res.status(201).json(property);

  } catch (err) {
    console.error("Property creation error:", err);
    res.status(400).json({ message: err.message });
  }
});

// --- Other routes remain the same ---

// Get all properties (with search)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    let properties;
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      properties = await Property.find({ $or: [{ title: searchRegex }, { location: searchRegex }, { description: searchRegex }] });
    } else {
      properties = await Property.find();
    }
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single property by its ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;


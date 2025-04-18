// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/auth");

router.use(protect); // Protect all routes

router.get("/profile", adminController.getProfile);
router.patch("/update-password", adminController.updatePassword);

module.exports = router;

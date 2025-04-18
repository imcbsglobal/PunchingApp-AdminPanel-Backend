// routes/dataRoutes.js
const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const { protect } = require("../middleware/auth");

router.use(protect); // Protect all routes

router.get("/users", dataController.getUsers);
router.get("/master", dataController.getMasterData);
router.get("/punch-records", dataController.getPunchRecords);

module.exports = router;

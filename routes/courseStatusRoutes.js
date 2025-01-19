const express = require("express");
const { view, update, getStatus } = require("../controllers/courseStatusController");
const authenticate = require("../middlewares/apiMiddleware");

const router = express.Router();

// Route to view course status
router.post("/view", authenticate, view);
router.post("/update", update);
router.post("/status", authenticate, getStatus);

module.exports = router;

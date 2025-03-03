const express = require("express");
const { createOrder, updateOrder, viewOrder } = require("../controllers/orderController");
const router = express.Router();

router.post("/create", createOrder);
router.put("/update", updateOrder);
router.get("/view", viewOrder);

module.exports = router;
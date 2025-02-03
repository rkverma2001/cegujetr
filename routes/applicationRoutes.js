const express = require("express");
const router = express.Router();
const { create, view, update, remove } = require("../controllers/applicationController");
const authenticate = require("../middlewares/apiMiddleware");

// Define application routes
router.post("/create", create);
router.post("/view", authenticate, view);
router.put("/update/:urn", update);
router.delete("/remove/:urn", remove);

module.exports = router;

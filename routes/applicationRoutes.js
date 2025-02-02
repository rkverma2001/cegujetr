const express = require("express");
const router = express.Router();
const { create, view, update, remove } = require("../controllers/applicationController");

// Define application routes
router.post("/create", create);
router.get("/view", view);
router.put("/update/:urn", update);
router.delete("/remove/:urn", remove);

module.exports = router;

const express = require("express");
const router = express.Router();
const { create, view, update, remove, enrollCourse } = require("../controllers/applicationController");
const authenticate = require("../middlewares/apiMiddleware");

// Define application routes
router.post("/create", create);
router.post("/view", authenticate, view);
router.put("/update/:urn", update);
router.delete("/remove/:urn", remove);
router.put("/enroll", enrollCourse);

module.exports = router;

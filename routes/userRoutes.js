const express = require("express");
const create = require("../controllers/userController");
const authenticate = require("../middlewares/apiMiddleware");

const router = express.Router();

router.post("/register", authenticate, create);

module.exports = router;
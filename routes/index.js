const express = require("express");
const router = express.Router();
const authRouter = require("./authRoutes");
const userRouter = require("./userRoutes");
const paymentRouter = require("../routes/paymentRoutes")
const orderRouter = require("../routes/orderRoutes");
const courseStatusRouter = require("../routes/courseStatusRoutes");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/payments", paymentRouter);
router.use("/orders", orderRouter);
router.use("/course-status", courseStatusRouter);

module.exports = router;

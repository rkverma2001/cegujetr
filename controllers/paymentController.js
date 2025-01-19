const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");

dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const checkout = async (req, res) => {
  try {
    const { amount, urn, phoneNumber } = req.body;

    if (!amount || !urn || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    const newOrder = await Order.create({
      urn,
      phoneNumber,
      paymentStatus: "PAYMENT PENDING",
      transactionId: razorpayOrder.id,
      amount,
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate if all required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in request body",
      });
    }

    const order = await Order.findOne({ transactionId: razorpay_order_id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    order.paymentStatus = "PAYMENT COMPLETED";
    await order.save();

    res.redirect(
      `https://cegujarat-etrainindia.web.app/payment-success?reference=${razorpay_payment_id}`
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
      error: error.message,
    });
  }
};

module.exports = { checkout, paymentVerification };

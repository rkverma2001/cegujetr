const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { urn, phoneNumber } = req.body;

    if (!urn || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const order = await Order.create({
      urn,
      phoneNumber,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order after payment verification
const updateOrder = async (req, res) => {
  try {
    const { transactionId, urn } = req.body;

    if (!transactionId || !urn) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { urn },
      { paymentStatus: "PAYMENT COMPLETED", transactionId },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const viewOrder = async (req, res) => {
  try {
    const { urn } = req.query; // Get URN from query parameters

    if (!urn) {
      return res.status(400).json({
        success: false,
        message: "URN is required",
      });
    }

    const order = await Order.findOne({ urn }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { createOrder, updateOrder, viewOrder };

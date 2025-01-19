const Order = require("../models/orderModel");


const createOrder = async (req, res) => {
    try {
    const { urn, phoneNumber } = req.body;

    if (!urn || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
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
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { urn },
      { paymentStatus: "PAYMENT COMPLETED", transactionId },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const viewOrder = async (req, res) => {
  try {
    const { urn } = req.params; // Assuming the URN is passed as a URL parameter

    if (!urn) {
      return res.status(400).json({ success: false, message: "URN is required" });
    }

    const order = await Order.findOne({ urn });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, updateOrder, viewOrder };

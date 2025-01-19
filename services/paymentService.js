const Payment = require("../models/paymentModel");
const crypto = require("crypto");

const createPayment = async ({ userId, courseId, paymentMode, amount }) => {
  const transactionId = crypto.randomUUID();
  const payment = new Payment({
    userId,
    courseId,
    paymentMode,
    amount,
    transactionId,
  });

  return await payment.save();
};

const verifyTransaction = async (transactionId) => {
  const payment = await Payment.findOne({ transactionId });

  if (!payment) {
    throw new Error("Transaction not found.");
  }

  const isVerified = true;

  if (isVerified) {
    payment.paymentStatus = "completed";
    await payment.save();
  }

  return payment.paymentStatus;
};

module.exports = { createPayment, verifyTransaction };

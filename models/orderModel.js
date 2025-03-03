const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    urn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit mobile number"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["PAYMENT PENDING", "PAYMENT COMPLETED"],
      default: "PAYMENT PENDING",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    invoiceNumber: {
      type: Number,
      unique: true, // Ensures invoice numbers are unique
      sparse: true, // Allows this field to be optional (only present after payment)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);


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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

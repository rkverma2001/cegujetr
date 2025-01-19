const mongoose = require("mongoose");

const courseStatusSchema = new mongoose.Schema(
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
    paymentDate: {
      type: Date,
      required: false, // Will be populated when payment is completed
    },
    paidAmount: {
      type: Number,
      default: 8840, // Default amount as mentioned
    },
    courseStarted: {
      type: Boolean,
      default: false, // Default is false until explicitly updated
    },
    courseStartDate: {
      type: Date,
      required: false, // Only populated when courseStarted is true
    },
    courseEndDate: {
      type: Date,
      required: false,
    },
    certificationCompletionDate: {
      type: Date,
      required: false,
    },
    certificateNo: {
      type: String,
      required: false, // Unique Certificate Number from the course provider
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseStatus", courseStatusSchema);

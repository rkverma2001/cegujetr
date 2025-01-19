const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    urn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit mobile number"],
    },
    userType: {
      type: String,
      required: true,
      enum: [
        "Student",
        "Freelancer",
        "Working Professionals",
        "Un-employed",
        "Admin",
      ],
      default: "Student",
    },
    courseName: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

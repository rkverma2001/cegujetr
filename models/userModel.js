const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    urn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    mobile: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit mobile number"],
    },
    usertype: {
      type: String,
      required: true,
      enum: ["Freelancer", "Working Professionals", "Un-employed", "Student"],
      default: "Student",
    },
    coursename: {
      type: String,
      required: true,
      trim: true,
    },
    coursecode: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    university: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    urn: {
      type: String,
      required: true,
    },
    coursecode: {
      type: String,
      required: true,
    },
    paymentdate: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    coursestartdate: {
      type: String,
      default: null,
    },
    courseenddate: {
      type: String,
      default: null,
    },
    certcompletedate: {
      type: String,
      default: null,
    },
    certificateno: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ApplicationModel = mongoose.model("Application", ApplicationSchema);

module.exports = ApplicationModel;

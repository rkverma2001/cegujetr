const Application = require("../models/applicationModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

// Create Application
const create = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    let user;
    if (!mobile && !email) {
      user = await User.find();
    } else {
      user = await User.findOne({ mobile, email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const order = await Order.findOne({ urn: user.urn }).sort({
      createdAt: -1,
    });
    if (!order) {
      return res
        .status(404)
        .json({ message: "No recent order found for user" });
    }

    const newApplication = new Application({
      urn: user.urn,
      coursecode: user.coursecode,
      paymentdate: order.createdAt,
      amount: "15000", // This should be dynamic
      coursestartdate: null,
      courseenddate: null,
      certcompletedate: null,
      certificateno: null,
      status: "PAYMENT_COMPLETED",
    });

    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const view = async (req, res) => {
  try {
    const { mobile, email } = req.body;
    let applications;

    if (!mobile && !email) {
      applications = await Application.find(); // Get all applications if no filters provided
    } else {
      const user = await User.findOne({ mobile, email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      applications = await Application.find({ urn: user.urn });
      if (!applications.length) {
        return res
          .status(404)
          .json({ message: "No applications found for this user" });
      }
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { urn } = req.params;
    const updates = req.body;
    const application = await Application.findOneAndUpdate({ urn }, updates, {
      new: true,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { urn } = req.params;
    const application = await Application.findOneAndDelete({ urn });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { create, view, update, remove };

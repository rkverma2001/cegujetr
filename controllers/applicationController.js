const Application = require("../models/applicationModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

// Create Application
const create = async (req, res) => {
  try {
    const { urn } = req.body;

    let user;
    if (!urn) {
      user = await User.find();
    } else {
      user = await User.findOne({ urn });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

     // Check if an application already exists for this URN
     const existingApplication = await Application.findOne({ urn });
     if (existingApplication) {
       return res.status(400).json({ message: "Application already exists for this user" });
     }

    const order = await Order.findOne({ urn }).sort({
      createdAt: -1,
    });
    if (!order) {
      return res
        .status(404)
        .json({ message: "No recent order found for user" });
    }

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString("en-GB") : null;
    };

    const newApplication = new Application({
      urn: urn,
      coursecode: user.coursecode,
      paymentdate: formatDate(order.createdAt),
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
    let applications = [];

    if (!mobile && !email) {
      applications = await Application.find().select(
        "urn coursecode paymentdate amount coursestartdate courseenddate certcompletedate certificateno status -_id"
      );
    } else {
      // Ensure mobile or email is provided
      if (!mobile && !email) {
        return res.status(400).json({
          result: "FAILURE",
          error: "Mobile or Email is required",
          applications: [],
        });
      }

      // Find all users matching the given mobile or email
      const users = await User.find({ $or: [{ mobile }, { email }] });
      if (!users.length) {
        return res.status(404).json({
          result: "FAILURE",
          error: "Users not found",
          applications: [],
        });
      }

      const urns = users.map((user) => user.urn).filter(Boolean); // Extract URNs and ensure they are valid
      if (!urns.length) {
        return res.status(404).json({
          result: "FAILURE",
          error: "No valid URNs found for the users",
          applications: [],
        });
      }

      // Fetch applications for all URNs
      applications = await Application.find({ urn: { $in: urns } }).select(
        "urn coursecode paymentdate amount coursestartdate courseenddate certcompletedate certificateno status -_id"
      );

      if (!applications.length) {
        return res.status(404).json({
          result: "FAILURE",
          error: "No applications found for the users",
          applications: [],
        });
      }
    }

    res.json({
      result: "SUCCESS",
      error: null,
      applications,
    });
  } catch (error) {
    console.error("Error in view controller:", error); // Log the error for debugging
    res.status(500).json({
      result: "FAILURE",
      error: "Something went wrong",
      applications: [],
    });
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

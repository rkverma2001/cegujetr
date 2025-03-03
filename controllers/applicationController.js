const Application = require("../models/applicationModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

// Create Application
const create = async (req, res) => {
  try {
    const { urn } = req.body;

    // Fetch user details
    let user;
    if (!urn) {
      user = await User.find();
    } else {
      user = await User.findOne({ urn });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Fetch the most recent order
    const order = await Order.find({ urn }).sort({ createdAt: -1 }).limit(1);
    const latestOrder = order[0]; // Get the latest order

    if (!latestOrder) {
      return res.status(404).json({ message: "No recent order found for user" });
    }

    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = dateObj.getFullYear();
    const currentDate = `${day}-${month}-${year}`;

    // ✅ Auto-update Application when payment is completed
    if (latestOrder.paymentStatus === "PAYMENT COMPLETED") {
      const updatedApplication = await Application.findOneAndUpdate(
        { urn },
        {
          paymentdate: currentDate,
          amount: "8840",
          status: "PAYMENT_COMPLETED",
        },
        { new: true }
      );

      // Check if Application update was successful
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found for update" });
      }
    }

    res.status(201).json({ success: true, message: "Payment status updated successfully" });
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

const enrollCourse = async (req, res) => {
  try {
    
    const { urn } = req.body;

    if (!urn) {

      return res.status(400).json({ success: false, message: "URN is required in the request body" });
    }

    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const year = dateObj.getFullYear();
    const currentDate = `${day}-${month}-${year}`;

    // Find and update the application
    const application = await Application.findOneAndUpdate(
      { urn },
      { status: "COURSE_STARTED", coursestartdate: currentDate },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.status(200).json({ success: true, message: "Course started successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};



module.exports = { create, view, update, remove, enrollCourse };

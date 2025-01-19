const Order = require("../models/orderModel");
const CourseStatus = require("../models/courseStatusModel");

const update = async (req, res) => {
  const { urn, phoneNumber, courseStarted } = req.body;

  if (!urn || !phoneNumber) {
    return res.status(400).json({
      error: "URN and phone number are required",
      status: null,
    });
  }

  try {
    // Find the corresponding order
    const order = await Order.findOne({ urn, phoneNumber });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
        status: null,
      });
    }

    // Check if payment is completed
    if (order.paymentStatus !== "PAYMENT COMPLETED") {
      return res.status(400).json({
        error: "Payment is not completed for this order",
        status: null,
      });
    }

    // Check if a course status entry already exists
    let courseStatus = await CourseStatus.findOne({ urn, phoneNumber });

    if (!courseStatus) {
      // Create a new course status entry
      courseStatus = new CourseStatus({
        urn,
        phoneNumber,
        paymentDate: order.createdAt, // Use order's creation date as payment date
        paidAmount: 8840, // Fixed amount
      });
    }

    // Update course start date if courseStarted is true
    if (courseStarted) {
      courseStatus.courseStarted = true;
      courseStatus.courseStartDate = new Date(); // Set current date as course start date
      courseStatus.courseEndDate = null;
      courseStatus.certificationCompletionDate = null;
      courseStatus.certificateNo = null;
    }

    // Save the course status
    await courseStatus.save();

    res.status(200).json({
      message: "Course status updated successfully",
      courseStatus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

const view = async (req, res) => {
  const { urn, phoneNumber } = req.body;

  // Validate request data
  if (!urn || !phoneNumber) {
    return res.status(400).json({
      error: "URN and phone number are required",
      courseStatus: null,
    });
  }

  try {
    // Find the course status entry by URN and phone number
    const courseStatus = await CourseStatus.findOne({ urn, phoneNumber });

    if (!courseStatus) {
      return res.status(404).json({
        error: "Course status not found",
        courseStatus: null,
      });
    }

    // Return the course status details
    res.status(200).json({
      message: "Course status retrieved successfully",
      courseStatus,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

const getStatus = async (req, res) => {
  const { urn, phoneNumber } = req.body;

  // Validate input
  if (!urn || !phoneNumber) {
    return res.status(400).json({
      error: "URN and phone number are required",
      status: null,
    });
  }

  try {
    // Find the order by URN and phone number
    const order = await Order.findOne({ urn, phoneNumber });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
        status: null,
      });
    }

    // Fetch payment status from the order
    let status;
    if (order.paymentStatus === "PAYMENT PENDING") {
      status = "PAYMENT PENDING";
    } else {
      // If payment is completed, check course and certification statuses
      const courseStatus = await CourseStatus.findOne({ urn, phoneNumber });

      if (!courseStatus) {
        return res.status(404).json({
          error: "Course status not found",
          status: null,
        });
      }

      if (courseStatus.courseStarted && courseStatus.courseEndDate) {
        if (courseStatus.certificationCompletionDate) {
          status = "CERTIFICATION COMPLETED";
        } else {
          status = "CERTIFICATION PENDING";
        }
      } else if (courseStatus.courseStarted) {
        status = "COURSE STARTED";
      } else {
        status = "PAYMENT COMPLETED";
      }
    }

    // Return the determined status
    res.status(200).json({
      message: "Status retrieved successfully",
      status,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
      status: null,
    });
  }
};

module.exports = { update, view, getStatus };

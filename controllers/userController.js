const User = require("../models/userModel");

const create = async (req, res) => {
  try {
    const {
      urn,
      firstName,
      lastName,
      email,
      phoneNumber,
      userType,
      courseName,
    } = req.body;

    if (
      !urn ||
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !userType
    ) {
      return res.status(400).json({
        result: "Fail",
        message: "Missing required fields",
      });
    }

    const newUser = new User({
      urn,
      firstName,
      lastName,
      email,
      phoneNumber,
      userType,
      courseName,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      result: "Success",
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    res.status(500).json({
      result: "Error",
      message: error.message,
    });
  }
};

module.exports = create;

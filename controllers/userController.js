const User = require("../models/userModel");

const create = async (req, res) => {
  try {
    const {
      urn,
      fname,
      lname,
      email,
      mobile,
      usertype,
      coursename,
      coursecode,
      college,
      university,
    } = req.body;

    if (
      !urn ||
      !fname ||
      !lname ||
      !email ||
      !mobile ||
      !usertype ||
      !coursename ||
      !coursecode ||
      !college ||
      !university
    ) {
      return res.status(400).json({
        result: "Fail",
        message: "Missing required fields",
      });
    }

    // Create new user
    const newUser = new User({
      urn,
      fname,
      lname,
      email,
      mobile,
      usertype,
      coursename,
      coursecode,
      college,
      university,
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
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = create;

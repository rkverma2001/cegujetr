const User = require("../models/userModel");
const Application = require("../models/applicationModel");

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

    const existingUser = await User.findOne({ urn });
    if (existingUser) {
      return res.status(400).json({
        result: "FAIL",
        error: "URN must be unique. This URN already exists.",
      });
    }

    // Create new user
    
    let user = await User.findOne({ urn });
    if (!user) {
      user = new User({ urn, fname, lname, email, mobile, usertype, coursename, coursecode, college, university });
      await user.save();
    }

    let application = await Application.findOne({ urn });
    if (!application) {
      application = new Application({
        urn,
        coursecode,
        paymentdate: null,
        amount: null,
        coursestartdate: null,
        courseenddate: null,
        certcompletedate: null,
        certificateno: null,
        status: "USER_REGISTERED",
      });
      await application.save();
    }

    res.status(201).json({
      result: "SUCCESS",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      result: "FAIL",
      error: "something went wrong",
    });
  }
};

module.exports = create;

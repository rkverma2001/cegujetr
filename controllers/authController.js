const Otp = require("../models/otpModel");
const User = require("../models/userModel");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const springedge = require("springedge");
const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    let otpRecord = await Otp.findOne({ phoneNumber });

    if (!otpRecord) {
      otpRecord = new Otp({
        phoneNumber,
        otp: hashedOtp,
        expiry: dayjs().tz("Asia/Kolkata").add(5, "minute"),
      });
    } else {
      otpRecord.otp = hashedOtp;
      otpRecord.expiry = dayjs().tz("Asia/Kolkata").add(5, "minute");
    }

    await otpRecord.save();

    const params = {
      sender: "ETREDU", // Replace with your sender ID
      apikey: process.env.SPRINGEDGE_API_KEY, // Use environment variable for API key
      to: [`+91${phoneNumber}`], // Phone number
      message: `Hello Learner! Your OTP for EtrainIndia is ${otp}. This OTP is valid for 5 minutes.`,
      format: "json",
    };

    // Send OTP using SpringEdge
    springedge.messages.send(params, 5000, function (err, response) {
      if (err) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }
      res.status(200).json({ message: `OTP sent successfully ${otp}` });
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    if (!phoneNumber || !otp) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ phoneNumber });
    if (!otpRecord || dayjs().tz("Asia/Kolkata").isAfter(otp.expiry)) {
      return res.status(404).json({ error: "OTP not found or expired." });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    const now = dayjs().utc();
    const expiryTime = dayjs(otpRecord.expiry).utc();

    // Check OTP expiry
    if (now.isAfter(expiryTime)) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    // Check user existence
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Cleanup OTP record after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "OTP verified successfully",
      data: {
        urn: user.urn,
        firstName: user.firstName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        courseName: user.courseName,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { sendOtp, verifyOtp };

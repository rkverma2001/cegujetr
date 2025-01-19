const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const checkAuth = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    if (!header) {
      throw new Error("Header is not present");
    }

    const token = header.split("Bearer ")[1];
    if (!token) {
      throw new Error("Token is not present");
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    if (!userId) {
      throw new Error("User Id is not present");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    res.locals.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = { checkAuth };

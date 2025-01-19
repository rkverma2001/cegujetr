const dotenv = require("dotenv");
dotenv.config();
const API_KEY = process.env.API_KEY;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const authenticate = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const authToken = req.headers["authorization"];

  if (!apiKey || !authToken) {
    return res.status(401).json({
      result: "Fail",
      message: "API key and token are required",
    });
  }

  if (apiKey !== API_KEY || authToken !== AUTH_TOKEN) {
    return res.status(403).json({
      result: "Fail",
      message: "Invalid API key or token",
    });
  }

  next();
};

module.exports = authenticate;

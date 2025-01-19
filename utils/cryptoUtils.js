const crypto = require("crypto");

const generateTransactionId = () => {
  return crypto.randomBytes(16).toString("hex");
};

module.exports = { generateTransactionId };

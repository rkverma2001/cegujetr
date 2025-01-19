const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

let renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, "../views/mailer", relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log("Error in rendering template");
        return;
      }

      mailHTML = template;
    }
  );

  return mailHTML;
};

module.exports = {
  transporter,
  renderTemplate,
};

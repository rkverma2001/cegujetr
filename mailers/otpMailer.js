const nodemailer = require("../config/nodemailer");

const sendOtpMailer = (otp, mail) => {
  let htmlString = nodemailer.renderTemplate({ otp: otp }, "./otpMailer.ejs");
  nodemailer.transporter.sendMail(
    {
      from: "riteshkverma2001@gmail.com",
      to: mail,
      subject: "One-Time Password (OTP) Verification for DST IBM portal?",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
      console.log("Message sent", info);
    }
  );
};

module.exports = { sendOtpMailer };

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
require("dotenv").config();

const GST_RATE = 0.18;
const BASE_AMOUNT = 8840;
const GST_AMOUNT = BASE_AMOUNT * GST_RATE;
const TOTAL_AMOUNT = BASE_AMOUNT + GST_AMOUNT;
const GST_NUMBER = "YOUR_GST_NUMBER";

const generateInvoice = async (order) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const templatePath = path.join(__dirname, "../views/invoice.ejs");
    const user = await User.findById(order.user);
    
    const html = await ejs.renderFile(templatePath, {
      user,
      order,
      gstNumber: GST_NUMBER,
      baseAmount: BASE_AMOUNT,
      gstAmount: GST_AMOUNT,
      totalAmount: TOTAL_AMOUNT,
    });
    
    await page.setContent(html);
    const pdfPath = `invoices/invoice_${order.urn}.pdf`;
    await page.pdf({ path: pdfPath, format: "A4" });
    
    await browser.close();
    return pdfPath;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Invoice generation failed");
  }
};

const sendInvoiceEmail = async (userEmail, pdfPath) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: userEmail,
    subject: "Payment Invoice",
    text: "Please find attached your payment invoice.",
    attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
  };

  await transporter.sendMail(mailOptions);
};

const handlePaymentSuccess = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const order = await Order.findOne({ transactionId: razorpay_order_id }).populate("user");
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "PAYMENT COMPLETED") {
      const pdfPath = await generateInvoice(order);
      await sendInvoiceEmail(order.user.email, pdfPath);
      
      return res.status(200).json({ success: true, message: "Invoice generated and sent" });
    } else {
      return res.status(400).json({ success: false, message: "Payment is not completed yet." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handlePaymentSuccess };

const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const {promisify} = require("util");

dotenv.config();

const GST_RATE = 0.18;
const BASE_AMOUNT = 8840;
const GST_AMOUNT = BASE_AMOUNT * GST_RATE;
const TOTAL_AMOUNT = BASE_AMOUNT + GST_AMOUNT;
const GST_NUMBER = "YOUR_GST_NUMBER";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const mkdirAsync = promisify(fs.mkdir);

const checkout = async (req, res) => {
  try {
    const { amount, urn, phoneNumber } = req.body;

    if (!amount || !urn || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existingOrder = await Order.findOne({
      urn,
      paymentStatus: "PAYMENT PENDING",
    });

    // If there is a pending order, cancel it and allow a new one to be created
    if (existingOrder) {
      await Order.deleteOne({ _id: existingOrder._id });
    }

    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    const newOrder = await Order.create({
      urn,
      phoneNumber,
      paymentStatus: "PAYMENT PENDING",
      transactionId: razorpayOrder.id,
      amount,
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateInvoice = async (order, user) => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load Invoice Template
    const templatePath = path.join(__dirname, "../templates/invoice.ejs");
    const html = await ejs.renderFile(templatePath, {
      user,
      order,
      gstNumber: process.env.GST_NUMBER || "GST123456789",
      baseAmount: process.env.BASE_AMOUNT || 1000,
      gstAmount: process.env.GST_AMOUNT || 180,
      totalAmount: process.env.TOTAL_AMOUNT || 1180,
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Ensure the invoices directory exists
    const invoicesDir = path.join(__dirname, "../invoices");
    await mkdirAsync(invoicesDir, { recursive: true }).catch((err) => {
      if (err.code !== "EEXIST") throw err;
    });

    // Fetch last invoice number and generate a new one
    const lastInvoice = await Order.findOne().sort({ invoiceNumber: -1 });
    let newInvoiceNumber = lastInvoice && lastInvoice.invoiceNumber ? lastInvoice.invoiceNumber + 1 : 1000;

    if (isNaN(newInvoiceNumber)) {
      throw new Error("Invalid invoice number generated.");
    }

    // Assign invoice number to order and save
    order.invoiceNumber = newInvoiceNumber;
    await order.save();

    // Generate invoice PDF
    const pdfPath = path.join(invoicesDir, `invoice_${newInvoiceNumber}.pdf`);
    await page.pdf({ path: pdfPath, format: "A4" });

    return pdfPath;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Invoice generation failed");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};


const sendInvoiceEmail = async (userEmail, pdfPath) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  const companyLogoUrl = "https://cdn-ilbfgjf.nitrocdn.com/nzIgKXIgteHtWUHyirsKlqGuYxUDSdsu/assets/images/optimized/rev-5c51e54/www.etrainindia.com/wp-content/uploads/2023/01/etrain-india-logo-1.png";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
        .container { background: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0px 0px 10px #ccc; }
        .header { text-align: center; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .details { padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f2f2f2; margin-bottom: 20px; }
        .details p { margin: 5px 0; font-size: 14px; }
        .product-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .product-table th, .product-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .product-table th { background: #0073e6; color: white; }
        .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 10px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${companyLogoUrl}" alt="Company Logo" class="logo">
          <h2>Payment Invoice</h2>
        </div>

        <div class="details">
          <p><strong>Invoice Number:</strong> 1000</p>
          <p><strong>Invoice Date:</strong> 28/02/2025</p>
          <p><strong>Customer Name:</strong> Ritesh Kumar</p>
          <p><strong>Course Name:</strong> Blockchain Developer</p>
          <p><strong>Course Code:</strong> DSRETL001</p>
          <p><strong>College:</strong> XYZ College</p>
          <p><strong>University:</strong> University </p>
        </div>

        <h3>Order Details</h3>
        <table class="product-table">
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
          <tr>
            <td>Blockchain Developer</td>
            <td>1</td>
            <td>₹8,840</td>
          </tr>
        </table>

        <div class="total">
          <p><strong>Base Amount:</strong> ₹8,840</p>
          <p><strong>GST Amount (18%):</strong> ₹1,442</p>
          <p><strong>Subtotal:</strong> ₹10,282</p>
          <p><strong>Total:</strong> ₹10,282 (includes ₹1,442 taxes)</p>
        </div>

        <div class="footer">
          <p><strong>Etrain Education Private Limited</strong></p>
          <p>1211, 12th Floor Hemkunt Chambers 89, Nehru Place, New Delhi – 110019</p>
          <p><a href="https://www.etrainindia.com">www.etrainindia.com</a> | support@etrainindia.com</p>
          <p>Contact: 9654232249 | 9958830205</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: userEmail,
    subject: "Your Invoice from Etrain Education",
    html: emailHtml,
    attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
  };

  await transporter.sendMail(mailOptions);
};

const paymentVerification = async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in request body",
      });
    }

    const order = await Order.findOne({ transactionId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or expired" });
    }

    if (order.paymentStatus === "PAYMENT COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    order.paymentStatus = "PAYMENT COMPLETED";
    await order.save();

    const user = await User.findOne({ urn: order.urn });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pdfPath = await generateInvoice(order, user);

    await sendInvoiceEmail(user.email, pdfPath);

    res.redirect(
      `https://cegujarat.etraineducation.com/payment-success?reference=${razorpay_payment_id}`
    );
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
      error: error.message,
    });
  }
};


module.exports = { checkout, paymentVerification };

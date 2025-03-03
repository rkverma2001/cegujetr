const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const generateInvoice = async (invoiceData) => {
    const template = fs.readFileSync(path.join(__dirname, "../templates/invoice.ejs"), "utf-8");
    const html = ejs.render(template, { invoice: invoiceData });
  const pdfPath = `./storage/${invoiceData.invoiceNumber}.pdf`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  await browser.close();

  return pdfPath;
}

const sendInvoice = async (email, invoiceData, pdfPath) => {

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Your Invoice - " + invoiceData.invoiceNumber,
        html: `<h3>Invoice Details</h3>
               <p><b>Invoice Number:</b> ${invoiceData.invoiceNumber}</p>
               <p><b>Course:</b> ${invoiceData.courseName}</p>
               <p><b>Amount:</b> ₹${invoiceData.amount}</p>
               <p><b>GST (18%):</b> ₹${invoiceData.gstAmount}</p>
               <p><b>Total:</b> ₹${invoiceData.amount + invoiceData.gstAmount}</p>`,
        attachments: [{ filename: "invoice.pdf", path: pdfPath }],
      });
}

module.exports = { generateInvoice, sendInvoice };
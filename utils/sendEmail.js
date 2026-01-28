// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Hostel Booking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('EMAIL SEND ERROR:', err);
    throw err;
  }
};

module.exports = sendEmail;

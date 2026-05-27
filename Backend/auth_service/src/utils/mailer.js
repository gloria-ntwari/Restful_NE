const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'gloriantwari@gmail.com',
    pass: process.env.SMTP_PASS || 'rvqy bbxn bdui bzrt',
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection failed:', error.message);
  } else {
    console.log('✅ SMTP Connection established successfully. Ready to send emails.');
  }
});

const sendOtpEmail = async (email, firstName, otp) => {
  const mailOptions = {
    from: `"XWZ Parking System" <${process.env.SMTP_USER || 'gloriantwari@gmail.com'}>`,
    to: email,
    subject: 'XWZ Parking - Email Verification OTP',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #255169; margin: 0; font-size: 24px; font-weight: 700;">XWZ CAR PARKING</h2>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Management System</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;">
        <h3 style="color: #1e293b; margin-top: 0; font-size: 18px; font-weight: 600;">Hello ${firstName},</h3>
        <p style="color: #334155; line-height: 1.6; font-size: 15px;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #255169; background-color: #f8fafc; padding: 12px 24px; border-radius: 8px; border: 2px dashed #cbd5e1; display: inline-block; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #ef4444; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Important Details:</p>
        <ul style="color: #475569; font-size: 14px; margin-top: 0; padding-left: 20px; line-height: 1.6;">
          <li>This code is valid for <strong>15 minutes</strong>.</li>
          <li>Never share this code with anyone.</li>
        </ul>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 24px;">If you did not request this verification, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;">
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 XWZ Parking Ltd. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };

const nodemailer = require("nodemailer");
const logger = require("../config/winston");

const sendEmail = async (options) => {
  try {
    console.log("Sending Email with Options:", options);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"IMC Business Solutions" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || "🔐 IMC Password Reset OTP",
      text:
        options.message ||
        "Please use the provided OTP to reset your password.",
      html:
        options.html ||
        "<p>Please use the provided OTP to reset your password.</p>",
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    logger.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;

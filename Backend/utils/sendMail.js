import nodemailer from "nodemailer";

export const sendOTPEmail = async (toEmail, otp, userName = "there") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // 🔥 important (587 ke saath false)
      auth: {
        user: process.env.BREVO_USER, // 👈 SMTP login
        pass: process.env.BREVO_PASS, // 👈 SMTP key
      },
    });

    const mailOptions = {
      from: `"Tallow Care" <${process.env.BREVO_USER}>`,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Hello ${userName},\n\nYour OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\n- Tallow Care Team`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

  } catch (err) {
    console.error("❌ MAIL ERROR FULL:", err);
    throw err;
  }
};

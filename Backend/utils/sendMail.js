import nodemailer from "nodemailer";

export const sendOTPEmail = async (toEmail, otp, userName = "there") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // 🔥 important
      }
    });

    const mailOptions = {
      from: `"Tallow Care" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

  } catch (err) {
    console.error("❌ MAIL ERROR FULL:", err);
    throw err;
  }
};

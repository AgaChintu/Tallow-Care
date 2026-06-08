console.log("ENV CHECK:");
console.log("USER:", process.env.GMAIL_USER);
console.log("PASS:", process.env.GMAIL_APP_PASSWORD);
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // 🔥 CHANGE (587 hata)
  secure: true, // 🔥 IMPORTANT
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  family: 4, // 🔥 FORCE IPv4 (THIS FIXES YOUR ERROR)
});

  // ✅ DEBUG (must)
  try {
    await transporter.verify();
    console.log("✅ SMTP SERVER READY");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err);
  }

  return transporter;
};

export const sendOTPEmail = async (toEmail, otp, userName = 'there') => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Tallow Care" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

  } catch (err) {
    console.error("❌ MAIL ERROR FULL:", err);
    throw err;
  }
};

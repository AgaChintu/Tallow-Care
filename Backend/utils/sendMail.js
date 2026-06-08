import fetch from "node-fetch";

export const sendOTPEmail = async (toEmail, otp, userName = "User") => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Tallow Care",
          email: process.env.BREVO_USER, // ✅ MUST be verified in Brevo
        },
        to: [
          {
            email: toEmail,
            name: userName,
          },
        ],
        subject: "Your OTP Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hello ${userName},</h2>
            <p>Your OTP is:</p>
            <h1 style="color: #2c3e50;">${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    // ✅ Proper status check
    if (response.status === 201) {
      console.log("✅ OTP EMAIL SENT SUCCESS");
      console.log("📩 Message ID:", data.messageId);
    } else {
      console.log("❌ EMAIL FAILED");
      console.log("🔍 Response:", data);
    }

    return data;

  } catch (err) {
    console.error("🔥 MAIL ERROR:", err.message);
    throw err;
  }
};

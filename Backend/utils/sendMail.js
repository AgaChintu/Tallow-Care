import fetch from "node-fetch";

export const sendOTPEmail = async (toEmail, otp, userName) => {
  try {
    const safeName = userName || "User";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Tallow Care",
          email: process.env.BREVO_USER,
        },
        to: [
          {
            email: toEmail,
            name: safeName,
          },
        ],
        subject: "Your OTP Code",
        htmlContent: `<h2>Hello ${safeName}</h2><h1>${otp}</h1>`,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log("✅ OTP EMAIL SENT SUCCESS");
    } else {
      console.log("❌ EMAIL FAILED", data);
    }

  } catch (err) {
    console.error("🔥 MAIL ERROR:", err);
  }
};

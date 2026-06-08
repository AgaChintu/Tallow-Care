

export const sendOTPEmail = async (toEmail, otp, userName = "there") => {
  try {
    console.log("🔥 API KEY:", process.env.BREVO_API_KEY); // debug

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // 🔥 MAIN LINE
      },
      body: JSON.stringify({
        sender: {
          name: "Tallow Care",
          email: process.env.BREVO_USER,
        },
        to: [
          {
            email: toEmail,
            name: userName,
          },
        ],
        subject: "Your OTP Code",
        textContent: `Hello ${userName}, your OTP is ${otp}`,
      }),
    });

    const data = await response.json();

    console.log("✅ EMAIL RESPONSE:", data);

  } catch (err) {
    console.error("❌ MAIL ERROR:", err);
    throw err;
  }
};

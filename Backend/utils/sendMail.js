export const sendOTPEmail = async (toEmail, otp, userName = "there") => {
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
          email: process.env.BREVO_USER,
        },
        to: [{ email: toEmail, name: userName }],
        subject: "Your OTP Code",
        textContent: `Your OTP is ${otp}`,
      }),
    });

    const data = await response.json();
    console.log("EMAIL RESPONSE:", data);

  } catch (err) {
    console.error("MAIL ERROR:", err);
    throw err;
  }
};

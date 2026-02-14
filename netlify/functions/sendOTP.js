const { getStore } = require("@netlify/blobs");

const store = getStore("otpStore");

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Expiry: 5 minutes from now
    const expires = Date.now() + 5 * 60 * 1000;

    // Store in Netlify Blob store
    await store.set(email, { otp, expires });

    console.log(`OTP for ${email}: ${otp}`); 
    // For demo testing only. Remove later.

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OTP sent successfully" })
    };

  } catch (error) {
    console.error("Send OTP error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send OTP" })
    };
  }
};


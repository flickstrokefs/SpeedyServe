const { getStore } = require("@netlify/blobs");

const store = getStore("otpStore");

exports.handler = async (event) => {
  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and OTP required" })
      };
    }

    const record = await store.get(email);

    if (!record) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "OTP not found or expired" })
      };
    }

    // record structure example:
    // { otp: "1234", expires: 123456789 }

    if (Date.now() > record.expires) {
      await store.delete(email);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "OTP expired" })
      };
    }

    if (otp !== record.otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid OTP" })
      };
    }

    // OTP valid → delete it (one-time use)
    await store.delete(email);

    const user = {
      id: Date.now(),
      name: email.split("@")[0],
      email
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ user })
    };

  } catch (error) {
    console.error("Verify OTP error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};

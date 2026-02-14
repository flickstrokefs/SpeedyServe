const otpStore = require("./otpStore");

exports.handler = async (event) => {
  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and OTP required" })
      };
    }

    const record = otpStore[email];

    if (!record) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "OTP not found" })
      };
    }

    if (Date.now() > record.expires) {
      delete otpStore[email];
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

    // OTP valid → delete it
    delete otpStore[email];

    const user = {
      id: Date.now(),
      name: email.split("@")[0],
      email
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ user })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};

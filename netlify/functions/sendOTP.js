const otpStore = require("./otpStore");

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email required" })
      };
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log("OTP:", otp);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OTP sent" })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};

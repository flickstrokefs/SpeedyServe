const emailjs = require("@emailjs/nodejs");

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    console.log("Generated OTP:", otp);

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: otp
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    );

    console.log("EmailJS response:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OTP sent successfully" })
    };

  } catch (error) {
    console.error("EmailJS ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

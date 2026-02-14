exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  if (!data.name || !data.service) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" })
    };
  }

  // pretend database save here
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Booking successfully created",
      bookingId: Date.now()
    })
  };
};

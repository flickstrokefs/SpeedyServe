exports.handler = async (event) => {
  const { service } = event.queryStringParameters;

  const providers = [
    { name: "Ravi", service: "Plumber" },
    { name: "Aman", service: "Electrician" }
  ];

  const filtered = providers.filter(p => p.service === service);

  return {
    statusCode: 200,
    body: JSON.stringify(filtered)
  };
};
